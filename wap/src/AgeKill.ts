import { randf } from './Random';
import { MIN_LIFE, MAX_LIFE, MAX_DELTA_LIFE, MIN_DELTA_LIFE } from './Configuration';
import { ParticleConstructor } from './Particle';
import { Info } from "./Info";

export function AgeKill<TBase extends ParticleConstructor>(info: Info, Base: TBase, options: { life?: number; } = {}) {

    class AgeKill extends Base {

        static baseLife = options?.life ?? randf(MIN_LIFE, MAX_LIFE);

        constructor(...args: any[]) {
            super(...args);
            this.life = AgeKill.baseLife + randf(MIN_DELTA_LIFE, MAX_DELTA_LIFE);
            if (this.trace) {
                console.log("[AgeKill] - life: %f", this.life);
            }
        }

    }

    info.addStat("life", AgeKill.baseLife.toFixed(2));

    return AgeKill;

}
