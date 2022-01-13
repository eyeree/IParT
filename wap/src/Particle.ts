import { Context, ContextBase } from './ContextBase';

export const IMMORTAL = 0;

let traceNext = false;

export type ParticleConstructor = new (...args: any[]) => Particle;

export class Particle extends ContextBase {

    public x: number = 0;
    public y: number = 0;
    public dx: number = 0;
    public dy: number = 0;
    public radius: number = 1;
    public health: number = 1;
    public life: number = IMMORTAL;
    public lived: number = 0;
    public trace: boolean = false;

    static update(dt:number) {
        
    }

    public constructor(context: Context) {
        super(context);
        if (traceNext) {
            this.trace = true;
            traceNext = false;
            console.log("[Particle] Created Particle");
        }
    }

    public update(seconds: number) {

        this.x += this.dx * seconds;
        this.y += this.dy * seconds;

        if (this.life != IMMORTAL) {
            this.lived += seconds;
            this.health = 1 - (this.lived / this.life);
        }

        if (this.trace) {
            console.log(
                "[Particle] Update - seconds: %f - dx: %f - x += %f - dy: %f - y += %f - x: %f - y:%f - life: %f - lived: %f - health: %f",
                seconds, this.dx, this.dx * seconds, this.dy, this.dy * seconds, this.x, this.y, this.life, this.lived, this.health
            );
            this.context.beginPath();
            this.context.strokeStyle = "white";
            this.context.moveTo(this.x, this.y);
            this.context.lineTo(this.x + this.dx, this.y + this.dy);
            this.context.stroke();            
        }

    }

    public draw() { }

    public dead() {
        if(this.trace) {
            traceNext = true;
        }
    }

}
