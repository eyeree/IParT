import { Info } from "./Info";
import { Particle } from "./Particle";
import { rande } from "./Random";

export const MIN_RADIUS = 5;
export const MAX_RADIUS = 20;
export const RADIUS_RANGE = MAX_RADIUS - MIN_RADIUS;

export const MAX_SPEED = 50;

enum SizeRadius {
    Small = 5,
    Medium = 10,
    Large = 15,
}

export enum SizeMode {    
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
    [SizeMode.Speed_Grows]: (p:Particle) => MIN_RADIUS + (Math.min(MAX_SPEED, p.speed) / MAX_SPEED) * RADIUS_RANGE,
    [SizeMode.Speed_Shrinks]: (p:Particle) => MIN_RADIUS + (RADIUS_RANGE - ((Math.min(MAX_SPEED, p.speed) / MAX_SPEED) * RADIUS_RANGE)),
    [SizeMode.Age_Grows]: (p:Particle) => p.age > p.life ? MAX_RADIUS : MIN_RADIUS + ((p.age / p.life) * RADIUS_RANGE),
    [SizeMode.Age_Shrinks]: (p:Particle) => p.age > p.life ? MIN_RADIUS : MIN_RADIUS + (RADIUS_RANGE - ((p.age / p.life) * RADIUS_RANGE))
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

    public readonly mode = rande(SizeMode);
    private readonly _init = SizeModeInit[this.mode];
    private readonly _update = SizeModeInit[this.mode];

    constructor(info:Info) {
        info.addStat("size", SizeMode[this.mode]);
    }

    init(p:Particle) {
        p.radius = this._init(p);
        // p.radius = Math.floor(this._init(p));
        if(DEBUG && p.trace) {
            console.log("[Size] %s init radius: %.4f", SizeMode[this.mode], p.radius);
        }
    }

    update(p:Particle, dt:number) {
        const update = this._update(p);
        // p.radius = update * p.health;
        // p.radius = Math.floor(update * p.health);
        if(DEBUG && p.trace) {
            console.log("[Size] %s radius: %.4f - update: %.4f - health: %.4f", SizeMode[this.mode], p.radius, update, p.health);
        }
    }

}