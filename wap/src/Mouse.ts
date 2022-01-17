import { Info } from './Info';
import { Frame } from './Frame';
import { rande } from './Random';
import { Particle, Trace } from './Particle';
import { Swallower } from './Swallower';
import { ParticleSet } from './ParticleSet';

export enum MouseMode {
    Push,
    Pull,
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
    public interacting = false;
    private old_x = 0;
    private old_y = 0;

    readonly mode:MouseMode = rande(MouseMode);
    readonly strength:MouseStrength = rande(MouseStrength);
    frame_strength = 0;
    draggingSwallower: boolean = false;

    constructor(private info: Info, private context: CanvasRenderingContext2D, private _frame:Frame, private swallower:Swallower, private particles:ParticleSet) {

        info.addStat("mouse", `${MouseStrength[this.strength].toLocaleLowerCase()}-${MouseMode[this.mode].toLowerCase()}`);

        window.onpointerenter = event => {
            this.over = true;
        };

        window.onpointerleave = event => {
            this.over = false;
        };

        window.onpointermove = event => {
            if (this.interacting) {
                console.log("interacting", this.pointer_x, this.pointer_y);
            } else if(this.draggingSwallower) {
                const dx = event.x - this.pointer_x;
                const dy = event.y - this.pointer_y;
                swallower.x += dx;
                swallower.y += dy;
                particles.forEach(p => {
                    if(p.swallowed) {
                        p.x += dx;
                        p.y += dy;
                    }
                })
                console.log("dragging", this.pointer_x, this.pointer_y, this.swallower.x, this.swallower.y);
            }
            this.pointer_x = event.x;
            this.pointer_y = event.y;
        };

        window.onpointerdown = event => {
            
            if(event.target != this.context.canvas) return;

            console.log("onpointerdown", event.buttons, event.button);
            
            if(event.buttons == 1 && event.button == 0) { // left click, touch, pen

                if (this.info.isVisible) {
                    this.info.hideInfo();
                } else {
    
                    if(this.isOnSwallower(event)) {
                        this.draggingSwallower = true;
                    } else {
                        this.interacting = true;
                    }

                    this.pointer_x = event.x;
                    this.pointer_y = event.y;

                    document.body.setPointerCapture(event.pointerId);

                }
                
            } else if(event.buttons == 2 && event.button == 2) { // right click, pen barrel button

                if(DEBUG) {
                    if(event.shiftKey && event.ctrlKey) {
                        Trace.autoTraceNext = !Trace.autoTraceNext;
                        Trace.traceNext = Trace.autoTraceNext;
                    } else if(event.ctrlKey) {
                        Trace.restartTrace();
                    } else if(event.altKey) {
                        window.open(document.location.toString(), "_top");
                    }
                }

            }

        };

        window.oncontextmenu = event => {
            console.log("oncontextmenu");
            event.preventDefault();
        }

        window.onpointerup = event => {
            if (this.interacting || this.draggingSwallower) {
                this.interacting = false;
                this.draggingSwallower = false;
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

    isOnSwallower(event: PointerEvent) {
        const diffX = this.swallower.x - event.x;
        const diffY = this.swallower.y - event.y;
        const distance = Math.sqrt(diffX * diffX + diffY * diffY);
        return distance <= this.swallower.radius;
    }

    frame(dt: number) {
        if(!this.interacting) return;
        this.frame_strength = this.strength * dt;
    }

    update(p:Particle) {
        
        if(!this.interacting || p.swallowed) return;

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

        if (DEBUG && p.trace) {
            console.log("[MouseMove] dx: %.4f - dy: %.4f - ddx: %.4f - ddy: %.4f - distance: %.2f - frame_strength: %.2f - strength: %.2f", p.dx, p.dy, ddx, ddy, distance, this.frame_strength, this.strength);
            this.context.beginPath();
            this.context.strokeStyle = "yellow";
            this.context.moveTo(p.x, p.y);
            this.context.lineTo(p.x + ddx * 10, p.y + ddy * 10);
            this.context.stroke();
        }

    }

}