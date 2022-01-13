import { Info } from './Info';

export class Frame {

    private static readonly MAX_DT = 1 / 30;

    public last = performance.now();
    private count = 0;
    private elapsed = 0;
    private fps = 0;
    public debugMode = false;
    private advanceDebugFrame = false;

    constructor(private info: Info) {
        info.addStat("fps", () => Math.round(this.fps));
    }

    getDT(time: number): number {

        const dt = (time - this.last) / 1000;
        this.last = time;

        this.count++;
        this.elapsed += dt;
        if (this.elapsed >= 1) {
            this.fps = this.count;
            this.count = 0;
            this.elapsed = 0;
        }

        if(this.debugMode) {
            return 1/3000;
        } else {
            return dt > Frame.MAX_DT ? Frame.MAX_DT : dt;
        }


    }

    nextDebugFrame() {
        this.advanceDebugFrame = true;
    }

}
