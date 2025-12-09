import { getUser } from '../utils/auth.js';
import { GameMode, PresenceUser, PresenceCallback, Tournament } from '../frontendTypes.js';
import { renderProfile } from '../pages/profile.js';
import { renderProfiles } from '../pages/renderProfiles.js';
import { renderFriendRequestsList } from '../pages/renderFriendRequestList.js';
import { renderFriendsList } from '../pages/renderFriends.js';


function setOnlineStatusOffline() {
	const status_symbol_navbar = document.getElementById('status_symbol');
	const user_list = document.getElementById('active-users-count');
	const status_symbol_profile = document.getElementById('logged_in');

	if (status_symbol_navbar) {
		status_symbol_navbar.classList.remove('bg-green-400');
		status_symbol_navbar.classList.add('bg-red-400');
	}
	if (user_list) {
		user_list.innerText = 'Connection lost...';
	}
	if (status_symbol_profile) {
		status_symbol_profile.classList.remove('bg-green-400');
		status_symbol_profile.classList.add('bg-red-400');
	}
}

function setOnlineStatusOnline() {
}


class WebSocketManager {
	// Basic WebSocket connections
	private gameSocket: WebSocket | null = null;
	private presenceSocket: WebSocket | null = null;
	private localTournamentSocket: WebSocket | null = null;
	private onlineTournamentSocket: WebSocket | null = null;

	// Presence WebSocket state
	private MAX_RETRY = 10;
	private retryAttempts = 0;
	private reconnectTimeout: any = null;
	private activeUserCount = 0;
	private activeTournaments: Tournament[] = [];
	private presenceUsers: PresenceUser[] = [];
	private presenceListeners: PresenceCallback[] = [];
	constructor() {
	}

	///////////////////////////////////
	// -------- GAME SOCKET -------- //
	///////////////////////////////////

	createGameSocket(mode: GameMode): WebSocket | null {
		if (this.gameSocket && this.gameSocket.readyState === WebSocket.OPEN) {
			console.warn('🕹️ [Game WS] Already connected');
			return this.gameSocket;
		}

		const user = getUser();
		if (!user) return null;

		let url = `/ws/game?mode=${mode}`;


		const socket = new WebSocket(url);
		this.gameSocket = socket;

		socket.onopen = () => {
			console.log('🕹️ [Game WS] Connected');
			socket.send('pong');
		}

		socket.onmessage = (e) => {
			if (e.data === 'ping') socket.send('pong');
			else console.log('🕹️ [Game WS] Message:', e.data);
		};

		socket.onclose = () => {
			console.log('🕹️ [Game WS] Disconnected');
			this.gameSocket = null;
		};
		socket.onerror = async (event: any) => {
			if (getUser()) {
				const res = await fetch('/api/refresh', {
					method: 'POST',
					credentials: 'include'
				})
				if (res.ok) {
					this.createGameSocket(mode);
				}
			}
		}

		return socket;
	}

	disconnectGameSocket() {
		if (this.gameSocket) {
			try {
				if (this.gameSocket.readyState === WebSocket.OPEN) {
					this.gameSocket.send('quit');
					console.log('🕹️ [Game WS] Sent quit message');
				}
			} catch { }
			const socket = this.gameSocket;
			socket.onclose = () => {
				this.gameSocket = null;
			}
			console.log('closing socket on disconnect gamesocket call')
			socket.close();
		}
	}

	///////////////////////////////////////
	// -------- PRESENCE SOCKET -------- //
	///////////////////////////////////////




