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
  opacity: number;
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
  brushColor: BrushColor = { primary: '#ff0000', secondary: '#000000' };
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
      opacity: 100,
    };
    if (options?.width) {
      canvas.width = options.width;
    }
    if (options?.height) {
      canvas.height = options.height;
    }
    this.registerWindowListeners();
  }

  setPrimaryBrushColor(color: string) {
    this.brushColor.primary = color;
  }
  setSecondaryBrushColor(color: string) {
    this.brushColor.secondary = color;
  }
  setBrushSize(size: number) {
    this.brushProperties.size = size;
  }
  setBrushOpacity(value: number) {
    if (value < 1 || value > 100) {
      throw new Error('Opacity value must be between 1 and 100');
    }
    this.brushProperties.opacity = value;
  }

  private registerWindowListeners() {
    const registerCoords = (e: MouseEvent) => {
      this.coords = {
        x: e.x - this.canvas.offsetLeft + window.scrollX,
        y: e.y - this.canvas.offsetTop + window.scrollY,
      };
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
    ctx.globalAlpha = this.brushProperties.opacity / 100;
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
    this.prevCoords = { ...this.coords };
  }

  private animate() {
    if (!this.isDrawing) return;
    this.draw();
    requestAnimationFrame(this.animate.bind(this));
  }
}

const canvas = document.getElementById('canvas');

const paint = new Paint(canvas as HTMLCanvasElement, {
  width: 600,
  height: 600,
});

const colorPrimaryInput = <HTMLInputElement>document.getElementById('color-primary');
const colorSecondaryInput = <HTMLInputElement>document.getElementById('color-secondary');
const brushSizeInput = <HTMLInputElement>document.getElementById('brush-size');
const brushOpacityInput = <HTMLInputElement>document.getElementById('brush-opacity');
const updateBrushSizeIndicator = () => {
  document.getElementById('brush-size-indicator')!.textContent = brushSizeInput.value;
};
const updateBrushOpacityIndicator = () => {
  document.getElementById('brush-opacity-indicator')!.textContent = brushOpacityInput.value;
};

colorPrimaryInput.value = paint.brushColor.primary;
colorSecondaryInput.value = paint.brushColor.secondary;
brushSizeInput.value = `${paint.brushProperties.size}`;
brushOpacityInput.value = `${paint.brushProperties.opacity}`;
updateBrushSizeIndicator();
updateBrushOpacityIndicator();

colorPrimaryInput.addEventListener('change', e => {
  paint.setPrimaryBrushColor((e.target as HTMLInputElement).value);
});
colorSecondaryInput.addEventListener('change', e => {
  paint.setSecondaryBrushColor((e.target as HTMLInputElement).value);
});
brushSizeInput.addEventListener('input', e => {
  const value = +(e.target as HTMLInputElement).value;
  paint.setBrushSize(value);
  updateBrushSizeIndicator();
});
brushOpacityInput.addEventListener('input', e => {
  const value = +(e.target as HTMLInputElement).value;
  paint.setBrushOpacity(value);
  updateBrushOpacityIndicator();
});
