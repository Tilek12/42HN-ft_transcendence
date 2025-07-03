// bouncingBall.ts

export interface BouncingBallOptions {
	speed?: number;
	ballSize?: number;
	selector?: string;
  }

  export class BouncingBall {
	private element: HTMLElement;
	private x: number;
	private y: number;
	private vx: number;
	private vy: number;
	private ballSize: number;
	private animationId: number | null = null;

	constructor(element: HTMLElement | string, options: BouncingBallOptions = {}) {
	  this.element = typeof element === 'string'
		? document.getElementById(element)!
		: element;

	  this.ballSize = options.ballSize || 288; // Default w-72 = 288px
	  const speed = options.speed || 2;

	  // Initialize random position
	  this.x = Math.random() * (window.innerWidth - this.ballSize);
	  this.y = Math.random() * (window.innerHeight - this.ballSize);

	  // Initialize random velocity
	  this.vx = (Math.random() - 2) * speed;
	  this.vy = (Math.random() - 2) * speed;

	  // Handle window resize
	  this.handleResize = this.handleResize.bind(this);
	  window.addEventListener('resize', this.handleResize);
	}

	private handleResize(): void {
	  // Adjust position if ball is outside new viewport
	  this.x = Math.min(this.x, window.innerWidth - this.ballSize);
	  this.y = Math.min(this.y, window.innerHeight - this.ballSize);
	}

	private animate = (): void => {
	  // Update position
	  this.x += this.vx;
	  this.y += this.vy;

	  // Bounce off walls
	  if (this.x <= 0 || this.x >= window.innerWidth - this.ballSize) {
		this.vx = -this.vx;
		this.x = Math.max(0, Math.min(this.x, window.innerWidth - this.ballSize));
	  }

	  if (this.y <= 0 || this.y >= window.innerHeight - this.ballSize) {
		this.vy = -this.vy;
		this.y = Math.max(0, Math.min(this.y, window.innerHeight - this.ballSize));
	  }

	  // Apply position to element
	  this.element.style.left = `${this.x}px`;
	  this.element.style.top = `${this.y}px`;

	  this.animationId = requestAnimationFrame(this.animate);
	}

	public start(): void {
	  if (!this.animationId) {
		this.animate();
	  }
	}

	public stop(): void {
	  if (this.animationId) {
		cancelAnimationFrame(this.animationId);
		this.animationId = null;
	  }
	}

	public destroy(): void {
	  this.stop();
	  window.removeEventListener('resize', this.handleResize);
	}
  }

  // Simple function-based approach (alternative)
  export function createBouncingBall(
	elementId: string,
	options: BouncingBallOptions = {}
  ): () => void {
	const ball = new BouncingBall(elementId, options);
	ball.start();

	// Return cleanup function
	return () => ball.destroy();
  }
