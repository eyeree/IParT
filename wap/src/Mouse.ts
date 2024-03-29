import { Info } from './Info';
import { Frame } from './Frame';
import { rande } from './Random';
import { Particle } from './Particle';
import { Swallower } from './Swallower';
import { ParticleSet } from './ParticleSet';
import { Scale } from './Scale';

export enum MouseMode {
    Push,
    Pull,
};

export enum MouseStrength {
    Weak   = 10000,
    Medium = 15000,
    Strong = 20000,
}

const MOUSE_RADIUS = 20;

const SWALLOWER_MARGIN = 50;

export class Mouse {

    private readonly show_info = document.getElementById("show_info")! as HTMLDivElement;
    private readonly full_screen = document.getElementById("full_screen")! as HTMLDivElement;
    private readonly restart = document.getElementById("restart")! as HTMLDivElement;
    private readonly pause = document.getElementById("pause")! as HTMLDivElement;

    private pointer_x = 0;
    private pointer_y = 0;

    private readonly mode:MouseMode = rande(MouseMode, {[MouseMode.Pull]:0});
    private readonly strength:MouseStrength = rande(MouseStrength);
    private frame_strength:number = 0;
    private interacting = false;

    private draggingSwallower: boolean = false;

    constructor(private info: Info, private context: CanvasRenderingContext2D, private _frame:Frame, private swallower:Swallower, private particles:ParticleSet, private resize:Scale) {

        info.addStat("mouse strength", `${MouseStrength[this.strength].toLocaleLowerCase()}`);

        const canvas = this.context.canvas;

        canvas.onpointermove = event => {
            if (this.interacting) {
                // console.log("interacting", this.pointer_x, this.pointer_y);
            } else if(this.draggingSwallower) {
                let dx = event.x - this.pointer_x;
                let dy = event.y - this.pointer_y;
                const x = swallower.x;
                const y = swallower.y;
                swallower.x = Math.max(SWALLOWER_MARGIN, Math.min(resize.width - SWALLOWER_MARGIN, swallower.x + dx));
                swallower.y = Math.max(SWALLOWER_MARGIN, Math.min(resize.height - SWALLOWER_MARGIN, swallower.y + dy));
                dx = swallower.x - x;
                dy = swallower.y - y;
                particles.forEach(p => {
                    if(p.swallowed) {
                        p.x += dx;
                        p.y += dy;
                    }
                })
                // console.log("dragging", this.pointer_x, this.pointer_y, this.swallower.x, this.swallower.y);
            }
            this.pointer_x = event.x;
            this.pointer_y = event.y;
        };

        canvas.onpointerdown = event => {
            
            if(DEBUG) {
                console.log("canvas onpointerdown", event.buttons, event.button, event.metaKey?"meta":"", event.altKey?"alt":"", event.ctrlKey?"ctrl":"", event.shiftKey?"shift":"");
            }
            
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

                    canvas.setPointerCapture(event.pointerId);

                }

            } 
            
            if(DEBUG) {
                if(event.buttons == 4 && event.button == 1) { // scroll wheel

                    if(event.altKey) {
                        window.open(document.location.toString(), "_top");
                    }

                } else if(DEBUG && event.buttons == 2 && event.button == 2) { // right click, pen barrel button

                    if(event.ctrlKey) {
                        Particle.toggleTrace();
                    } else if(event.altKey) {
                        Particle.stopTrace();
                    } else {
                        Particle.traceOne();
                    }
        
                }
            }

            event.preventDefault();
            event.stopPropagation();
            return false;

        };

        canvas.onpointerup = event => {
            if(DEBUG) {
                console.log("canvas onpointerup", this.pointer_x, this.pointer_y);
            }
            if (this.interacting || this.draggingSwallower) {
                this.interacting = false;
                this.draggingSwallower = false;
                this.pointer_x = event.x;
                this.pointer_y = event.y;
                canvas.releasePointerCapture(event.pointerId);
            }
        };

        if(DEBUG) {
            canvas.oncontextmenu = event => {
                event.preventDefault();
                event.stopPropagation();
                return false;
            }
        }

        this.show_info.onclick = () => {
            // console.log("show_info.onclick", info.isVisible);
            if (info.isVisible) {
                info.hideInfo();
            } else {
                info.showInfo();
            }
        };

        this.restart.onclick = () => {
            document.location.reload();
        }

        this.pause.onclick = () => {
            this._frame.paused = !this._frame.paused;
        }

        if (document.fullscreenEnabled) {
            this.full_screen.onclick = () => {

                // console.log("full_screen.onclick", document.fullscreenElement);

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
        // if(this.interacting || this.draggingSwallower) {
        //     this.context.beginPath();
        //     this.context.strokeStyle = "white";
        //     this.context.moveTo(0, this.pointer_y);
        //     this.context.lineTo(this.resize.width, this.pointer_y);
        //     this.context.moveTo(this.pointer_x, 0);
        //     this.context.lineTo(this.pointer_x, this.resize.height);
        //     this.context.stroke();
        // }
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
                throw new Error(DEBUG ? `unhandled mouse mode: ${MouseMode[this.mode]}` : '');
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