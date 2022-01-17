import { randa } from './Random';
import { Particle } from './Particle';
import { Info } from "./Info";
import { Swallower } from './Swallower';
import { MAX_RADIUS, MIN_RADIUS } from './Size';

import * as chroma from 'chroma-js';


const colorShade = (col:string, amt:number) => {
    col = col.replace(/^#/, '')
  
    const [rs, gs, bs] = col.match(/.{2}/g)!; 
    let r = Math.max(Math.min(255, parseInt(rs, 16) + amt), 0).toString(16)
    let g = Math.max(Math.min(255, parseInt(gs, 16) + amt), 0).toString(16)
    let b = Math.max(Math.min(255, parseInt(bs, 16) + amt), 0).toString(16)
  
    const rr = (r.length < 2 ? '0' : '') + r
    const gg = (g.length < 2 ? '0' : '') + g
    const bb = (b.length < 2 ? '0' : '') + b
  
    return `#${rr}${gg}${bb}`
}

const pallets = [
    {
        name: "purple",
        background: "#400B4F",
        color1: ["#9C9025", "#4F490F"],
        color2: ["#069C0F", "#074F0B"]
    },
    {
        name: "red",
        background: "#521D0F",
        color1: ["#2C9E3C", "#13521B"],
        color2: ["#0D7A9E", "#0B4052"]
    },
    {
        name: "blue",
        background: "#223C52",
        color1: ["#9E6B51", "#523426"],
        color2: ["#9E8A31", "#52481D"]
    },
    {
        name: "green",
        background: colorShade("#0D3614", 20),
        color1: ["#7A2C82", "#321036"],
        color2: ["#822D12", "#36150A"]
    },
    {
        name: "yellow",
        background: colorShade("#423B0C", 20),
        color1: ["#28518F", "#0F2442"],
        color2: ["#640B8F", "#300942"]
    }
]

export class Visualizer {

    private readonly pallet = randa(pallets);
    private readonly background = colorShade(this.pallet.background, -50);
    private readonly colors = [...this.pallet.color1, ...this.pallet.color2].map(c => colorShade(c, 50));
    private readonly highlight = colorShade(this.background, 20);
    private readonly c1 = this.colors[0];
    private readonly c2 = this.colors[3];
    private readonly c3 = this.colors[1]+'FF';
    private readonly particlesCanvas = document.createElement("canvas");
    private readonly particlesContext = this.particlesCanvas.getContext('2d')!;

    private readonly R2_RATIO = 0.5;
    private readonly R3_RATIO = 0.5;
    private readonly GRID_SIZE = MAX_RADIUS * 2;

    constructor(info:Info, private context:CanvasRenderingContext2D, private swallower:Swallower) {
        info.addStat("pallet", this.pallet.name);

        this.prerenderParticles();

    }

    private prerenderParticles() {
        this.particlesCanvas.width = this.GRID_SIZE * (MAX_RADIUS + 1);
        this.particlesCanvas.height = this.GRID_SIZE * 1;
        for(let r1 = 0; r1 <= MAX_RADIUS; ++r1) {
            const left = r1 * this.GRID_SIZE;
            this.drawOuterGradient(this.particlesContext, this.GRID_SIZE * 0, left, r1);
            this.drawInnerGradient(this.particlesContext, this.GRID_SIZE * 0, left, r1);
        }
    }

    private drawOuterGradient(c:CanvasRenderingContext2D, top:number, left:number, r1:number) {

        const x = left + r1;
        const y = top + r1;

        const r2 = Math.floor(r1*this.R2_RATIO);

        const g = c.createRadialGradient(x, y, r1, x, y, r2)
        g.addColorStop(0, this.colors[0]);
        g.addColorStop(1, this.colors[2] + "FF");

        c.fillStyle = g;
        c.beginPath();
        c.arc(x, y, r1, 0, Math.PI * 2);
        c.closePath();
        c.fill();

    }

    private drawInnerGradient(c:CanvasRenderingContext2D, top:number, left:number, r1:number) {

        const r2 = Math.floor(r1*this.R2_RATIO);

        const x = left + r1;
        const y = top + r1;

        const r3 = Math.floor(r2*this.R3_RATIO);

        const g = this.context.createRadialGradient(x, y, r2, x, y, r3)
        g.addColorStop(0, this.colors[1]);
        g.addColorStop(1, this.colors[3] + "FF");

        c.fillStyle = g;
        c.beginPath();
        c.arc(x, y, r2, 0, Math.PI * 2);
        c.closePath();
        c.fill();

    }

    init(p:Particle) {
        p.style = randa(this.colors);
        this.drawParticle(p);
    }

    drawParticle(p:Particle) {

        const r = Math.floor(p.radius);
        const sx = r * this.GRID_SIZE;
        const sy = 0;
        const sw = Math.floor(p.radius * 2);
        const sh = sw;
        const dx = p.x - p.radius; // Math.floor(p.x);
        const dy = p.y - p.radius; // Math.floor(p.y);
        const dw = p.radius * 2;
        const dh = dw;

        this.context.beginPath();
        this.context.fillStyle = p.style;
        this.context.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        this.context.closePath();
        this.context.fill();

        this.context.drawImage(this.particlesCanvas, sx, sy, sw, sh, dx, dy, dw, dh);

        if (DEBUG && p.trace) {
            this.context.beginPath();
            this.context.strokeStyle = "hotpink";
            this.context.moveTo(0, p.y);
            this.context.lineTo(this.context.canvas.width, p.y);
            this.context.moveTo(p.x, 0);
            this.context.lineTo(p.x, this.context.canvas.height);
            this.context.stroke();
            this.context.beginPath();
            this.context.strokeRect(sx, sy, sw, sh);
            this.context.stroke();
            console.log("[Visualizer] x: %.4f - y: %.4f - radius: %.4f - style: %s - sx: %4.4f - sy: %4.4f - dx: %4.4f - dy: %4.4f - sw: %4.4f - dw: %4.4f", p.x, p.y, p.radius, p.style, sx, sy, dx, dy, sw, dw);
        }

    }

    public drawBackground() {

        this.context.fillStyle = this.background;
        this.context.fillRect(0, 0, this.context.canvas.width, this.context.canvas.height);

        const x = this.swallower.x;
        const y = this.swallower.y;
        const r1 = this.swallower.radius;
        const r2 = this.swallower.radius * 0.50;

        var gradient = this.context.createRadialGradient(x,y,r1,x,y,r2);

        gradient.addColorStop(0, '#00000000');
        gradient.addColorStop(0.2, this.highlight);
        gradient.addColorStop(1, '#000000ff');
        
        this.context.fillStyle = gradient;
        this.context.fillRect(x-r1, y-r1, r1*2, r1*2);

        this.context.drawImage(this.particlesCanvas, 0, 0)

    }


}
