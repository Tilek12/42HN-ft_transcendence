import { Player, GhostPlayer, GameState, GameMessage, OnGameEnd } from './types';
import { advanceTournament } from '../service-managers/tournament-manager';

const FRAME_RATE = 1000 / 60;
const PADDLE_HEIGHT = 20;
const BALL_SPEED = 0.6;
const FIELD_WIDTH = 100;
const FIELD_HEIGHT = 100;
const WIN_SCORE = 5;
const FREEZE = 5;

export class GameRoom {
  public readonly id: string;
  private players: [Player, Player];
  private mode: 'solo' | 'duel';
  private tournamentId?: string;
  private state: GameState;
  private interval: NodeJS.Timeout;
  private winner: Player | null = null;
  private loser: Player | null = null;
  private winnerScore: number = 0;
  private loserScore: number = 0;
  private onEnd: OnGameEnd | null = null;

  constructor(
    id: string,
    player1: Player,
    player2: Player | null,
    tournamentId?: string
  ) {
    this.id = id;
    this.players = [player1, player2 ?? GhostPlayer];
    this.mode = player2 ? 'duel' : 'solo';
    if (tournamentId) this.tournamentId = tournamentId;
    this.state = this.initState();
    this.setupListeners();
    this.startCountdown();
  }

  private initState(): GameState {
    const [p1, p2] = this.players;
    return {
      ball: { x: 50, y: 50, vx: BALL_SPEED, vy: 0.5 },
      paddles: {
        [p1.id]: 50,
        [p2.id]: 50
      },
      score: {
        [p1.id]: 0,
        [p2.id]: 0
      },
      width: FIELD_WIDTH,
      height: FIELD_HEIGHT,
      status: 'playing'
    };
  }

  // private handleMessage(player: Player, raw: string) {
  //   if (raw === 'pong') return;

  //   let message: GameMessage;
  //   try {
  //     message = JSON.parse(raw);
  //   } catch {
  //     console.warn(`⚠️ Invalid message from ${player.id}:`, raw);
  //     return;
  //   }

  //   switch (message.type) {
  //     case 'move':
  //       this.move(player.id, message.direction);
  //       break;
  //     case 'quit':
  //       this.broadcast({ type: 'disconnect', who: player.id });
  //       this.end();
  //       break;
  //     default:
  //       console.warn(`⚠️ Unknown message type from ${player.id}:`, message);
  //   }
  // }

  private setupListeners() {
    for (const player of this.players) {
      if (player === GhostPlayer) continue;

      player.socket.on('message', (msg) => {
        const text = msg.toString();
        if (text === 'pong') return;

        let m: any;
        try {
          m = JSON.parse(text);
        } catch (e) {
          console.warn(`⚠️ Invalid message from ${player.id}:`, text);
          return;
        }

        if (m.type === 'move') {
          let targetId = player.id;
          if (this.mode === 'solo' && m.side === 'right') {
            targetId = GhostPlayer.id;
          }
          this.move(targetId, m.direction);
        } else if (m.type === 'quit') {
          this.broadcast({ type: 'disconnect', who: player.id });
          this.end();
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
    const currentY = this.state.paddles[playerId] ?? 50;
    const newY = currentY + delta;
    const maxY = this.state.height - PADDLE_HEIGHT;
    this.state.paddles[playerId] = Math.max(0, Math.min(maxY, newY));
  }

  private startCountdown() {
    let count = FREEZE;
    const countdownInterval = setInterval(() => {
      this.broadcast({ type: 'countdown', value: count });
      if (count === 0) {
        clearInterval(countdownInterval);
        this.start();
      }
      count--;
    }, 1000);
  }

  private start() {
    this.interval = setInterval(() => this.updateGame(), FRAME_RATE);
    console.log(`🕹️ [GameRoom] Game started!`);
    this.broadcast({ type: 'start' });
  }

  private updateGame() {
    const { ball, paddles, score, width, height } = this.state;
    const [p1, p2] = this.players;

    ball.x += ball.vx;
    ball.y += ball.vy;

    if (ball.y <= 0 || ball.y >= height) {
      ball.vy *= -1;
      ball.y = Math.max(0, Math.min(height, ball.y));
    }

    const pad1 = paddles[p1.id];
    const pad2 = paddles[p2.id];
    const hit = (py: number) => ball.y >= py && ball.y <= py + PADDLE_HEIGHT;

    if (ball.x <= 2 && hit(pad1)) {
      ball.x = 2;
      ball.vx *= -1;
    } else if (ball.x <= 0) {
      score[p2.id]++;
      this.resetBall(1);
    }

    if (ball.x >= width - 2 && hit(pad2)) {
      ball.x = width - 2;
      ball.vx *= -1;
    } else if (ball.x >= width) {
      score[p1.id]++;
      this.resetBall(-1);
    }

    // Win condition
    if (score[p1.id] >= WIN_SCORE || score[p2.id] >= WIN_SCORE) {
      const p1Score = score[p1.id];
      const p2Score = score[p2.id];

      if (p1Score > p2Score) {
        this.winner = p1;
        this.winnerScore = p1Score;
        this.loser = p2;
        this.loserScore = p2Score;
      } else {
        this.winner = p2;
        this.winnerScore = p2Score;
        this.loser = p1;
        this.loserScore = p1Score;
      }

      this.broadcast({
        type: 'end',
        winner: { id: this.winner.id, name: this.winner.name },
        loser: { id: this.loser.id, name: this.loser.name }
      });

      setTimeout(() => this.end(), 1000);

      if (this.tournamentId && this.winner !== GhostPlayer) {
        advanceTournament(this.tournamentId, this.winner);
      }
      return;
    }

    this.broadcast({
      type: 'update',
      state: {
        ...this.state,
        playerNames: {
          [p1.id]: p1.name,
          [p2.id]: p2.name
        }
      }
    });
  }

  private resetBall(direction: 1 | -1) {
    const vyDirection = Math.random() > 0.5 ? 1 : -1;
    const vyVariation = 0.4 + Math.random() * 0.6;
    this.state.ball = {
      x: 50,
      y: 50,
      vx: BALL_SPEED * direction,
      vy: 0.5 * vyDirection * vyVariation
    };
  }

  private broadcast(msg: any) {
    for (const p of this.players) {
      if (p !== GhostPlayer && p.socket.readyState === p.socket.OPEN) {
        p.socket.send(JSON.stringify(msg));
      }
    }
  }

  private end() {
    if (this.isEnded()) return;

    clearInterval(this.interval);
    this.state.status = 'ended';

    if (this.onEnd && this.winner && this.loser) {
      this.onEnd(this.winner, this.loser, this.winnerScore, this.loserScore);
    }

    for (const p of this.players) {
      if (p !== GhostPlayer && p.socket.readyState === p.socket.OPEN) {
        try {
          p.socket.close(1000, 'Game Ended');
        } catch {}
      }
    }
  }

  public onEndCallback(onEnd: OnGameEnd): void {
    this.onEnd = onEnd;
  }

  public getPlayers(): Player[] {
    return this.players;
  }

  public isEnded(): boolean {
    return this.state.status === 'ended';
  }
}
