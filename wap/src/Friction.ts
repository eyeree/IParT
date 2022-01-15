import { rande } from './Random';
import { Particle } from './Particle';
import { Info } from "./Info";

export enum FrictionLevel {
    None =   0.00,
    Low =    0.25,
    Medium = 0.50,
    High =   1.00
}

export class Friction {

    public readonly _friction: number = rande(FrictionLevel);

    private friction:number = 0;

    constructor(info:Info) {
        info.addStat("friction", FrictionLevel[this._friction].toLowerCase());
    }

    public frame(dt: number): void {
        this.friction = 1 - (this._friction * dt);
    }

    public update(p: Particle): void {
        p.dx *= this.friction;
        p.dy *= this.friction;
        if (p.trace) {
            console.log("[Friction] dx: %f - dy: %f - friction: %f", p.dx, p.dy, this.friction);
        }
    }

}