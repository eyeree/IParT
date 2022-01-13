import { ParticleConstructor } from './Particle';
import { Mouse } from "./Mouse";
import { Info } from "./Info";
import { randfs, randa } from './Random';

export enum MouseMoveMode {
    Pull,
    Push,
    Kill
};

const MouseMoveModes = [MouseMoveMode.Pull, MouseMoveMode.Push];

export function MouseMove<TBase extends ParticleConstructor>(info: Info, mouse: Mouse, Base: TBase) {

    class MouseMove extends Base {

        static readonly strength = 10000 + randfs(0, 4000);
        static readonly mode = randa(MouseMoveModes);

        update(dt: number) {
            if (mouse.down) {
                const distance = Math.sqrt(Math.pow(mouse.x - this.x, 2) + Math.pow(mouse.y - this.y, 2));
                const diffX = mouse.x - this.x;
                const diffY = mouse.y - this.y;
                const force = ((1 / distance) * MouseMove.strength) * dt;
                const angle = Math.atan2(diffY, diffX);
                let ddx = Math.cos(angle) * force;
                let ddy = Math.sin(angle) * force;

                if(MouseMove.mode == MouseMoveMode.Kill && distance < 5) {
                    this.dx = 0;
                    this.dy = 0;
                    this.health -= 0.5 * dt;
                } else {

                    if(MouseMove.mode == MouseMoveMode.Push) {
                        ddx = -ddx;
                        ddy = -ddy;
                    } else if(distance < 50) {
                        const slow = distance / 50;
                        ddx *= slow;
                        ddy *= slow;
                    }

                    this.dx += ddx;
                    this.dy += ddy;

                }

                if (this.trace) {
                    console.log("[MouseMove] dx: %f - dy: %f - ddx: %f - ddy: %f - force: %f - angle: %f - distance: %f", this.dx, this.dy, ddx, ddy, force, angle, distance);
                    this.context.beginPath();
                    this.context.strokeStyle = "yellow";
                    this.context.moveTo(this.x, this.y);
                    this.context.lineTo(this.x + ddx * 10, this.y + ddy * 10);
                    this.context.stroke();
                }

            }
            super.update(dt);
        }

    }

    info.addStat("mouse", `${MouseMoveMode[MouseMove.mode].toLowerCase()} (${MouseMove.strength.toFixed(0)})`);

    return MouseMove;

}
