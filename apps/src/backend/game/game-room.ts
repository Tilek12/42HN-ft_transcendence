import { Player, GameState, GameMessage, OnGameEnd, GameMode } from './game-types';

const PHYSICS_FRAME_RATE = 1000 / 100; // 60 FPS for physics (original speed)
const NETWORK_FRAME_RATE = 1000 / 100;  // 30 FPS for network updates
const PADDLE_HEIGHT = 20;
const PADDLE_WIDTH = 2; // Virtual paddle width
const PADDLE_X_OFFSET = 3; // Distance from edge where paddle is positioned
const BALL_SPEED = 0.4;
const BALL_RADIUS = 1; // Virtual ball radius
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
	private ballFrozen = false; // Track if ball is frozen after scoring

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
		// Center paddles vertically (middle of field minus half paddle height)
		const centerY = (FIELD_HEIGHT - PADDLE_HEIGHT) / 2;
		return {
			ball: { x: 50, y: 50, vx: BALL_SPEED, vy: 0.5 },
			paddles: {
				[p1.id]: centerY,
				[p2.id]: centerY
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

		// Skip physics if ball is frozen
		if (this.ballFrozen) {
			return;
		}

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
		
		// Check if ball hits paddle (considering ball radius and paddle dimensions)
		// Ball center must be within paddle's vertical range (with some tolerance)
		const hit = (py: number) => {
			const ballTop = ball.y - BALL_RADIUS;
			const ballBottom = ball.y + BALL_RADIUS;
			const paddleTop = py;
			const paddleBottom = py + PADDLE_HEIGHT;
			
			const doesHit = ballBottom >= paddleTop && ballTop <= paddleBottom;
			
			console.log(`HIT CHECK: Ball(${ballTop.toFixed(1)}-${ballBottom.toFixed(1)}) vs Paddle(${paddleTop.toFixed(1)}-${paddleBottom.toFixed(1)}) = ${doesHit}`);
			
			// Check if ball overlaps with paddle vertically
			return doesHit;
		};

		// Left paddle collision (player 1) - paddle is at x = PADDLE_X_OFFSET
		if (ball.vx < 0) { // Only check if ball is moving left
			const paddleLeft = PADDLE_X_OFFSET;
			const paddleRight = PADDLE_X_OFFSET + PADDLE_WIDTH;
			
			// Check if ball crossed into paddle zone
			if (ball.x - BALL_RADIUS <= paddleRight && prevX - BALL_RADIUS > paddleRight) {
				console.log(`[LEFT PADDLE] Ball crossed boundary. Ball Y: ${ball.y.toFixed(2)}, Paddle Y: ${pad1.toFixed(2)}-${(pad1 + PADDLE_HEIGHT).toFixed(2)}`);
				if (hit(pad1)) {
					console.log(`✓ LEFT PADDLE HIT!`);
					// Hit the paddle - bounce back
					ball.x = paddleRight + BALL_RADIUS;
					ball.vx *= -1;
					// Add some variation to vertical velocity based on where ball hit paddle
					const hitPos = (ball.y - pad1) / PADDLE_HEIGHT; // 0 to 1
					ball.vy = (hitPos - 0.5) * 1.5; // -0.75 to +0.75
				} else {
					console.log(`✗ LEFT PADDLE MISSED! Score for ${p2.name}`);
					// Missed the paddle, score for player 2
					score[p2.id]!++;
					this.resetBall(1);
					return;
				}
			}
		}
		
		// Check if ball went out of bounds on left
		if (ball.x - BALL_RADIUS <= 0) {
			score[p2.id]!++;
			this.resetBall(1);
			return;
		}

		// Right paddle collision (player 2) - paddle is at x = width - PADDLE_X_OFFSET - PADDLE_WIDTH
		if (ball.vx > 0) { // Only check if ball is moving right
			const paddleLeft = width - PADDLE_X_OFFSET - PADDLE_WIDTH;
			const paddleRight = width - PADDLE_X_OFFSET;
			
			// Check if ball crossed into paddle zone
			if (ball.x + BALL_RADIUS >= paddleLeft && prevX + BALL_RADIUS < paddleLeft) {
				console.log(`[RIGHT PADDLE] Ball crossed boundary. Ball Y: ${ball.y.toFixed(2)}, Paddle Y: ${pad2.toFixed(2)}-${(pad2 + PADDLE_HEIGHT).toFixed(2)}`);
				if (hit(pad2)) {
					console.log(`✓ RIGHT PADDLE HIT!`);
					// Hit the paddle - bounce back
					ball.x = paddleLeft - BALL_RADIUS;
					ball.vx *= -1;
					// Add some variation to vertical velocity based on where ball hit paddle
					const hitPos = (ball.y - pad2) / PADDLE_HEIGHT; // 0 to 1
					ball.vy = (hitPos - 0.5) * 1.5; // -0.75 to +0.75
				} else {
					console.log(`✗ RIGHT PADDLE MISSED! Score for ${p1.name}`);
					// Missed the paddle, score for player 1
					score[p1.id]!++;
					this.resetBall(-1);
					return;
				}
			}
		}
		
		// Check if ball went out of bounds on right
		if (ball.x + BALL_RADIUS >= width) {
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
		// Freeze ball at center
		this.ballFrozen = true;
		this.state.ball = {
			x: 50,
			y: 50,
			vx: 0,
			vy: 0
		};

		// Wait 2 seconds before launching ball
		setTimeout(() => {
			const vyDirection = Math.random() > 0.5 ? 1 : -1;
			const vyVariation = 0.4 + Math.random() * 0.6;
			this.state.ball = {
				x: 50,
				y: 50,
				vx: BALL_SPEED * direction,
				vy: 0.5 * vyDirection * vyVariation
			};
			this.ballFrozen = false;
		}, 2000);
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
