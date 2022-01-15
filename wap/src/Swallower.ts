import { Particle } from './Particle';
import { Info } from "./Info";
import { rand1, rande } from './Random';

export enum Strength {
    None =       0,
    Small =   4000,
    Medium =  8000,
    Large =  12000
}

const Radius:{[key:number]:number} = {
    [Strength.None]:    0,
    [Strength.Small]:  10,
    [Strength.Medium]: 20,
    [Strength.Large]:  30
}

export class Swallower {

    public readonly strength = rande(Strength);
    public readonly x = rand1();
    public readonly y = rand1();
    public readonly radius = Radius[this.strength];

    private frame_x:number = 0;
    private frame_y:number = 0;
    private frame_strength:number = 0;

    constructor(info:Info, private context:CanvasRenderingContext2D) {
        info.addStat("swallower", Strength[this.strength].toLowerCase());
    }

    frame(dt: number): void {

        if(this.strength == Strength.None) return;

        this.frame_x = this.context.canvas.width * this.x;
        this.frame_y = this.context.canvas.height * this.y;

        this.frame_strength = this.strength * dt;  
        
    }

    update(p:Particle, dt:number) {

        p.style

        if(this.strength == Strength.None) return;

        const [ddx, ddy, distance] = p.forceFrom(this.frame_x, this.frame_y, this.frame_strength);

        if(distance < this.radius) {
            const slow = distance / this.radius;
            p.dx = ddx * slow;
            p.dy = ddy * slow;
            p.health -= 2 * dt;
        } else {
            p.dx += ddx;
            p.dy += ddy;
        }

        if (p.trace) {
            console.log("[Swallower] dx: %f - dy: %f - ddx: %f - ddy: %f - distance: %f - health: %f", p.dx, p.dy, ddx, ddy, distance, p.health);
        }

    }

    draw() {
        this.context.beginPath();
        this.context.fillStyle = "blue";
        this.context.arc(this.frame_x, this.frame_y, this.radius, 0, Math.PI * 2);
        this.context.closePath();
        this.context.fill();
    }

}

