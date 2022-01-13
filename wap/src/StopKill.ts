import { randf } from './Random';
import { MIN_MOVE } from './Configuration';
import { ParticleConstructor } from './Particle';
import { Info } from "./Info";
import { IMMORTAL } from './Particle';

export function StopKill<TBase extends ParticleConstructor>(info: Info, Base: TBase) {

    class StopKill extends Base {

        update(seconds: number) {
            super.update(seconds);
            if (Math.abs(this.dx) < MIN_MOVE && Math.abs(this.dy) < MIN_MOVE && this.life == IMMORTAL) {
                this.life = randf(2, 5);
                if (this.trace) {
                    console.log("[StopKill] - life: %f - dx: %f - dy: %f", this.life, this.dx, this.dy);
                }
            }
        }

    }

    info.addStat("stop", "die");

    return StopKill;

}
