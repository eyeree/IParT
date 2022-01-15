import { BACKGROUND_COLOR } from './Pallet';
import { Info } from "./Info";

export class Background {

    constructor(info: Info, private context: CanvasRenderingContext2D) {
        info.addStat("background", BACKGROUND_COLOR);
    }

    public draw() {
        this.context.fillStyle = BACKGROUND_COLOR;
        this.context.fillRect(0, 0, this.context.canvas.width, this.context.canvas.height);
    }
    
}
