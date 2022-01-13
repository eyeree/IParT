import { ParticleConstructor } from './Particle';
import { Info } from "./Info";

export function DeathShrink<TBase extends ParticleConstructor>(info: Info, Base: TBase) {

    class DeathShrink extends Base {

        baseRadius = 0;

        update(seconds: number) {
            super.update(seconds);
            if (this.health < 1) {
                if (this.baseRadius == 0) {
                    this.baseRadius = this.radius;
                }
                this.radius = this.baseRadius * this.health;
                if (this.trace) {
                    console.log("[DeathShrink] radius: %f - health: %f", this.radius, this.health);
                }
            }
        }

    }

    info.addStat("death", "shrink");

    return DeathShrink;

}
