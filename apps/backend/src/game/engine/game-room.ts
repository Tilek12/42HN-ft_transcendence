import { Player, GameState } from './types';

export class GameRoom {
  private players: [Player, Player?];
  private mode: 'solo' | 'duel';
  private state: GameState;
  private interval: NodeJS.Timeout;

  constructor(player1: Player, player2: Player | null) {
    this.players = [player1, player2 || null];
    this.mode = player2 ? 'duel' : 'solo';
    this.state = this.initState();
    this.setupListeners();
    this.start();
  }

  private initState(): GameState {
    return {
      ball: { x: 50, y: 50, vx: 0.6, vy: 0.5 },
      paddles: {
        [this.players[0].id]: 50,
        [this.players[1]?.id || '__ghost']: 50
      },
      score: {
        [this.players[0].id]: 0,
        [this.players[1]?.id || '__ghost']: 0
      },
      width: 100,
      height: 100,
      status: 'playing'
    };
  }

  private setupListeners() {
    for (const player of this.players) {
      if (!player) continue;

      player.socket.on('message', (msg) => {
        const text = msg.toString();

        // Ignore keep-alive pings
        if (text === 'pong') return;

        let m: any;
        try {
          m = JSON.parse(text);
        } catch (e) {
          console.warn(`⚠️ Received non-JSON message:`, text);
          return;
        }

        if (m.type === 'move') {
          let targetId = player.id;

          if (this.mode === 'solo' && m.side === 'right') {
            targetId = '__ghost'; // right paddle in solo mode
          }

          this.move(targetId, m.direction);
        }
      });

      player.socket.on('close', () => {
        this.broadcast({ type: 'disconnect', who: player.id });
        this.end();
      });
    }
  }

  private move(playerId: string, direction: 'up' | 'down') {
    const delta = direction === 'up' ? -2 : 2;
    const y = this.state.paddles[playerId] || 50;
    this.state.paddles[playerId] = Math.max(0, Math.min(100, y + delta));
  }

  private start() {
    this.interval = setInterval(() => this.tick(), 1000 / 60);
  }

  private tick() {
    const { ball, paddles, score, width, height } = this.state;
    ball.x += ball.vx;
    ball.y += ball.vy;

    if (ball.y <= 0 || ball.y >= height) ball.vy *= -1;

    const [p1, p2] = this.players;
    const pad1 = paddles[p1.id];
    const pad2 = paddles[p2?.id || '__ghost'];

    const hit = (py: number) => ball.y >= py && ball.y <= py + 20;

    if (ball.x <= 2 && hit(pad1)) ball.vx *= -1;
    else if (ball.x <= 0) {
      score[p2?.id || '__ghost']++;
      this.resetBall(1);
    }

    if (ball.x >= width - 2 && hit(pad2)) ball.vx *= -1;
    else if (ball.x >= width) {
      score[p1.id]++;
      this.resetBall(-1);
    }

    if (score[p1.id] >= 5 || score[p2?.id || '__ghost'] >= 5) {
      this.broadcast({ type: 'end', winner: score[p1.id] > score[p2?.id || '__ghost'] ? p1.id : p2?.id });
      this.end();
      return;
    }

    this.broadcast({ type: 'update', state: this.state });
  }

  private resetBall(direction: 1 | -1) {
    this.state.ball = { x: 50, y: 50, vx: 0.6 * direction, vy: 0.5 };
  }

  private broadcast(msg: any) {
    this.players.forEach((p) => {
      if (!p || p.socket.readyState !== p.socket.OPEN) return;
      p.socket.send(JSON.stringify(msg));
    });
  }

  private end() {
    clearInterval(this.interval);
    this.state.status = 'ended';
  }
}
