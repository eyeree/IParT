import { randf } from './Random';
import { MAX_GRAVITY } from './Configuration';
import { ParticleConstructor } from './Particle';
import { Info } from "./Info";

export function FromBottom<TBase extends ParticleConstructor>(info: Info, Base: TBase) {

    class FromBottom extends Base {

        constructor(...args: any[]) {
            super(...args);
            this.x = randf(0, this.canvasWidth);
            this.y = this.canvasHeight;
            const ddy = randf(MAX_GRAVITY * 2, MAX_GRAVITY * 4);
            this.dy -= ddy;
            if (this.trace) {
                console.log("[FromBottom] x: %f - dy: %f - dy -= %f", this.x, this.dy, ddy);
            }
        }

    }

    info.addStat("emitter", "bottom");

    return FromBottom;

}