	connectPresenceSocket(onUpdate?: (msg: any) => void) {
		if (this.presenceSocket) {
			console.log('already present')
			return;
		}

		const url = `/ws/presence`;
		const socket = new WebSocket(url);
		this.presenceSocket = socket;

		socket.onopen = () => {
			console.log('👥 [Presence WS] Opening websocket..');
			socket.send('pong');
			this.retryAttempts = 0;
		};

		socket.onmessage = (e) => {
			console.log(e)
			if (e.data === 'ping'){
				socket.send('pong');
			}
			else {
				try {
					const msg = JSON.parse(e.data);
					console.log('👥 [Presence WS] Message:', msg);
					if (msg.type === 'presenceUpdate') {
						this.activeUserCount = msg.count || 0;
						this.presenceUsers = msg.users || [];
					} else if (msg.type === 'tournamentUpdate') {
						this.activeTournaments = msg.tournaments;
					}
					else if (msg.type === 'renderUpdate')
					{
						console.log('[ RENDERUPDATE ]')
						renderProfiles();
						renderFriendRequestsList();
						renderFriendsList();
					}
					this.notifyPresenceListeners();
					onUpdate?.(msg);
				} catch (e) {
					console.warn('👥 [Presence WS] Invalid message:', e);
				}
			}
		};

		socket.onclose = (e) => {
			console.log('👥 [Presence WS] Disconnected! Reason: ', e.reason);
			this.presenceSocket = null;
			this.disconnectGameSocket();
			this.disconnectLocalTournamentSocket();
			this.disconnectOnlineTournamentSocket();
			if (e.code === 4003) return;

			setOnlineStatusOffline();
			if (getUser()) {
				console.log(`👥 [Presence WS] Retry attempt `);
				this.reconnectTimeout = setTimeout(() => {
					this.connectPresenceSocket(onUpdate)
				}, 10000);
			} else {
				console.warn(`👥 [Presence WS] Closed.`);
			}
		};

		socket.onerror = async (err) => {
			console.error('👥 [Presence WS] Error:', err);
			// refresh access token in case it turned invalid. check once on connect error if not ok then dont try again
			if (getUser()) {
				const res = await fetch('/api/refresh', {
					method: 'POST',
					credentials: 'include'
				})
				if (res.ok) {
					this.connectPresenceSocket(onUpdate);
				}
			}
		};
	}

	disconnectPresenceSocket() {
		console.log('disconnectPresenceSocket');
		if (this.reconnectTimeout) clearTimeout(this.reconnectTimeout);
		if (this.presenceSocket) {
			this.presenceSocket.close(4000, "Logout");
			this.presenceSocket = null;
		}
	}

	subscribeToPresence(cb: PresenceCallback) {
		if (!this.presenceListeners.includes(cb)) {
			this.presenceListeners.push(cb);
		}
	}

	clearPresenceData() {
		this.activeUserCount = 0;
		this.presenceUsers = [];
		this.notifyPresenceListeners();
	}

	private notifyPresenceListeners() {
		for (const cb of this.presenceListeners) {
			cb(this.activeUserCount, this.activeTournaments);
		}
	}

	///////////////////////////////////////////////
	// -------- LOCAL TOURNAMENT SOCKET -------- //
	///////////////////////////////////////////////

	connectLocalTournamentSocket(
		size: 4 | 8,
		onMessage?: (msg: any) => void,
		names?: string[]
	): WebSocket | null {
		if (this.localTournamentSocket) this.disconnectLocalTournamentSocket();

		const action = 'create';
		const user = getUser();
		if (!user) return null;

		let url = `/ws/local-tournament?action=${action}&size=${size}&names=${encodeURIComponent(JSON.stringify(names))}`;

		const socket = new WebSocket(url);
		this.localTournamentSocket = socket;

		socket.onopen = () => {
			console.log('🎯 [LOCAL Tournament WS] Connected:', url);
			socket.send('pong');
		}

		socket.onmessage = (e) => {
			if (e.data === 'ping'){
				socket.send('pong');
			}
			else {
				try {
					const msg = JSON.parse(e.data);
					console.log('🎯 [LOCAL Tournament WS] Message:', msg);
					onMessage?.(msg);
				} catch {
					console.warn('🎯 [LOCAL Tournament WS] Message:', e.data);
				}
			}
		};

		socket.onerror = (err) => {
			console.error('🎯 [LOCAL Tournament WS] Error:', err);
		};

		socket.onclose = () => {
			console.log('🎯 [LOCAL Tournament WS] Disconnected');
			this.localTournamentSocket = null;
		};

		return socket;
	}

