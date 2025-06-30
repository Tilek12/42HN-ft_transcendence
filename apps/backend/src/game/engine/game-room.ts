import { Player, GameState, GameMode, MoveMessage } from './types';

export class GameRoom {
  private players: [Player?, Player?, Player?, Player?];
  private mode: GameMode;
  private state: GameState;
  private interval: NodeJS.Timeout;

  constructor(player1: Player, player2: Player, player3: Player, player4: Player) {
    this.players = [player1, player2 || null, player3 || null, player4 || null];

    if (player2 && player3 && player4) {
      this.mode = 'four';
    } else if (player2) {
      this.mode = 'duel';
    } else {
      this.mode = 'solo';
    }

    this.state = this.initState();
    this.setupListeners();
    this.start();
  }

  private initState(): GameState {
    const sides: Array<'left' | 'right' | 'top' | 'bottom'> = ['left', 'right', 'top', 'bottom'];
    const paddles: GameState['paddles'] = {};
    const score: GameState['score'] = {};

    this.players.forEach((player, index) => {
      if (!player) return;
      paddles[player.id] = { side: sides[index], pos: 50 };
      score[player.id] = 0;
    });

    return {
      ball: { x: 50, y: 50, vx: 0.6, vy: 0.5 },
      paddles,
      score,
      width: 100,
      height: 100,
      status: 'playing',
    };
  }

  private setupListeners() {
    for (const player of this.players) {
      if (!player) continue;

      player.socket.on('message', (msg) => {
        const text = msg.toString();
        if (text === 'pong') return;

        let m: MoveMessage;
        try {
          m = JSON.parse(text);
        } catch {
          console.warn('⚠️ Received non-JSON message:', text);
          return;
        }

        if (m.type === 'move') {
          this.move(player.id, m.direction);
        }
      });

      player.socket.on('close', () => {
        this.broadcast({ type: 'disconnect', who: player.id });
        this.end();
      });
    }
  }

  private move(playerId: string, direction: 'up' | 'down' | 'left' | 'right') {
    const paddle = this.state.paddles[playerId];
    if (!paddle) return;

    const delta = (direction === 'up' || direction === 'left') ? -2 : 2;
    const size = paddle.side === 'left' || paddle.side === 'right' ? this.state.height : this.state.width;

    paddle.pos = Math.max(0, Math.min(size - 20, paddle.pos + delta));
  }

  private start() {
    this.interval = setInterval(() => this.tick(), 1000 / 60);
  }

  private tick() {
    const { ball, paddles, score, width, height } = this.state;

    ball.x += ball.vx;
    ball.y += ball.vy;

    if (this.mode !== 'four' && (ball.y <= 0 || ball.y >= height)) {
      ball.vy *= -1;
    }

    const paddleEntries = Object.entries(paddles);
    for (const [id, paddle] of paddleEntries) {
      const { side, pos } = paddle;
      const paddleSize = 20;

      const hit =
        side === 'left' || side === 'right'
          ? ball.y >= pos && ball.y <= pos + paddleSize
          : ball.x >= pos && ball.x <= pos + paddleSize;

      if (side === 'left' && ball.x <= 2 && hit) ball.vx *= -1;
      else if (side === 'left' && ball.x <= 0) this.scoreAgainst(id);

      if (side === 'right' && ball.x >= width - 2 && hit) ball.vx *= -1;
      else if (side === 'right' && ball.x >= width) this.scoreAgainst(id);

      if (side === 'top' && ball.y <= 2 && hit) ball.vy *= -1;
      else if (side === 'top' && ball.y <= 0) this.scoreAgainst(id);

      if (side === 'bottom' && ball.y >= height - 2 && hit) ball.vy *= -1;
      else if (side === 'bottom' && ball.y >= height) this.scoreAgainst(id);
    }

    // Check for winner
    for (const pid in score) {
      if (score[pid] >= 5) {
        this.broadcast({ type: 'end', winner: pid });
        this.end();
        return;
      }
    }

    this.broadcast({ type: 'update', state: this.state });
  }

  private scoreAgainst(loserId: string) {
    for (const pid in this.state.score) {
      if (pid !== loserId) this.state.score[pid]++;
    }
    this.resetBall();
  }

  private resetBall() {
    const angle = Math.random() * 2 * Math.PI;
    this.state.ball = {
      x: 50,
      y: 50,
      vx: 0.6 * Math.cos(angle),
      vy: 0.5 * Math.sin(angle),
    };
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