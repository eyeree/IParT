import { randf } from './Random';
import { MAX_GRAVITY, MIN_DEFLECTION, MAX_DEFLECTION } from './Configuration';
import { ParticleConstructor } from './Particle';
import { Info } from "./Info";

export function FromBottomCenter<TBase extends ParticleConstructor>(info: Info, Base: TBase) {

    class FromBottomCenter extends Base {

        static width = randf(5, 20);
        static deflection: number = randf(MIN_DEFLECTION, MAX_DEFLECTION);

        constructor(...args: any[]) {
            super(...args);
            const center = this.canvasWidth / 2;
            this.x = randf(center - FromBottomCenter.width, center + FromBottomCenter.width);
            this.y = this.canvasHeight;
            const ddy = randf(MAX_GRAVITY * 4, MAX_GRAVITY * 8);
            this.dy -= ddy;
            const ddx = randf(-FromBottomCenter.deflection, FromBottomCenter.deflection) * 5;
            this.dx += ddx;
            if (this.trace) {
                console.log("[FromBottomCenter] x: %f - dx: %f - ddx: %f dy: %f - ddy: %f", this.x, this.dx, ddx, this.dy, ddy);
            }
        }

    }

    info.addStat("emitter", "fountain");

    return FromBottomCenter;

}
