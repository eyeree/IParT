import { Info } from './Info';

export class Scale {

    public width = 0;
    public height = 0;
    public dpr = 0;

    constructor(private info: Info, private context: CanvasRenderingContext2D) {

        const setSize = () => {
            this.dpr = window.devicePixelRatio || 1;
            console.log("DPR", this.dpr);
            const rect = context.canvas.getBoundingClientRect();
            this.width = rect.width;
            this.height = rect.height;
            
            // No Scaling
            // context.canvas.width = rect.width;
            // context.canvas.height = rect.height;
            // this.dpr = 1;

            // Use DPI Scaling
            context.canvas.width = rect.width * this.dpr;
            context.canvas.height = rect.height * this.dpr;
            context.scale(this.dpr, this.dpr);
            
        };

        window.onresize = setSize;

        setSize();

        info.addStat("window", () => `${context.canvas.clientWidth}x${context.canvas.clientHeight}`);
        info.addStat("dpr", () => window.devicePixelRatio);

    }
}
