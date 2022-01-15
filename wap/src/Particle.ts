import { Visualizer } from './Visualizer';

let traceNext = false;

export class Particle {

    public x: number = 0;
    public y: number = 0;
    public dx: number = 0;
    public dy: number = 0;
    public health: number = 0;
    public life: number = 0;
    public age: number = 0;
    public style:string = "";
    public radius:number = 0;
    public trace: boolean = false;

    get isOld() { return this.age > this.life; }
    get isDead() { return this.health <= 0; }

    public constructor() {
        if (traceNext) {
            this.trace = true;
            traceNext = false;
            console.log("[Particle] Created Particle");
        }
    }

    public died() {
        if(this.trace) {
            traceNext = true;
        }
    }

    public kill() {
        this.health = 0;
    }

    public forceFrom(x:number, y:number, strength:number):[number, number, number] {
        const diffX = x - this.x;
        const diffY = y - this.y;
        const distance = Math.sqrt(diffX * diffX + diffY * diffY);
        const force = (1 / distance) * strength;
        const angle = Math.atan2(diffY, diffX);
        const ddx = Math.cos(angle) * force;
        const ddy = Math.sin(angle) * force;
        return [ddx, ddy, distance];
    }

    get speed() { 
        return Math.sqrt(this.dx*this.dx + this.dy*this.dy); 
    }

}
