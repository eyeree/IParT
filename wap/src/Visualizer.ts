import { randa, randf } from './Random';
import { PALLET } from './Pallet';
import { Particle } from './Particle';
import { Info } from "./Info";

export interface DrawOptions {
    radius?:number;
    style?:string;
}

export class Visualizer {

    constructor(info:Info, private context:CanvasRenderingContext2D, private options?:DrawOptions) {
        // info.addStat("fill", "solid");
    }

    init(p:Particle) {
        p.style = this.options?.style ?? randa(PALLET, 1);
        p.radius = this.options?.radius ?? randf(3, 6);
    }

    draw(p:Particle) {
        this.context.beginPath();
        this.context.fillStyle = p.style;
        this.context.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        this.context.closePath();
        this.context.fill();

        if (p.trace) {
            this.context.beginPath();
            this.context.strokeStyle = "hotpink";
            this.context.moveTo(0, p.y);
            this.context.lineTo(this.context.canvas.width, p.y);
            this.context.moveTo(p.x, 0);
            this.context.lineTo(p.x, this.context.canvas.height);
            this.context.stroke();
        }
    }

}

