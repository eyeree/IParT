import { randf } from './Random';
import { MAX_GRAVITY, MIN_DEFLECTION, MAX_DEFLECTION } from './Configuration';
import { ParticleConstructor } from './Particle';
import { Info } from "./Info";

export function FromTopCenter<TBase extends ParticleConstructor>(info: Info, Base: TBase) {

    class FromTopCenter extends Base {

        static readonly width = randf(5, 20);
        static readonly deflection: number = randf(MIN_DEFLECTION, MAX_DEFLECTION);

        constructor(...args: any[]) {
            super(...args);
            const center = this.canvasWidth / 2;
            this.x = randf(center - FromTopCenter.width, center + FromTopCenter.width);
            this.y = 0;
            const ddy = randf(MAX_GRAVITY, MAX_GRAVITY * 3);
            this.dy += ddy;
            const ddx = randf(-FromTopCenter.deflection, FromTopCenter.deflection) * 5;
            this.dx += ddx;
            if (this.trace) {
                console.log("[FromTopCenter] x: %f - dx: %f - ddy: %f - dy: %f - ddy: %f", this.x, this.dx, ddx, this.dy, ddy);
            }
        }

    }

    info.addStat("emitter", "top-center");
    console.log("[FromTopCenter] deflection: %f - width: %f", FromTopCenter.deflection, FromTopCenter.width);

    return FromTopCenter;

}
