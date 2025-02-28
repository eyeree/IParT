import { Info } from './Info';
import { ParticleSet } from './ParticleSet';
import { randf } from './Random';
import { Swallower } from './Swallower';

export class Scale {

    public width = 0;
    public height = 0;
    public dpr = 0;

    constructor(private info: Info, private context: CanvasRenderingContext2D, private particles:ParticleSet, private swallower:Swallower) {

        const setSize = () => {

            this.dpr = window.devicePixelRatio || 1;

            const rect = context.canvas.getBoundingClientRect();

            if (rect.width == 0 || rect.height == 0) {
                if(DEBUG) {
                    console.log("[Scale] ignoring", rect.width, rect.height);
                }
                return;
            }

            const dx = rect.width / this.width;
            const dy = rect.height / this.height;

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

            if(DEBUG) {
                console.log("[Scale] dx: %2.4f - dy: %2.4f - dpr: %4.4f - width: %2.4f - height: %2.4f", dx, dy, this.dpr, this.width, this.height);
            }
            swallower.x *= dx;
            swallower.y *= dy;

            particles.forEach(p => {
                p.x *= dx;
                p.y *= dy;
            });
            
        };

        window.onresize = setSize;

        setSize();

        swallower.x = this.width * randf(0.1, 0.9);
        swallower.y = this.height * randf(0.1, 0.9);        

        // info.addStat("window", () => `${context.canvas.clientWidth}x${context.canvas.clientHeight}`);
        // info.addStat("dpr", () => window.devicePixelRatio);

    }
}
