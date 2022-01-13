import { randf } from './Random';
import { MAX_GRAVITY } from './Configuration';
import { ParticleConstructor } from './Particle';
import { Info } from "./Info";

export function FromCenter<TBase extends ParticleConstructor>(info: Info, Base: TBase) {

    class FromCenter extends Base {

        static max = MAX_GRAVITY * 2;
        static min = -FromCenter.max;

        constructor(...args: any[]) {
            super(...args);
            this.x = this.canvasWidth / 2;
            this.y = this.canvasHeight / 2;
            const ddy = randf(FromCenter.min, FromCenter.max);
            const ddx = randf(FromCenter.min, FromCenter.max);
            this.dy += ddy;
            this.dx += ddx;
            if (this.trace) {
                console.log("[FromCenter] x: %f - dy: %f - dy -= %f - dx: %f - dx -= %f", this.x, this.dy, ddy, this.dx, ddx);
            }
        }

    }

    info.addStat("emitter", "center");

    return FromCenter;

}
