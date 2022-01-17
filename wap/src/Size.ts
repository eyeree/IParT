import { Info } from "./Info";
import { Particle } from "./Particle";
import { rande } from "./Random";

const MIN_SIZE = 3;
const MAX_SIZE = 10;

const MAX_SPEED = 200;

enum SizeRadius {
    Small = 3,
    Medium = 5,
    Large = 10,
}

enum SizeMode {    
    Fixed_Small,
    Fixed_Medium,
    Fixed_Large,
    // Fixed_Random,
    Speed_Grows,
    Speed_Shrinks,
    Age_Grows,
    Age_Shrinks,
}


const SizeModeInit = { 
    [SizeMode.Fixed_Small]: (p:Particle) => SizeRadius.Small,
    [SizeMode.Fixed_Medium]: (p:Particle) => SizeRadius.Medium,
    [SizeMode.Fixed_Large]: (p:Particle) => SizeRadius.Large,
    // [SizeMode.Fixed_Random]: (p:Particle) => rande(SizeRadius),
    [SizeMode.Speed_Grows]: (p:Particle) => MIN_SIZE + (Math.min(MAX_SPEED, p.speed) / MAX_SPEED) * MAX_SIZE,
    [SizeMode.Speed_Shrinks]: (p:Particle) => MIN_SIZE + (MAX_SIZE - ((Math.min(MAX_SPEED, p.speed) / MAX_SPEED) * MAX_SIZE)),
    [SizeMode.Age_Grows]: (p:Particle) => p.age > p.life ? MAX_SIZE : MIN_SIZE + ((p.age / p.life) * MAX_SIZE),
    [SizeMode.Age_Shrinks]: (p:Particle) => p.age > p.life ? MIN_SIZE : MIN_SIZE + (MAX_SIZE - ((p.age / p.life) * MAX_SIZE))
};

const SizeModeUpdate = { 
    [SizeMode.Fixed_Small]: (p:Particle) => SizeRadius.Small,
    [SizeMode.Fixed_Medium]: (p:Particle) => SizeRadius.Medium,
    [SizeMode.Fixed_Large]: (p:Particle) => SizeRadius.Large,
    // [SizeMode.Fixed_Random]: (p:Particle) => p.radius,
    [SizeMode.Speed_Grows]: SizeModeInit[SizeMode.Speed_Grows],
    [SizeMode.Speed_Shrinks]: SizeModeInit[SizeMode.Speed_Shrinks],
    [SizeMode.Age_Grows]: SizeModeInit[SizeMode.Age_Grows],
    [SizeMode.Age_Shrinks]: SizeModeInit[SizeMode.Age_Shrinks],
};


export class Size {

    readonly mode = rande(SizeMode);
    readonly _init = SizeModeInit[this.mode];
    readonly _update = SizeModeInit[this.mode];

    constructor(info:Info) {
        info.addStat("size", SizeMode[this.mode]);
    }

    init(p:Particle) {
        p.radius = this._init(p);
        if(p.trace) {
            console.log("[Size] %s init radius: %.4f", SizeMode[this.mode], p.radius);
        }
    }

    update(p:Particle, dt:number) {
        const update = this._update(p);
        p.radius = update * p.health;
        if(p.trace) {
            console.log("[Size] %s radius: %.4f - update: %.4f - health: %.4f", SizeMode[this.mode], p.radius, update, p.health);
        }
    }

}