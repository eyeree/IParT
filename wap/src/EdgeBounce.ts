import { randf, randfs } from './Random';
import { MIN_DEFLECTION, MAX_DEFLECTION } from './Configuration';
import { ParticleConstructor } from './Particle';
import { Info } from "./Info";

export function EdgeBounce<TBase extends ParticleConstructor>(info: Info, Base: TBase) {

    class EdgeBounce extends Base {

        static maxDeflection: number = randf(15, 20);
        static minDeflection: number = randf(MIN_DEFLECTION, MAX_DEFLECTION);

        update(seconds: number) {
            super.update(seconds);
            if (this.x < 0 + this.radius) {
                this.x = this.radius;
                if (Math.abs(this.dy) < 0.5) {
                    this.dy = randfs(EdgeBounce.minDeflection, EdgeBounce.maxDeflection);
                    if (this.trace) {
                        console.log("[EdgeBounce] LEFT DEFLECTED - x: %f - dx: %f", this.y, this.dy);
                    }
                }
                this.dx = -this.dx;
                if (this.trace) {
                    console.log("[EdgeBounce] LEFT - x: %f - dx: %f", this.x, this.dx);
                }
            } else if (this.x > this.canvasWidth - this.radius) {
                this.x = this.canvasWidth - this.radius;
                if (Math.abs(this.dy) < 0.5) {
                    this.dy = randfs(EdgeBounce.minDeflection, EdgeBounce.maxDeflection);;
                    if (this.trace) {
                        console.log("[EdgeBounce] RIGHT DEFLECTED - y: %f - yx: %f", this.y, this.dy);
                    }
                }
                this.dx = -this.dx;
                if (this.trace) {
                    console.log("[EdgeBounce] RIGHT - x: %f - dx: %f", this.x, this.dx);
                }
            }
            if (this.y < 0 + this.radius) {
                this.y = this.radius;
                if (Math.abs(this.dx) < 0.5) {
                    this.dx = randfs(EdgeBounce.minDeflection, EdgeBounce.maxDeflection);;
                    if (this.trace) {
                        console.log("[EdgeBounce] TOP DEFLECTED - x: %f - dx: %f", this.x, this.dx);
                    }
                }
                this.dy = -this.dy;
                if (this.trace) {
                    console.log("[EdgeBounce] TOP - y: %f - dy: %f", this.y, this.dy);
                }
            } else if (this.y > this.canvasHeight - this.radius) {
                this.y = this.canvasHeight - this.radius;
                if (Math.abs(this.dx) < 0.5) {
                    this.dx = randfs(EdgeBounce.minDeflection, EdgeBounce.maxDeflection);
                    if (this.trace) {
                        console.log("[EdgeBounce] BOTTOM DEFLECTED - x: %f - dx: %f", this.x, this.dx);
                    }
                }
                this.dy = -this.dy;
                if (this.trace) {
                    console.log("[EdgeBounce] BOTTOM - y: %f - dy: %f", this.y, this.dy);
                }
            }
        }

    }

    info.addStat("edge", "bounce");
    console.log("[EdgeBound] minDeflection: %f - maxDeflection: %f", EdgeBounce.minDeflection, EdgeBounce.maxDeflection);

    return EdgeBounce;

}
