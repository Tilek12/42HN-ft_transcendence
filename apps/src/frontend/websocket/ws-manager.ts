import { getToken } from '../utils/auth';
import { GameMode, PresenceUser, PresenceCallback } from '../types';

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

  createGameSocket(mode: GameMode, size?: 4 | 8, id?: string): WebSocket | null {
    if (this.gameSocket && this.gameSocket.readyState === WebSocket.OPEN) {
      console.warn('🕹️ [Game WS] Already connected');
      return this.gameSocket;
    }

    const token = getToken();
    if (!token) return null;

    let url = `/ws/game?mode=${mode}&token=${token}`;
    if (mode === 'tournament' && size) {
      url += `&size=${size}`;
      if (id) url += `&id=${id}`;
    }

    const socket = new WebSocket(url);
    this.gameSocket = socket;

    socket.onopen = () => console.log('🕹️ [Game WS] Connected');

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
        this.gameSocket.close();
      } catch {}
      this.gameSocket = null;
    }
  }

  ///////////////////////////////////////
  // -------- PRESENCE SOCKET -------- //
  ///////////////////////////////////////

  connectPresenceSocket(onUpdate?: (msg: any) => void) {
    if (this.presenceSocket) return;

    const token = getToken();
    if (!token) return;

    const url = `/ws/presence`;
    const socket = new WebSocket(url, {
      headers: { Authorization: `Bearer ${token}` }
    });
    this.presenceSocket = socket;

    socket.onopen = () => {
      console.log('👥 [Presence WS] Connected');
      this.retryAttempts = 0;
    };

    socket.onmessage = (e) => {
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
        } catch {
          console.warn('👥 [Presence WS] Invalid message:', e.data);
        }
      }
    };

    socket.onclose = (e) => {
      console.log('👥 [Presence WS] Disconnected', e.reason);
      this.presenceSocket = null;
      this.disconnectGameSocket();

      if (e.code === 4003 || !getToken()) return;

      this.retryAttempts++;
      if (this.retryAttempts <= this.MAX_RETRY) {
        console.log(`👥 [Presence WS] Retry attempt ${this.retryAttempts}/${this.MAX_RETRY}`);
        this.reconnectTimeout = setTimeout(() => this.connectPresenceSocket(onUpdate), 3000);
      } else {
          console.warn(`👥 [Presence WS] Stopped trying to reconnect after ${this.MAX_RETRY} attempts.`);
      }
    };

    socket.onerror = (err) => {
      console.error('👥 [Presence WS] Error:', err);
    };
  }

  disconnectPresenceSocket() {
    if (this.reconnectTimeout) clearTimeout(this.reconnectTimeout);
    if (this.presenceSocket) {
      this.presenceSocket.close();
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

    const token = getToken();
    if (!token) return null;

    let url = `/ws/tournament?action=${action}&size=${size}&token=${token}`;
    if (action === 'join' && id) url += `&id=${id}`;
    if (names && names.length > 0) url += `&names=${encodeURIComponent(JSON.stringify(names))}`;

    const socket = new WebSocket(url);
    this.tournamentSocket = socket;

    socket.onopen = () => console.log('🎯 [Tournament WS] Connected:', url);

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
      } catch {}
      this.tournamentSocket.close();
      this.tournamentSocket = null;
    }
  }

  quitTournament() {
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
