import { Player, GameState } from './types';

export class GameRoom {
  private players: [Player, Player];
  private state: GameState;
  private interval: NodeJS.Timeout;
  private gameId: string;

  constructor(player1: Player, player2: Player) {
    this.players = [player1, player2];
    this.gameId = `game-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    this.state = this.createInitialState();

    this.bindInputHandlers();
    this.start();
    console.log(`🎮 Starting ${this.gameId} between ${player1.id} and ${player2.id}`);
  }

  private createInitialState(): GameState {
    return {
      ball: { x: 50, y: 50, vx: 0.7, vy: 0.5 },
      paddles: {
        [this.players[0].id]: 50,
        [this.players[1].id]: 50
      },
      score: {
        [this.players[0].id]: 0,
        [this.players[1].id]: 0
      },
      width: 100,
      height: 100,
      status: 'playing'
    };
  }

  private start() {
    this.interval = setInterval(() => this.tick(), 1000 / 60);
  }

  private tick() {
    const { ball, paddles, score, width, height } = this.state;
    const radius = 2;

    // Update ball position
    ball.x += ball.vx;
    ball.y += ball.vy;

    // Wall collision
    if (ball.y <= 0 || ball.y >= height) {
      ball.vy *= -1;
    }

    // Paddle collision
    const paddleHeight = 20;
    const paddleWidth = 2;
    const ballAtLeft = ball.x <= paddleWidth;
    const ballAtRight = ball.x >= width - paddleWidth;

    const [p1, p2] = this.players;

    if (ballAtLeft) {
      const py = paddles[p1.id];
      if (ball.y >= py && ball.y <= py + paddleHeight) {
        ball.vx *= -1;
        ball.x = paddleWidth; // prevent sticking
      } else {
        score[p2.id]++;
        this.resetBall(-1);
      }
    }

    if (ballAtRight) {
      const py = paddles[p2.id];
      if (ball.y >= py && ball.y <= py + paddleHeight) {
        ball.vx *= -1;
        ball.x = width - paddleWidth;
      } else {
        score[p1.id]++;
        this.resetBall(1);
      }
    }

    // End game at 10 points
    const winningScore = 10;
    for (const id of Object.keys(score)) {
      if (score[id] >= winningScore) {
        this.state.status = 'ended';
        this.broadcast({ type: 'end', winner: id });
        this.end();
        return;
      }
    }

    this.broadcast({ type: 'update', state: this.state });
  }

  private resetBall(direction: -1 | 1) {
    this.state.ball = {
      x: 50,
      y: 50,
      vx: 0.7 * direction,
      vy: (Math.random() - 0.5)
    };
  }

  private broadcast(data: any) {
    const msg = JSON.stringify(data);
    this.players.forEach((p) => {
      if (p.socket.readyState === p.socket.OPEN) {
        p.socket.send(msg);
      }
    });
  }

  private bindInputHandlers() {
    for (const player of this.players) {
      player.socket.on('message', (message) => {
        try {
          const data = JSON.parse(message.toString());
          if (data.type === 'move') {
            this.handleMove(player.id, data.direction);
          }
        } catch {}
      });

      player.socket.on('close', () => {
        this.broadcast({ type: 'disconnect', who: player.id });
        this.end();
      });
    }
  }

  private handleMove(playerId: string, direction: 'up' | 'down') {
    const delta = direction === 'up' ? -2 : 2;
    const pos = this.state.paddles[playerId];
    this.state.paddles[playerId] = Math.max(0, Math.min(100, pos + delta));
  }

  public end() {
    clearInterval(this.interval);
    this.state.status = 'ended';
    console.log(`🎮 ${this.gameId} ended`);
  }
}
