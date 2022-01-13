import { randf } from './Random';
import { MIN_GRAVITY, MAX_GRAVITY } from './Configuration';
import { ParticleConstructor } from './Particle';
import { Info } from "./Info";

export function Gravity<TBase extends ParticleConstructor>(info: Info, Base: TBase) {

    class Gravity extends Base {

        static readonly gravity: number = randf(MIN_GRAVITY, MAX_GRAVITY);

        update(seconds: number) {
            this.dy += Gravity.gravity * seconds;
            if (this.trace) {
                console.log("[Gravity] dy: %f - dy += %f", this.dy, Gravity.gravity * seconds);
            }
            super.update(seconds);
        }

    }

    info.addStat("gravity", Gravity.gravity.toFixed(2));

    return Gravity;

}
