import { Player, GameState } from './types';
import { advanceTournament } from '../tournament/tournament-manager';
import { findProfileById, incrementWinsOrLossesOrTrophies } from '../../database/user';
import { createMatch } from '../../database/match';
import { linkMatchToTournament } from '../../database/tournament';

const FRAME_RATE = 1000 / 60;
const PADDLE_HEIGHT = 20;
const BALL_SPEED = 0.6;
const FIELD_WIDTH = 100;
const FIELD_HEIGHT = 100;
const WIN_SCORE = 5;
const FREEZE = 5;

export class GameRoom {
  private players: [Player, Player?];
  private mode: 'solo' | 'duel';
  private tournamentId?: string;
  private state: GameState;
  private interval: NodeJS.Timeout;
  private winner: Player | null = null;
  private losser: Player | null = null;

  constructor(player1: Player, player2: Player | null, tournamentId?: string) {
    this.players = [player1, player2 || undefined];
    this.mode = player2 ? 'duel' : 'solo';
    this.tournamentId = tournamentId;
    this.state = this.initState();
    this.setupListeners();
    this.startCountdown();
  }

  private initState(): GameState {
    return {
      ball: { x: 50, y: 50, vx: BALL_SPEED, vy: 0.5 },
      paddles: {
        [this.players[0].id]: 50,
        [this.players[1]?.id || '__ghost']: 50
      },
      score: {
        [this.players[0].id]: 0,
        [this.players[1]?.id || '__ghost']: 0
      },
      width: FIELD_WIDTH,
      height: FIELD_HEIGHT,
      status: 'playing'
    };
  }

  private setupListeners() {
    for (const player of this.players) {
      if (!player) continue;

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
            targetId = '__ghost';
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
    ball.x += ball.vx;
    ball.y += ball.vy;

    if (ball.y <= 0 || ball.y >= height) {
      ball.vy *= -1;
      ball.y = Math.max(0, Math.min(height, ball.y));
    }

    const [p1, p2] = this.players;
    const pad1 = paddles[p1.id];
    const pad2 = paddles[p2?.id || '__ghost'];
    const hit = (py: number) => ball.y >= py && ball.y <= py + PADDLE_HEIGHT;

    if (ball.x <= 2 && hit(pad1)) {
      ball.x = 2;
      ball.vx *= -1;
    } else if (ball.x <= 0) {
      score[p2?.id || '__ghost']++;
      this.resetBall(1);
    }

    if (ball.x >= width - 2 && hit(pad2)) {
      ball.x = width - 2;
      ball.vx *= -1;
    } else if (ball.x >= width) {
      score[p1.id]++;
      this.resetBall(-1);
    }

    if (score[p1.id] >= WIN_SCORE || score[p2?.id || '__ghost'] >= WIN_SCORE) {
      console.log('before p1: ', p1);
      console.log('before p2: ', p2);
      const winnerId = score[p1.id] > score[p2?.id || '__ghost'] ? p1.id : p2?.id;
      const winner = this.players.find(p => p?.id === winnerId) || null;
      this.winner = winner;

	  //------Thomas code-------
	  // (async () =>
	  // {
		//  let state : 'wins' | 'losses' = winnerId === p1.id ? 'wins' : 'losses';
		//  if (p2 !== undefined)
		// 	 state = state !== 'wins' ? 'wins' : 'losses';
    // //------ Save to matches table -------
    // if (p2 !== undefined) {
    //   const isTournamentMatch = this.mode === 'duel' && !!this.tournamentId;
    //   // Create Match
    //   await createMatch(
    //     parseInt(p1.id),
    //     parseInt(p2.id),
    //     score[p1.id],
    //     score[p2.id],
    //     isTournamentMatch
    //   );
    //    // Get last inserted match ID
    // //    const { id: lastMatchId } = await db.get(`SELECT last_insert_rowid() as id`);
    //    // Link match to tournament
    //   if (isTournamentMatch && this.tournamentId) {
    //     await linkMatchToTournament(parseInt(this.tournamentId.split('-')[1]), lastMatchId);
    //   }
    // }
	  // })();
	  //------Thomas code-------

      this.broadcast({ type: 'end', winner: winner?.id });
      setTimeout(() => this.end(), 1000); // give frontend time to show result

      if (this.tournamentId && this.winner) {
        advanceTournament(this.tournamentId, this.winner);
      }
      return;
    }

    this.broadcast({ type: 'update', state: this.state });
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
      if (p && p.socket.readyState === p.socket.OPEN) {
        p.socket.send(JSON.stringify(msg));
      }
    }
  }

  public getWinner(): Player | null {
    return this.winner;
  }

  public getLoser(): Player | null {
    if (!this.winner) return null;
    return this.players.find(p => p?.id !== this.winner?.id) || null;
  }

  private end() {
    clearInterval(this.interval);
    this.state.status = 'ended';

    for (const p of this.players) {
      try {
        if (p && p.socket.readyState === p.socket.OPEN) {
          p.socket.close(1000, 'Game Ended');
        }
      } catch {}
    }
  }
}
