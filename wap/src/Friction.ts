import { randf } from './Random';
import { MIN_FRICTION, MAX_FRICTION } from './Configuration';
import { ParticleConstructor } from './Particle';
import { Info } from "./Info";

export function Friction<TBase extends ParticleConstructor>(info: Info, Base: TBase) {

    class Friction extends Base {

        static readonly friction: number = randf(MIN_FRICTION, MAX_FRICTION);

        update(seconds: number) {
            const friction = Friction.friction * seconds;
            const ddy = 1 - friction;
            const ddx = 1 - friction;
            this.dy *= ddy;
            this.dx *= ddx;
            if (this.trace) {
                console.log("[Friction] friction: %f - dx: %f - dx -= %f - dy: %f - dy -= %f", Friction.friction, this.dx, ddx, this.dy, ddy);
            }
            super.update(seconds);
        }

    }

    info.addStat("friction", Friction.friction.toFixed(2));

    return Friction;

}
