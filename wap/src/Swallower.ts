import { ParticleConstructor } from './Particle';
import { Mouse } from "./Mouse";
import { Info } from "./Info";
import { randfs, rand1 } from './Random';
import { Background } from './Background';

const BASE_STRENGTH = 8000;
const MIN_VARIANCE = 0;
const MAX_VARIANCE = 4000;
const MAX_STRENGTH = BASE_STRENGTH + MAX_VARIANCE;

export function Swallower<TBase extends ParticleConstructor>(info: Info, background:Background, Base: TBase) {

    class Swallower extends Base {

        static readonly strength = BASE_STRENGTH + randfs(MIN_VARIANCE, MAX_VARIANCE);
        static readonly x = rand1();
        static readonly y = rand1();
        static readonly radius = 20 * (Swallower.strength / MAX_STRENGTH);

        update(dt: number) {

            const swallowerX = this.canvasWidth * Swallower.x;
            const swallowerY = this.canvasHeight * Swallower.y;

            const distance = Math.sqrt(Math.pow(swallowerX - this.x, 2) + Math.pow(swallowerY - this.y, 2));

            const diffX = swallowerX - this.x;
            const diffY = swallowerX - this.y;
            const force = ((1 / distance) * Swallower.strength) * dt;
            const angle = Math.atan2(diffY, diffX);
            const ddx = Math.cos(angle) * force;
            const ddy = Math.sin(angle) * force;

            if(distance < Swallower.radius) {
                this.dx = ddx * 0.01;
                this.dy = ddy * 0.01;
                this.health -= 1 * dt;
            } else {
                this.dx += ddx;
                this.dy += ddy;
            }

            if (this.trace) {
                console.log("[Swallower] dx: %f - dy: %f - ddx: %f - ddy: %f - force: %f - angle: %f - distance: %f - health: %f", this.dx, this.dy, ddx, ddy, force, angle, distance, this.health);
                this.context.beginPath();
                this.context.strokeStyle = "yellow";
                this.context.moveTo(this.x, this.y);
                this.context.lineTo(this.x + ddx * 10, this.y + ddy * 10);
                this.context.stroke();
            }

            super.update(dt);

        }

        static Draw() {
        }

    }

    background.onupdate((dt:number) => {

        const swallowerX = background.canvasWidth * Swallower.x;
        const swallowerY = background.canvasHeight * Swallower.y;

        background.context.beginPath();
        background.context.fillStyle = "blue";
        background.context.arc(swallowerX, swallowerY, Swallower.radius, 0, Math.PI * 2);
        background.context.closePath();
        background.context.fill();
    });

    info.addStat("swallower", Swallower.strength);
    console.log("Swallower", Swallower.x, Swallower.y);

    return Swallower;

}
