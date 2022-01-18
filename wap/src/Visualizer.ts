import { randa, rande } from './Random';
import { Particle } from './Particle';
import { Info } from "./Info";
import { Swallower } from './Swallower';
import { MAX_RADIUS, MAX_SPEED } from './Size';

import chroma = require('chroma-js');

enum BrightMode {
    Speed_Darkens,
    Speed_Brightens,
    Down_Brightens,
    Up_Brightens,
    Right_Brightens,
    Left_Brightens,
    Age_Darkens,
    Age_Brightens
}

const NoDirection = {
    [BrightMode.Up_Brightens]: 0,
    [BrightMode.Down_Brightens]: 0,
    [BrightMode.Left_Brightens]: 0,
    [BrightMode.Right_Brightens]: 0,
}

const MAX_MOVE = MAX_SPEED / 2;

function moveFactor(d:number) {
    const m = (Math.min(MAX_MOVE, Math.abs(d)) / MAX_MOVE) * Math.sign(d);

}

// 0 = bright, 1 = dark
const ColorFactor = {
    [BrightMode.Speed_Darkens]: (p:Particle) => Math.min(MAX_SPEED, p.speed) / MAX_SPEED,
    [BrightMode.Speed_Brightens]: (p:Particle) => 1 - (Math.min(MAX_SPEED, p.speed) / MAX_SPEED),
    [BrightMode.Down_Brightens]: (p:Particle) => p.dy <= 0 ? 1 : Math.min(MAX_MOVE, p.dy) / p.dy,
    [BrightMode.Up_Brightens]: (p:Particle) => p.dy >= 0 ? 1 : Math.min(MAX_MOVE, -p.dy) / -p.dy,
    [BrightMode.Right_Brightens]: (p:Particle) => p.dx <= 0 ? 1 : Math.min(MAX_MOVE, p.dx) / p.dx,
    [BrightMode.Left_Brightens]: (p:Particle) => p.dx >= 0 ? 1 : Math.min(MAX_MOVE, -p.dx) / -p.dx,
    [BrightMode.Age_Darkens]: (p:Particle) => p.age > p.life ? 1 : p.age / p.life,
    [BrightMode.Age_Brightens]: (p:Particle) => p.age > p.life ? 0 : 1 - (p.age / p.life),
}

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
    private readonly highlight = colorShade(this.background, 20);
    private readonly particlesCanvas = document.createElement("canvas");
    private readonly particlesContext = this.particlesCanvas.getContext('2d')!;

    private readonly R2_RATIO = 0.3;
    private readonly R3_RATIO = 0.5;
    private readonly R4_RATIO = 0.3;
    private readonly GRID_SIZE = MAX_RADIUS * 2;
    private readonly OUTER_GRID_LEFT = 0;
    private readonly INNER_GRID_LEFT = this.GRID_SIZE * MAX_RADIUS;
    private readonly NUM_COLOR_STEPS = 30;

    private readonly innerMode:BrightMode;
    private readonly outerMode:BrightMode;

    constructor(info:Info, private context:CanvasRenderingContext2D, private swallower:Swallower) {

        this.innerMode = rande(BrightMode);
        switch(this.innerMode) {
            case BrightMode.Left_Brightens:
            case BrightMode.Right_Brightens:
                this.outerMode = randa([BrightMode.Up_Brightens, BrightMode.Down_Brightens]);
                break;
            case BrightMode.Up_Brightens:
            case BrightMode.Down_Brightens:
                    this.outerMode = randa([BrightMode.Left_Brightens, BrightMode.Right_Brightens]);
                    break;
            default:
                this.outerMode = rande(BrightMode, NoDirection);
                break;
        }

        this.prerenderParticles();

        info.addStat("background", this.pallet.name);
        info.addStat("outer color", BrightMode[this.outerMode]);
        info.addStat("inner color", BrightMode[this.innerMode]);

    }

    private prerenderParticles() {
        this.particlesCanvas.width = (this.GRID_SIZE * (MAX_RADIUS + 1)) * 2;
        this.particlesCanvas.height = this.GRID_SIZE * this.NUM_COLOR_STEPS;

        const fc1 = chroma.scale([chroma(this.pallet.color1[0]).brighten(3), chroma(this.pallet.color1[1]).brighten(1)]);
        const fc2 = chroma.scale([chroma(this.pallet.color2[0]).brighten(3), chroma(this.pallet.color2[1]).brighten(1)]);

        for(let r1 = 0; r1 <= MAX_RADIUS; ++r1) {
            const left = r1 * this.GRID_SIZE;
            for(let c = 0; c < this.NUM_COLOR_STEPS; ++c) {
                const c1 = fc1(c / (this.NUM_COLOR_STEPS - 1));
                const c2 = fc2(c / (this.NUM_COLOR_STEPS - 1));
                console.log("c", c, "c1", c1.hex(), "c2", c2.hex());
                this.drawOuterGradient(this.particlesContext, this.GRID_SIZE * c, this.OUTER_GRID_LEFT + left, r1, c1.hex());
                this.drawInnerGradient(this.particlesContext, this.GRID_SIZE * c, this.INNER_GRID_LEFT + left, r1, c2.hex());
            }
        }
    }

    private drawOuterGradient(c:CanvasRenderingContext2D, top:number, left:number, r1:number, color:string) {

        const x = left + r1;
        const y = top + r1;

        const r2 = Math.floor(r1*this.R2_RATIO);

        const g = c.createRadialGradient(x, y, r1, x, y, r2)
        g.addColorStop(0, color + "00");
        g.addColorStop(1, color);

        c.fillStyle = g;
        c.beginPath();
        c.arc(x, y, r1, 0, Math.PI * 2);
        c.closePath();
        c.fill();

        // c.beginPath();
        // c.strokeStyle="yellow";
        // c.strokeRect(x-r1, y-r1, r1*2, r1*2);
        // c.stroke();

    }

    private drawInnerGradient(c:CanvasRenderingContext2D, top:number, left:number, r1:number, color:string) {

        const r3 = Math.floor(r1*this.R3_RATIO);
        const r4 = Math.floor(r1*this.R4_RATIO);

        const x = left + r1;
        const y = top + r1;

        const g = this.context.createRadialGradient(x, y, r3, x, y, r4)
        g.addColorStop(0, color + "00");
        g.addColorStop(1, color);

        c.fillStyle = g;
        c.beginPath();
        c.arc(x, y, r3, 0, Math.PI * 2);
        c.closePath();
        c.fill();

        // c.beginPath();
        // c.strokeStyle="yellow";
        // c.strokeRect(x-r1, y-r1, r1*2, r1*2);
        // c.stroke();

    }

    init(p:Particle) {
        this.drawParticle(p);
    }

    drawParticle(p:Particle) {

        const r = Math.floor(p.radius);
        const sx1 = this.OUTER_GRID_LEFT + r * this.GRID_SIZE;
        const sx2 = this.INNER_GRID_LEFT + r * this.GRID_SIZE;
        const sy1 = this.pickColor(p, this.outerMode) * this.GRID_SIZE;
        const sy2 = this.pickColor(p, this.innerMode) * this.GRID_SIZE;
        const sw = r * 2;
        const sh = sw;
        const dx = p.x - p.radius; // Math.floor(p.x);
        const dy = p.y - p.radius; // Math.floor(p.y);
        const dw = p.radius * 2;
        const dh = dw;

        // this.context.beginPath();
        // this.context.fillStyle = p.style;
        // this.context.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        // this.context.closePath();
        // this.context.fill();

        this.context.drawImage(this.particlesCanvas, sx1, sy1, sw, sh, dx, dy, dw, dh);
        this.context.drawImage(this.particlesCanvas, sx2, sy2, sw, sh, dx, dy, dw, dh);

        if (DEBUG && p.trace) {

            this.context.beginPath();
            this.context.strokeStyle = "hotpink";
            this.context.moveTo(0, p.y);
            this.context.lineTo(this.context.canvas.width, p.y);
            this.context.moveTo(p.x, 0);
            this.context.lineTo(p.x, this.context.canvas.height);
            this.context.stroke();

            if(Particle.isTracing) {
                this.context.beginPath();
                this.context.strokeRect(sx1, sy1, sw, sh);
                this.context.strokeRect(sx2, sy2, sw, sh);
                this.context.stroke();
            }

            console.log("[Visualizer] x: %.4f - y: %.4f - radius: %.4f - style: %s - sx1: %4.4f - sy1: %4.4f - sx2: %4.4f - sy2: %4.4f - dx: %4.4f - dy: %4.4f - sw: %4.4f - dw: %4.4f", p.x, p.y, p.radius, p.style, sx1, sy1, sx2, sy2, dx, dy, sw, dw);

        }

    }

    private pickColor(p:Particle, mode:BrightMode):number {
        const f = ColorFactor[mode](p);
        const i = Math.floor((this.NUM_COLOR_STEPS-1) * f);
        if(p.trace) {
            console.log("[Visualized] %s - f: %4.4f - i %d - age: %1.4f - speed: %4.4f - dx: %4.4f - dy: %4.4f", BrightMode[mode], f, i, p.age / p.life, p.speed, p.dx, p.dy);
        }
        return i;
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

        if(Particle.isTracing) {
            this.context.drawImage(this.particlesCanvas, 0, 0)
        }

    }


}
