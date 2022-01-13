import { randf } from './Random';
import { MIN_GRAVITY, MAX_GRAVITY } from './Configuration';
import { ParticleConstructor } from './Particle';
import { Info } from "./Info";

export function FromTop<TBase extends ParticleConstructor>(info: Info, Base: TBase) {

    class FromTop extends Base {

        constructor(...args: any[]) {
            super(...args);
            this.x = randf(0, this.canvasWidth);
            this.y = 0;
            const ddy = randf(MIN_GRAVITY, MAX_GRAVITY * 2);
            this.dy += ddy;
            if (this.trace) {
                console.log("[FromTop] x: %f - dy: %f - dy += %f", this.x, this.dy, ddy);
            }
        }

    }

    info.addStat("emitter", "top");

    return FromTop;

}