	disconnectLocalTournamentSocket() {
		if (this.localTournamentSocket) {
			console.log('🎯 [LOCAL Tournament WS] Manually disconnecting');
			try {
				this.localTournamentSocket.send(JSON.stringify({ type: 'quitLocalTournament' }));
			} catch { }
			this.localTournamentSocket.close();
		}
	}

	quitLocalTournament() {
		console.log("quit ", this.localTournamentSocket)
		if (this.localTournamentSocket?.readyState === WebSocket.OPEN) {
			this.localTournamentSocket.send(JSON.stringify({ type: 'quitLocalTournament' }));
			console.log('🎯 [LOCAL Tournament WS] Sending quitLocalTournament');
		}
	}

	////////////////////////////////////////////////
	// -------- ONLINE TOURNAMENT SOCKET -------- //
	////////////////////////////////////////////////

	connectOnlineTournamentSocket(
		action: 'join' | 'create',
		size: 4 | 8,
		id?: number,
		onMessage?: (msg: any) => void,
	): WebSocket | null {
		if (this.onlineTournamentSocket) this.disconnectOnlineTournamentSocket();

		const user = getUser();
		if (!user) return null;

		let url = `/ws/online-tournament?action=${action}&size=${size}`;
		if (action === 'join' && id) url += `&id=${id}`;

		const socket = new WebSocket(url);
		this.onlineTournamentSocket = socket;

		socket.onopen = () => {
			console.log('🎯 [ONLINE Tournament WS] Connected:', url);
			socket.send('pong');
		}

		socket.onmessage = (e) => {
			if (e.data === 'ping'){
				socket.send('pong');
			}
			else {
				try {
					const msg = JSON.parse(e.data);
					console.log('🎯 [ONLINE Tournament WS] Message:', msg);
					onMessage?.(msg);
				} catch {
					console.warn('🎯 [ONLINE Tournament WS] Message:', e.data);
				}
			}
		};

		socket.onerror = (err) => {
			console.error('🎯 [ONLINE Tournament WS] Error:', err);
		};

		socket.onclose = () => {
			console.log('🎯 [ONLINE Tournament WS] Disconnected');
			this.onlineTournamentSocket = null;
		};

		return socket;
	}

	disconnectOnlineTournamentSocket() {
		if (this.onlineTournamentSocket) {
			console.log('🎯 [ONLINE Tournament WS] Manually disconnecting');
			try {
				this.onlineTournamentSocket.send(JSON.stringify({ type: 'quitOnlineTournament' }));
			} catch { }
			this.onlineTournamentSocket.close();
		}
	}

	quitOnlineTournament() {
		console.log("quitOnlineTournament", this.onlineTournamentSocket)
		if (this.onlineTournamentSocket?.readyState === WebSocket.OPEN) {
			this.onlineTournamentSocket.send(JSON.stringify({ type: 'quitOnlineTournament' }));
			console.log('🎯 [ONLINE Tournament WS] Sending quitOnlineTournament');
		}
	}

	/////////////////////////////////
	// -------- ACCESSORS -------- //
	/////////////////////////////////

	get gameWS() {
		return this.gameSocket;
	}

	get presenceWS() {
		return this.presenceSocket;
	}

	get localTournamentWS() {
		return this.localTournamentSocket;
	}

	get onlineTournamentWS() {
		return this.onlineTournamentSocket;
	}

	get onlineUserCount() {
		return this.activeUserCount;
	}

	get presenceUserList(): PresenceUser[] {
		return this.presenceUsers;
	}

	get onlineTournaments() {
		return this.activeTournaments;
	}

	///////////////////////////////////
	// ----- GLOBAL DISCONNECT ----- //
	///////////////////////////////////

	disconnectAllSockets() {
		this.disconnectPresenceSocket();
		this.disconnectGameSocket();
		this.disconnectLocalTournamentSocket();
		this.disconnectOnlineTournamentSocket();
	}
}

export const wsManager = new WebSocketManager();
