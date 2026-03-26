import type { SoundData } from "./SignalGraph";
import { NOTES } from "./Notes";
export class Visualise {
  width: number;
  height: number;
  ctx: CanvasRenderingContext2D;
  sound: SoundData;

  constructor(ctx: CanvasRenderingContext2D, width: number, height: number) {
    this.ctx = ctx;
    this.width = width;
    this.height = height;
    this.sound = [];
  }
  drawGrid() {
    
    for (const [note, metadata] of Object.entries(NOTES)) {
      
    }
  }
}
