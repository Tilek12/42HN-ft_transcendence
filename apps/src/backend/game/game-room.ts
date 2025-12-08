import { Player, GameState, GameMessage, OnGameEnd, GameMode } from './game-types';

const PHYSICS_FRAME_RATE = 1000 / 100; // 60 FPS for physics (original speed)
const NETWORK_FRAME_RATE = 1000 / 100;  // 30 FPS for network updates
const PADDLE_HEIGHT = 20;
const BALL_SPEED = 0.6;
const FIELD_WIDTH = 100;
const FIELD_HEIGHT = 100;
const WIN_SCORE = 5;
const FREEZE = 5;

export class GameRoom {
	public readonly id: string;
	private players: [Player, Player];
	private mode: GameMode;
	private tournamentId?: string;
	private state: GameState;
	private physicsInterval!: NodeJS.Timeout;
	private networkInterval!: NodeJS.Timeout;
	private winner: Player | null = null;
	private loser: Player | null = null;
	private winnerScore: number = 0;
	private loserScore: number = 0;
	private onEnd: OnGameEnd | null = null;
	private pendingBroadcast = false;
	private gameEnded = false;

	constructor(
		id: string,
		mode: GameMode,
		player1: Player,
		player2: Player,
		tournamentId?: string
	) {
		this.id = id;
		this.players = [player1, player2 ];
		this.mode = mode;
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
			status: 'playing',
			playerNames: {
				[p1.id]: p1.name,
				[p2.id]: p2.name
			}
		};
	}

	private setupListeners() {
		for (const player of this.players) {
			if (player.isGhost) continue;

			(player.socket as any).on('message', (msg: any) => {
				const text = msg.toString();
				if (text === 'pong' || text === 'quit') return;

				let m: any;
				try {
					m = JSON.parse(text);
				} catch (e) {
					console.warn(`⚠️ Invalid message from ${player.id}:'${text}'`);
					return;
				}

				if (m.type === 'move') {
					if (this.mode === 'solo') {
						// one socket controls both paddles
						const target = m.side === 'right' ? this.players[1].id : this.players[0].id;
						this.move(target, m.direction);
					} else if (this.mode === 'local-match') {
						// same socket, but use side field to choose
						const target = m.side === 'right' ? this.players[1].id : this.players[0].id;
						this.move(target, m.direction);
					} else {
						// duel/match: player only controls their own paddle
						this.move(player.id, m.direction);
					}
				} else if (m.type === 'quit') {
					this.broadcast({ type: 'disconnect', who: player.id });
					this.end();
				}
			});

			(player.socket as any).on('close', () => {
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
		// Physics loop at 60 FPS
		this.physicsInterval = setInterval(() => this.updatePhysics(), PHYSICS_FRAME_RATE);

		// Network updates at 30 FPS
		this.networkInterval = setInterval(() => this.sendNetworkUpdate(), NETWORK_FRAME_RATE);

		console.log(`🕹️ [GameRoom] Game started!`);
		this.broadcast({ type: 'start' });
	}

	private updatePhysics() {
		const { ball, paddles, score, width, height } = this.state;
		const [p1, p2] = this.players;

		// Store previous position for collision detection
		const prevX = ball.x;
		const prevY = ball.y;

		// Ball movement
		ball.x += ball.vx;
		ball.y += ball.vy;

		// Wall collision
		if (ball.y <= 0 || ball.y >= height) {
			ball.vy *= -1;
			ball.y = Math.max(0, Math.min(height, ball.y));
		}

		const pad1 = paddles[p1.id]!;
		const pad2 = paddles[p2.id]!;
		const hit = (py: number) => ball.y >= py && ball.y <= py + PADDLE_HEIGHT;

		// Left paddle collision (player 1)
		if (ball.vx < 0) { // Only check if ball is moving left
			if (ball.x <= 2 && prevX > 2) { // Ball crossed paddle boundary
				if (hit(pad1)) {
					// Hit the paddle
					ball.x = 2;
					ball.vx *= -1;
				} else {
					// Missed the paddle, score for player 2
					score[p2.id]!++;
					this.resetBall(1);
					return; // Exit early after scoring
				}
			}
		}
		
		// Check if ball went out of bounds on left
		if (ball.x <= 0) {
			score[p2.id]!++;
			this.resetBall(1);
			return;
		}

		// Right paddle collision (player 2)
		if (ball.vx > 0) { // Only check if ball is moving right
			if (ball.x >= width - 2 && prevX < width - 2) { // Ball crossed paddle boundary
				if (hit(pad2)) {
					// Hit the paddle
					ball.x = width - 2;
					ball.vx *= -1;
				} else {
					// Missed the paddle, score for player 1
					score[p1.id]!++;
					this.resetBall(-1);
					return; // Exit early after scoring
				}
			}
		}
		
		// Check if ball went out of bounds on right
		if (ball.x >= width) {
			score[p1.id]!++;
			this.resetBall(-1);
			return;
		}

		// Win condition check
		if (score[p1.id]! >= WIN_SCORE || score[p2.id]! >= WIN_SCORE) {
			this.handleGameEnd();
		}
	}

	private sendNetworkUpdate() {
		// Don't send updates if game has ended (except for local mode to show final state)
		if (this.gameEnded && this.mode !== 'local-match') return;

		// Only send update if no pending broadcast to prevent flooding
		if (!this.pendingBroadcast) {
			this.pendingBroadcast = true;
			setImmediate(() => {
				this.broadcast({
					type: 'update',
					state: this.state
				});
				this.pendingBroadcast = false;
			});
		}
	}

	private handleGameEnd() {
		this.gameEnded = true;  // Set flag immediately to stop network updates

		const { score } = this.state;
		const [p1, p2] = this.players;
		const p1Score = score[p1.id]!;
		const p2Score = score[p2.id]!;

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
			winner: { id: this.winner.id, name: this.winner.name, score: this.winnerScore },
			loser: { id: this.loser.id, name: this.loser.name, score: this.loserScore }
		});

		setTimeout(() => this.end(), 1000);
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
			if (!p.isGhost && p.socket.readyState === WebSocket.OPEN) {
				try {
					p.socket.send(JSON.stringify(msg));
				} catch { }
			}
		}
	}

	private end() {
		if (this.isEnded()) return;

		clearInterval(this.physicsInterval);
		clearInterval(this.networkInterval);
		this.state.status = 'ended';

		if (this.onEnd && this.winner && this.loser) {
			this.onEnd(this.winner, this.loser, this.winnerScore, this.loserScore);
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

	public handleMove(playerId: string, direction: 'up' | 'down', side?: 'left' | 'right') {
		this.move(playerId, direction);
	}

	public updateSocket(player: Player) {
		const index = this.players.findIndex(p => p.id === player.id);
		if (index !== -1) {
			this.players[index] = player;
			// Re-setup listeners for the updated socket
			this.setupListeners();
		}
	}
}
