import { ParticleConstructor } from './Particle';
import { Info } from "./Info";

export function EdgeKill<TBase extends ParticleConstructor>(info: Info, Base: TBase) {

    class EdgeKill extends Base {

        update(seconds: number) {
            super.update(seconds);
            if (this.x < 0 - this.radius ||
                this.x > this.canvasWidth + this.radius ||
                this.y < 0 - this.radius ||
                this.y > this.canvasHeight + this.radius) {
                this.health = 0;
                if (this.trace) {
                    console.log("[EdgeKill] x: %f - y: %f - radius: %f", this.x, this.y, this.radius);
                }
            }
        }

    }

    info.addStat("edge", "die");

    return EdgeKill;

}
