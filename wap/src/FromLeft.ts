import { randf } from './Random';
import { MAX_GRAVITY } from './Configuration';
import { ParticleConstructor } from './Particle';
import { Info } from "./Info";

export function FromLeft<TBase extends ParticleConstructor>(info: Info, Base: TBase) {

    class FromLeft extends Base {

        constructor(...args: any[]) {
            super(...args);
            this.x = 0;
            this.y = randf(0, this.canvasHeight);
            const ddx = randf(MAX_GRAVITY, MAX_GRAVITY * 2);
            this.dx += ddx;
            if (this.trace) {
                console.log("[FromLeft] y: %f - dx: %f - dx += %f", this.y, this.dx, ddx);
            }
        }

    }

    info.addStat("emitter", "left");

    return FromLeft;

}
