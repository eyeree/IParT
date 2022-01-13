import { Info } from './Info';

export class Resize {

    constructor(private info: Info, private canvas: HTMLCanvasElement) {

        function setSize() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        window.onresize = setSize;

        setSize();

        info.addStat("window", () => `${canvas.width}x${canvas.height}`);

    }
}
