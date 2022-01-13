import { randf, randa } from './Random';
import { PALLET } from './Pallet';
import { ParticleConstructor } from './Particle';
import { Info } from "./Info";

export interface DrawOptions {
    radius?:number;
    style?:string;
}

export function DrawArc<TBase extends ParticleConstructor>(info: Info, Base: TBase, options: DrawOptions = {}) {

    class DrawArc extends Base {

        readonly style: string = options?.style ?? randa(PALLET, 1);

        constructor(...args: any[]) {
            super(...args);
            this.radius = options?.radius ?? randf(3, 6);
        }

        draw() {
            this.context.beginPath();
            this.context.fillStyle = this.style;
            this.context.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            this.context.closePath();
            this.context.fill();

            if (this.trace) {
                this.context.beginPath();
                this.context.strokeStyle = "hotpink";
                this.context.moveTo(0, this.y);
                this.context.lineTo(this.canvasWidth, this.y);
                this.context.moveTo(this.x, 0);
                this.context.lineTo(this.x, this.canvasHeight);
                this.context.stroke();
            }
        }

    }

    info.addStat("fill", "solid");

    return DrawArc;

}
