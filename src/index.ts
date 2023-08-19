interface CanvasOptions {
  width?: number;
  height?: number;
}

interface MouseCoords {
  x: number;
  y: number;
}

interface BrushProperties {
  size: number;
}

interface BrushColor {
  primary: string;
  secondary: string;
}

enum BrushType {
  CIRCLE = 'circle',
}

enum MouseButton {
  LEFT = 'left',
  RIGHT = 'right',
}

class Paint {
  canvas: HTMLCanvasElement;
  brushType: BrushType;
  brushColor: BrushColor = { primary: 'red', secondary: 'black' };
  brushProperties: BrushProperties;
  private context: CanvasRenderingContext2D | null;
  private isDrawing: boolean = false;
  private coords?: MouseCoords;
  private prevCoords?: MouseCoords;
  private button?: MouseButton;

  constructor(canvas: HTMLCanvasElement, options?: CanvasOptions) {
    this.canvas = canvas;
    this.context = canvas.getContext('2d');
    this.brushType = Object.values(BrushType)[0];
    this.brushProperties = {
      size: 5,
    };
    if (options?.width) {
      canvas.width = options.width;
    }
    if (options?.height) {
      canvas.height = options.height;
    }
    this.registerWindowListeners();
  }

  private registerWindowListeners() {
    const registerCoords = (e: MouseEvent) => {
      this.coords = { x: e.x, y: e.y };
      this.button = { 1: MouseButton.LEFT, 2: MouseButton.RIGHT }[e.buttons];
    };
    this.canvas.addEventListener('mousedown', e => {
      registerCoords(e);
      this.isDrawing = true;
      this.animate();
    });
    this.canvas.addEventListener('mouseup', () => {
      this.isDrawing = false;
      this.prevCoords = undefined;
    });
    this.canvas.addEventListener('mousemove', registerCoords);
  }

  private draw() {
    if (!this.context || !this.coords?.x || !this.button || (this.prevCoords?.x === this.coords?.x && this.prevCoords?.y === this.coords?.y)) return;
    const { x, y } = this.coords;
    const { x: px, y: py } = this.prevCoords ?? {};
    const ctx = this.context;
    const color = this.button === MouseButton.LEFT ? this.brushColor.primary : this.brushColor.secondary;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, this.brushProperties.size, 0, Math.PI * 2);
    ctx.fill();
    if (px && py) {
      const dx = x - px;
      const dy = y - py;
      const distFromPrev = Math.sqrt(dx * dx + dy * dy);
      if (distFromPrev > this.brushProperties.size) {
        ctx.beginPath();
        ctx.strokeStyle = color;
        ctx.lineWidth = this.brushProperties.size * 2;
        ctx.moveTo(px, py);
        ctx.lineTo(x, y);
        ctx.stroke();
        ctx.closePath();
      }
    }
    this.prevCoords = this.coords;
  }

  private animate() {
    if (!this.isDrawing) return;
    this.draw();
    requestAnimationFrame(this.animate.bind(this));
  }
}

const canvas = document.getElementById('canvas');

const paint = new Paint(canvas as HTMLCanvasElement, {
  width: window.innerWidth,
  height: window.innerHeight,
});
