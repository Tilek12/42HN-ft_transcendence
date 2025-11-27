import { getUser } from '../utils/auth.js';
import { GameMode, PresenceUser, PresenceCallback } from '../types.js';

class WebSocketManager {
	// Basic WebSocket connections
	private gameSocket: WebSocket | null = null;
	private presenceSocket: WebSocket | null = null;
	private tournamentSocket: WebSocket | null = null;

	// Presence WebSocket state
	private MAX_RETRY = 10;
	private retryAttempts = 0;
	private reconnectTimeout: any = null;
	private activeUserCount = 0;
	private activeTournaments: any[] = [];
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
		}

		socket.onmessage = (e) => {
			if (e.data === 'ping') socket.send('pong');
			else console.log('🕹️ [Game WS] Message:', e.data);
		};

		socket.onclose = () => {
			console.log('🕹️ [Game WS] Disconnected');
			this.gameSocket = null;
		};

		return socket;
	}

	disconnectGameSocket() {
		if (this.gameSocket) {
			try {
				if (this.gameSocket.readyState === WebSocket.OPEN) {
					this.gameSocket.send('quit');
				}
			} catch { }
			const socket = this.gameSocket;
			socket.onclose = () => {
				this.gameSocket = null;
			}
			socket.close();
		}
	}

	///////////////////////////////////////
	// -------- PRESENCE SOCKET -------- //
	///////////////////////////////////////

	connectPresenceSocket(onUpdate?: (msg: any) => void) {
		if (this.presenceSocket) 
		{
			console.log('already present')
			return;
		}

		const url = `/ws/presence`;
		const socket = new WebSocket(url);
		this.presenceSocket = socket;

		socket.onopen = () => {
			console.log('👥 [Presence WS] Opening websocket..');
			socket.send("pong");
			this.retryAttempts = 0;
		};

		socket.onmessage = (e) => {
			console.log(e)
			if (e.data === 'ping')
				socket.send('pong');
			else {
				try {
					const msg = JSON.parse(e.data);
					console.log('👥 [Presence WS] Message:', msg);
					if (msg.type === 'presenceUpdate') {
						this.activeUserCount = msg.count || 0;
						this.presenceUsers = msg.users || [];
					} else if (msg.type === 'tournamentUpdate') {
						this.activeTournaments = msg.tournaments || [];
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
			this.disconnectTournamentSocket();
			if (e.code === 4003) return;

			this.retryAttempts++;
			if (getUser()) {
				console.log(`👥 [Presence WS] Retry attempt ${this.retryAttempts}/${this.MAX_RETRY}`);
				this.reconnectTimeout = setTimeout(() => {
					const status_symbol = document.getElementById('status_symbol');
					const user_list = document.getElementById('active-users-count');
					const status2 = document.getElementById('logged_in');
					if (status_symbol){
						status_symbol.classList.remove('bg-green-400');						status_symbol.classList.remove('bg-green-400');
						status_symbol.classList.add('bg-red-400');
					}
					if (user_list)user_list.innerText = 'Connection lost...';
					if (status2){
						status2.classList.remove('bg-green-400');
						status2.classList.add('bg-red-400');
					}
					this.connectPresenceSocket(onUpdate)}, 3000);
			} else {
				console.warn(`👥 [Presence WS] Stopped trying to reconnect after ${this.MAX_RETRY} attempts.`);
			}
		};

		socket.onerror = (err) => {
			console.error('👥 [Presence WS] Error:', err);
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

	subscribeToPresence(cb: PresenceCallback): () => void {
		this.presenceListeners.push(cb);
		cb(this.activeUserCount, this.presenceUsers);
		return () => {
			this.presenceListeners = this.presenceListeners.filter(fn => fn !== cb);
		};
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

	/////////////////////////////////////////
	// -------- TOURNAMENT SOCKET -------- //
	/////////////////////////////////////////

	connectTournamentSocket(
		action: 'join' | 'create',
		size: 4 | 8,
		id?: string,
		onMessage?: (msg: any) => void,
		mode: 'local' | 'online' = 'online',
		names?: string[]
	): WebSocket | null {
		if (this.tournamentSocket) this.disconnectTournamentSocket();

		const user = getUser();
		if (!user) return null;

		let url = `/ws/tournament?mode=${mode}&action=${action}&size=${size}`;
		if (action === 'join' && id) url += `&id=${id}`;
		while (names && names.length > 0)
		{
			const name = names.pop();
			if (name)
				url += `&names=${name}`;
			
		} 

		const socket = new WebSocket(url);
		this.tournamentSocket = socket;

		socket.onopen = () => {
			console.log('🎯 [Tournament WS] Connected:', url);
		}

		socket.onmessage = (e) => {
			if (e.data === 'ping') socket.send('pong');
			else {
				try {
					const msg = JSON.parse(e.data);
					console.log('🎯 [Tournament WS] Message:', msg);
					onMessage?.(msg);
				} catch {
					console.warn('🎯 [Tournament WS] Message:', e.data);
				}
			}
		};

		socket.onerror = (err) => {
			console.error('🎯 [Tournament WS] Error:', err);
		};

		socket.onclose = () => {
			console.log('🎯 [Tournament WS] Disconnected');
			this.tournamentSocket = null;
		};

		return socket;
	}

	disconnectTournamentSocket() {
		if (this.tournamentSocket) {
			console.log('🎯 [Tournament WS] Manually disconnecting');
			try {
				this.tournamentSocket.send(JSON.stringify({ type: 'quitTournament' }));
			} catch { }
			this.tournamentSocket.close();
		}
	}

	quitTournament() {
		console.log("quit ", this.tournamentSocket)
		if (this.tournamentSocket?.readyState === WebSocket.OPEN) {
			console.log('🎯 [Tournament WS] Sending quitTournament');
			this.tournamentSocket.send(JSON.stringify({ type: 'quitTournament' }));
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

	get tournamentWS() {
		return this.tournamentSocket;
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
		this.disconnectTournamentSocket();
	}
}

export const wsManager = new WebSocketManager();
