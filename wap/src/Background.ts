import { Context, ContextBase } from './ContextBase';
import { BACKGROUND_COLOR } from './Pallet';
import { Info } from "./Info";

export class Background extends ContextBase {

    constructor(private info: Info, context: Context) {
        super(context);
        info.addStat("background", BACKGROUND_COLOR);
    }

    public update(seconds: number) {
        this.context.fillStyle = BACKGROUND_COLOR;
        this.context.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
    }
}
