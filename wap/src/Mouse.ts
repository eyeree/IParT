import { Info } from './Info';
import { Frame } from './Frame';


export class Mouse {

    private readonly show_info = document.getElementById("show_info")! as HTMLDivElement;
    private readonly full_screen = document.getElementById("full_screen")! as HTMLDivElement;

    public x = 0;
    public y = 0;
    public over = false;
    public down = false;

    constructor(private info: Info, private canvas: HTMLCanvasElement, private frame:Frame) {

        window.onpointerenter = event => {
            this.over = true;
        };

        window.onpointerleave = event => {
            this.over = false;
        };

        window.onpointermove = event => {
            if (this.down) {
                this.x = event.x;
                this.y = event.y;
                console.log("onpointermove", this.x, this.y);
            }
        };

        window.onpointerdown = event => {
            
            if(event.target != canvas) return;

            if (this.info.isVisible) {
                console.log("onpointerdown", "info visible");
                this.info.hideInfo();
            } else {

                if(event.altKey && event.ctrlKey) {
                    this.frame.debugMode = !this.frame.debugMode;
                } else if(this.frame.debugMode && event.altKey) {
                    this.frame.nextDebugFrame();
                } else {
                    this.down = true;
                    this.x = event.x;
                    this.y = event.y;
                    document.body.setPointerCapture(event.pointerId);
                    console.log("onpointerdown", this.x, this.y);
                }
            }
            
        };

        window.onpointerup = event => {
            if (this.down) {
                this.down = false;
                this.x = event.x;
                this.y = event.y;
                document.body.releasePointerCapture(event.pointerId);
                console.log("onpointerup", this.x, this.y);
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

}
