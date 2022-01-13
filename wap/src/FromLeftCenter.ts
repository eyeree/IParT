import { randf } from './Random';
import { MAX_GRAVITY, MIN_DEFLECTION, MAX_DEFLECTION } from './Configuration';
import { ParticleConstructor } from './Particle';
import { Info } from "./Info";

export function FromLeftCenter<TBase extends ParticleConstructor>(info: Info, Base: TBase) {

    class FromLeftCenter extends Base {

        static width = randf(5, 20);
        static deflection: number = randf(MIN_DEFLECTION, MAX_DEFLECTION);

        constructor(...args: any[]) {
            super(...args);
            const center = this.canvasHeight / 2;
            this.x = 0;
            this.y = randf(center - FromLeftCenter.width, center + FromLeftCenter.width);
            const ddx = randf(MAX_GRAVITY * 2, MAX_GRAVITY * 4);
            this.dx += ddx;
            const ddy = randf(-FromLeftCenter.deflection, FromLeftCenter.deflection) * 5;
            this.dy += ddy;
            if (this.trace) {
                console.log("[FromLeftCenter] y: %f - dx: %f - dx += %f - dy - dy += %f", this.y, this.dx, ddx, this.dy, ddy);
            }
        }

    }

    info.addStat("emitter", "left-center");

    return FromLeftCenter;

}
