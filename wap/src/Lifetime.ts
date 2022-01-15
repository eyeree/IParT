import { rande, randfs } from './Random';
import { Particle } from './Particle';
import { Info } from "./Info";

enum Longevity {
    Fleeting =  3,
    Low =      10,
    Medium =   30,
    High =     60
}

const LongevityWeights = {
    [Longevity.Fleeting]: 1,
    [Longevity.Low]:      5,
    [Longevity.Medium]:   5,
    [Longevity.High]:     5,
};

enum StoppedDecline {
    None = 1,
    Slow = 0.9,
    Medium = 0.7,
    Fast = 0.5
}

const MIN_VARIANCE_PERCENT = 0.0;
const MAX_VARIANCE_PERCENT = 0.1;

const OLD_DECLINE_PERCENT = 0.1;

const MIN_SPEED = 0.5;

export class Lifetime {

    readonly longevity:Longevity = rande(Longevity, LongevityWeights);
    readonly oldDecline = this.longevity * OLD_DECLINE_PERCENT;
    readonly stoppedDecline = rande(StoppedDecline);

    private frame_oldDecline = 0;
    private frame_stoppedDecline = 0;

    constructor(info:Info) {
        info.addStat("longevity", Longevity[this.longevity].toLowerCase());
    }

    init(p:Particle) {
        p.health = 1;
        p.life = this.longevity + (this.longevity * randfs(MIN_VARIANCE_PERCENT, MAX_VARIANCE_PERCENT));
    }

    frame(dt:number) {
        this.frame_oldDecline = this.oldDecline * dt;
        this.frame_stoppedDecline = this.stoppedDecline * dt;
    }

    update(p:Particle, dt:number) {
        
        p.age += dt;

        if(p.isOld) {
            p.health -= this.frame_oldDecline;
        }

        if(this.stoppedDecline != StoppedDecline.None && p.speed < MIN_SPEED) {
            p.health -= this.frame_stoppedDecline;            
        }

        if(p.health <= 0) {
            p.health = 0;
            p.died();
        }

        if(p.trace) {
            console.log(
                "[Lifetime] age: %.2f - life: %.2f - isDying: %s - health: %.4f - isDead: %s - longevity: %d - decline: %.4f - frame_decline: %.4f", 
                p.age, p.life, p.isOld, p.health, p.isDead, this.longevity, this.oldDecline, this.frame_oldDecline
            );
        }

    }

}
