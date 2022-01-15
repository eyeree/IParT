import { Info } from "./Info";
import { Particle } from "./Particle";
import { rande } from "./Random";

enum SizeRadius {
    Small = 3,
    Medium = 10,
    Large = 15,
}

enum SizeMode {    
    Fixed_Small,
    Fixed_Medium,
    Fixed_Large,
    Fixed_Random,
    Speed_Grows,
    Speed_Shrinks,
    Age_Grows,
    Age_Shrinks,
}

const SizeModeUpdate = { 
    [SizeMode.Fixed_Small]: (p:Particle) => p.radius,
    [SizeMode.Fixed_Medium]: (p:Particle) => p.radius,
    [SizeMode.Fixed_Large]: (p:Particle) => p.radius,
    [SizeMode.Fixed_Random]: (p:Particle) => p.radius,
    [SizeMode.Speed_Grows]: (p:Particle) => MIN_SIZE + (Math.min(MAX_SPEED, p.speed) / MAX_SPEED) * MAX_SIZE,
    [SizeMode.Speed_Shrinks]: (p:Particle) => MIN_SIZE + (MAX_SPEED / Math.min(MAX_SPEED, p.speed)) * MAX_SIZE,
    [SizeMode.Age_Grows]: (p:Particle) => MIN_SIZE + (p.age / p.life) * MAX_SIZE,
    [SizeMode.Age_Shrinks]: (p:Particle) => MIN_SIZE + (p.life / p.age) * MAX_SIZE,
}

const SizeModeInit = { 
    [SizeMode.Fixed_Small]: (p:Particle) => SizeRadius.Small,
    [SizeMode.Fixed_Medium]: (p:Particle) => SizeRadius.Medium,
    [SizeMode.Fixed_Large]: (p:Particle) => SizeRadius.Large,
    [SizeMode.Fixed_Random]: (p:Particle) => rande(SizeRadius),
    [SizeMode.Speed_Grows]: SizeModeUpdate[SizeMode.Speed_Grows],
    [SizeMode.Speed_Shrinks]: SizeModeUpdate[SizeMode.Speed_Shrinks],
    [SizeMode.Age_Grows]: SizeModeUpdate[SizeMode.Age_Grows],
    [SizeMode.Age_Shrinks]: SizeModeUpdate[SizeMode.Age_Shrinks],
}

const MIN_SIZE = 1;
const MAX_SIZE = 20 - MIN_SIZE;

const MAX_SPEED = 200;

export class Size {

    readonly mode = rande(SizeMode);
    readonly _init = SizeModeInit[this.mode];
    readonly _update = SizeModeUpdate[this.mode];

    constructor(info:Info) {
        info.addStat("size", SizeMode[this.mode]);
    }

    init(p:Particle) {
        p.radius = this._init(p);
    }

    update(p:Particle, dt:number) {
        p.radius = this._update(p) * p.health;
    }

}