import { Info } from './Info';
import { Frame } from './Frame';
import { rande } from './Random';
import { Particle } from './Particle';

export enum MouseMode {
    Pull,
    Push
};

export enum MouseStrength {
    Weak   = 8000,
    Medium = 10000,
    Strong = 15000,
}

const MOUSE_RADIUS = 20;

export class Mouse {

    private readonly show_info = document.getElementById("show_info")! as HTMLDivElement;
    private readonly full_screen = document.getElementById("full_screen")! as HTMLDivElement;

    public pointer_x = 0;
    public pointer_y = 0;
    public over = false;
    public down = false;

    readonly mode:MouseMode = rande(MouseMode);
    readonly strength:MouseStrength = rande(MouseStrength);
    frame_strength = 0;

    constructor(private info: Info, private context: CanvasRenderingContext2D, private _frame:Frame) {

        info.addStat("mouse", `${MouseStrength[this.strength].toLocaleLowerCase()}-${MouseMode[this.mode].toLowerCase()})`);

        window.onpointerenter = event => {
            this.over = true;
        };

        window.onpointerleave = event => {
            this.over = false;
        };

        window.onpointermove = event => {
            if (this.down) {
                this.pointer_x = event.x;
                this.pointer_y = event.y;
                console.log("onpointermove", this.pointer_x, this.pointer_y);
            }
        };

        window.onpointerdown = event => {
            
            if(event.target != this.context.canvas) return;

            if (this.info.isVisible) {
                console.log("onpointerdown", "info visible");
                this.info.hideInfo();
            } else {

                if(event.altKey && event.ctrlKey) {
                    this._frame.debugMode = !this._frame.debugMode;
                } else if(this._frame.debugMode && event.altKey) {
                    this._frame.nextDebugFrame();
                } else {
                    this.down = true;
                    this.pointer_x = event.x;
                    this.pointer_y = event.y;
                    document.body.setPointerCapture(event.pointerId);
                    console.log("onpointerdown", this.pointer_x, this.pointer_y);
                }
            }
            
        };

        window.onpointerup = event => {
            if (this.down) {
                this.down = false;
                this.pointer_x = event.x;
                this.pointer_y = event.y;
                document.body.releasePointerCapture(event.pointerId);
                console.log("onpointerup", this.pointer_x, this.pointer_y);
            }
        };

        this.show_info.onclick = () => {
            console.log("show_info.onclick", info.isVisible);
            if (info.isVisible) {
                info.hideInfo();
            } else {
                info.showInfo();
            }
        };

        if (document.fullscreenEnabled) {
            this.full_screen.onclick = () => {

                console.log("full_screen.onclick", document.fullscreenElement);

                if (document.fullscreenElement) {
                    document.exitFullscreen();
                } else {
                    document.documentElement.requestFullscreen();
                }

            };
        } else {
            this.full_screen.classList.add("hidden");
        }

    }

    frame(dt: number) {
        if(!this.down) return;
        this.frame_strength = this.strength * dt;
    }

    update(p:Particle) {
        
        if(!this.down) return;

        const [ddx, ddy, distance] = p.forceFrom(this.pointer_x, this.pointer_y, this.frame_strength);

        switch(this.mode) {
            case MouseMode.Push:
                p.dx -= ddx;
                p.dy -= ddy;
                break;

            case MouseMode.Pull:
                if(distance <= MOUSE_RADIUS) {
                    const slow = distance / MOUSE_RADIUS;
                    p.dx = ddx * slow;
                    p.dy = ddy * slow;
                } else {
                    p.dx += ddx;
                    p.dy += ddy;
                }
                break;

            default:
                throw new Error(`unhandled mouse mode: ${MouseMode[this.mode]}`);
        }

        if (p.trace) {
            console.log("[MouseMove] dx: %.4f - dy: %.4f - ddx: %.4f - ddy: %.4f - distance: %.2f", p.dx, p.dy, ddx, ddy, distance);
            this.context.beginPath();
            this.context.strokeStyle = "yellow";
            this.context.moveTo(p.x, p.y);
            this.context.lineTo(p.x + ddx * 10, p.y + ddy * 10);
            this.context.stroke();
        }

    }

}

