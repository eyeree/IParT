import { rande } from './Random';
import { Particle } from './Particle';
import { Info } from "./Info";

export enum GravityLevel {
    None =    0,
    Low =    30,
    Medium = 40,
    High =   50
}

export class Gravity {

    public readonly _gravity: number = rande(GravityLevel);

    private gravity:number = 0; 

    constructor(info:Info) {
        info.addStat("gravity", GravityLevel[this._gravity].toString().toLowerCase());
    }

    public frame(dt: number): void {
        this.gravity = this._gravity * dt;
    }

    public update(p: Particle): void {
        p.dy += this.gravity;
        if (p.trace) {
            console.log("[Gravity] dx: %f - dy: %f - gravity: %f", p.dx, p.dy, this.gravity);
        }
    }

}