import { randa, rande } from './Random';
import { Particle } from './Particle';
import { Info } from "./Info";
import { Swallower } from './Swallower';
import { MAX_RADIUS, MAX_SPEED } from './Size';
import { Scale } from './Scale';

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

// 0 = bright, 1 = dark
const ColorFactor = {
    [BrightMode.Speed_Darkens]: (p: Particle) => Math.min(MAX_SPEED, p.speed) / MAX_SPEED,
    [BrightMode.Speed_Brightens]: (p: Particle) => 1 - (Math.min(MAX_SPEED, p.speed) / MAX_SPEED),
    [BrightMode.Down_Brightens]: (p: Particle) => p.dy <= 0 ? 1 : Math.min(MAX_MOVE, p.dy) / p.dy,
    [BrightMode.Up_Brightens]: (p: Particle) => p.dy >= 0 ? 1 : Math.min(MAX_MOVE, -p.dy) / -p.dy,
    [BrightMode.Right_Brightens]: (p: Particle) => p.dx <= 0 ? 1 : Math.min(MAX_MOVE, p.dx) / p.dx,
    [BrightMode.Left_Brightens]: (p: Particle) => p.dx >= 0 ? 1 : Math.min(MAX_MOVE, -p.dx) / -p.dx,
    [BrightMode.Age_Darkens]: (p: Particle) => p.age > p.life ? 1 : p.age / p.life,
    [BrightMode.Age_Brightens]: (p: Particle) => p.age > p.life ? 0 : 1 - (p.age / p.life),
}

const R2_RATIO = 0.3;
const R3_RATIO = 0.5;
const R4_RATIO = 0.3;
const GRID_SIZE = MAX_RADIUS * 2;
const OUTER_GRID_LEFT = 0;
const INNER_GRID_LEFT = GRID_SIZE * MAX_RADIUS;
const NUM_COLOR_STEPS = 40;

const BACKGROUND_COLORS = [
    "DarkRed",
    "Purple",
    "DarkOliveGreen",
    "DarkGoldenrod",
    "DarkBlue",
    "Teal",
    "DarkSlateGray",
]

const PARTICLE_COLORS = [
    "Gray",
    "DarkOrange",
    "Goldenrod",
    "Sienna",
    "MediumBlue",
    "CornflowerBlue",
    "DeepSkyBlue",
    "DarkTurquoise",
    "LightSeaGreen",
    "OliveDrab",
    "ForestGreen",
    "LimeGreen",
    "DarkSlateBlue",
    "Purple",
    "RebeccaPurple",
    "Magenta",
    "Khaki",
    "Gold",
    "Yellow",
    "Orange",
    "MediumVioletRed",
    "Crimson",
    "Salmon"
]

export class Visualizer {

    private readonly particlesCanvas = document.createElement("canvas");
    private readonly particlesContext = this.particlesCanvas.getContext('2d')!;
    private readonly swallowerCanvas = document.createElement("canvas");
    private readonly swallowerContext = this.swallowerCanvas.getContext('2d')!;

    private readonly innerMode: BrightMode;
    private readonly outerMode: BrightMode;

    private readonly highlight = randa(BACKGROUND_COLORS);
    private readonly background = this.getBackgroundColor(this.highlight);
    private readonly color1 = randa(PARTICLE_COLORS);
    private readonly color2 = randa(PARTICLE_COLORS);

    private lastDPR = 0;

    constructor(info: Info, private context: CanvasRenderingContext2D, private swallower: Swallower, private scale: Scale) {

        this.innerMode = rande(BrightMode);
        switch (this.innerMode) {
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

        this.lastDPR = scale.dpr;
        this.prerenderParticles();
        this.prerenderSwallower();

        info.addStat("background", this.highlight);
        info.addStat("outer color", this.color1);
        info.addStat("inner color", this.color2);
        info.addStat("outer mode", BrightMode[this.outerMode]);
        info.addStat("inner mode", BrightMode[this.innerMode]);

        const style = document.createElement('style');
        style.textContent = `.highlight { border-color: ${this.highlight} }`;
        document.head.append(style);

    }


    private toColorArray(color:string):Array<number> {
        this.particlesContext.fillStyle = color;
        const [r, g, b] = this.particlesContext.fillStyle.substring(1).match(/.{2}/g)!;
        return [parseInt(r, 16), parseInt(g, 16), parseInt(b, 16)];
    }

    private toColorString(color:Array<number>) {

        let r = Math.floor(color[0]).toString(16)
        let g = Math.floor(color[1]).toString(16)
        let b = Math.floor(color[2]).toString(16)

        const rr = (r.length < 2 ? '0' : '') + r
        const gg = (g.length < 2 ? '0' : '') + g
        const bb = (b.length < 2 ? '0' : '') + b
      
        return `#${rr}${gg}${bb}`

    }

    private getParticleColors(color:string):Array<string> {

        const rgb = this.toColorArray(color);

        const step = 100 / NUM_COLOR_STEPS;

        const result = new Array<string>(NUM_COLOR_STEPS);
        for(let i = 0; i < result.length; ++i) {
            rgb[0] = Math.min(255, rgb[0] + step);
            rgb[1] = Math.min(255, rgb[1] + step);
            rgb[2] = Math.min(255, rgb[2] + step);
            result[i] = this.toColorString(rgb);
        }

        return result;

    }

    private getBackgroundColor(color:string):string {
        const rgb = this.toColorArray(color);
        rgb[0] = Math.max(0, rgb[0] - 85);
        rgb[1] = Math.max(0, rgb[1] - 85);
        rgb[2] = Math.max(0, rgb[2] - 85);
        return this.toColorString(rgb);
    }

    private prerenderSwallower() {

        const r1 = this.swallower.radius;
        const r2 = this.swallower.radius * 0.50;
        const x = r1;
        const y = r1;

        this.swallowerCanvas.width = r1 * 2;
        this.swallowerCanvas.height = r1 * 2;

        var gradient = this.swallowerContext.createRadialGradient(x, y, r1, x, y, r2);

        gradient.addColorStop(0, '#00000000');
        gradient.addColorStop(0.2, this.highlight);
        gradient.addColorStop(1, '#000000ff');

        this.swallowerContext.fillStyle = gradient;
        this.swallowerContext.fillRect(0, 0, r1 * 2, r1 * 2);
        
    }

    private prerenderParticles() {

        this.particlesCanvas.width = ((GRID_SIZE * (MAX_RADIUS + 1)) * 2) * this.scale.dpr;
        this.particlesCanvas.height = (GRID_SIZE * NUM_COLOR_STEPS) * this.scale.dpr;
        this.particlesContext.scale(this.scale.dpr, this.scale.dpr);

        const colors1 = this.getParticleColors(this.color1);
        const colors2 = this.getParticleColors(this.color2);

        for (let r1 = 0; r1 <= MAX_RADIUS; ++r1) {
            const left = r1 * GRID_SIZE;
            for (let c = 0; c < NUM_COLOR_STEPS; ++c) {
                const c1 = colors1[c];
                const c2 = colors2[c];
                this.drawOuterGradient(this.particlesContext, GRID_SIZE * c, OUTER_GRID_LEFT + left, r1, c1);
                this.drawInnerGradient(this.particlesContext, GRID_SIZE * c, INNER_GRID_LEFT + left, r1, c2);
            }
        }
    }

    private drawOuterGradient(c: CanvasRenderingContext2D, top: number, left: number, r1: number, color: string) {

        const x = left + r1;
        const y = top + r1;

        const r2 = Math.floor(r1 * R2_RATIO);

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

    private drawInnerGradient(c: CanvasRenderingContext2D, top: number, left: number, r1: number, color: string) {

        const r3 = Math.floor(r1 * R3_RATIO);
        const r4 = Math.floor(r1 * R4_RATIO);

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

    init(p: Particle) {
        this.drawParticle(p);
    }

    drawParticle(p: Particle) {

        const r = Math.floor(p.radius);
        const sx1 = (OUTER_GRID_LEFT + r * GRID_SIZE) * this.scale.dpr;
        const sx2 = (INNER_GRID_LEFT + r * GRID_SIZE) * this.scale.dpr;
        const sy1 = this.pickColor(p, this.outerMode) * GRID_SIZE * this.scale.dpr;
        const sy2 = this.pickColor(p, this.innerMode) * GRID_SIZE * this.scale.dpr;
        const sw = r * 2 * this.scale.dpr;
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
            this.context.lineTo(this.scale.width, p.y);
            this.context.moveTo(p.x, 0);
            this.context.lineTo(p.x, this.scale.height);
            this.context.stroke();

            if (Particle.isTracing) {
                this.context.beginPath();
                this.context.strokeRect(sx1, sy1, sw, sh);
                this.context.strokeRect(sx2, sy2, sw, sh);
                this.context.stroke();
            }

            console.log("[Visualizer] x: %.4f - y: %.4f - radius: %.4f - style: %s - sx1: %4.4f - sy1: %4.4f - sx2: %4.4f - sy2: %4.4f - dx: %4.4f - dy: %4.4f - sw: %4.4f - dw: %4.4f", p.x, p.y, p.radius, p.style, sx1, sy1, sx2, sy2, dx, dy, sw, dw);

        }

    }

    private pickColor(p: Particle, mode: BrightMode): number {
        const f = ColorFactor[mode](p);
        const i = Math.floor((NUM_COLOR_STEPS - 1) * f);
        if (DEBUG && p.trace) {
            console.log("[Visualized] %s - f: %4.4f - i %d - age: %1.4f - speed: %4.4f - dx: %4.4f - dy: %4.4f", BrightMode[mode], f, i, p.age / p.life, p.speed, p.dx, p.dy);
        }
        return i;
    }

    public drawBackground() {

        if(this.lastDPR != this.scale.dpr) {
            this.lastDPR = this.scale.dpr;
            this.prerenderParticles();
            this.prerenderSwallower();
        }

        const ctx = this.context;

        ctx.fillStyle = this.background;
        ctx.fillRect(0, 0, this.scale.width, this.scale.height);

        const x = this.swallower.x;
        const y = this.swallower.y;
        const r1 = this.swallower.radius;

        ctx.drawImage(this.swallowerCanvas, x - r1, y - r1);

        // ctx.fillStyle = "pink";
        // ctx.fillRect(100, 100, 100, 100);

        // const right = Math.round(this.scale.width);
        // const bottom = Math.round(this.scale.height);
        // ctx.strokeStyle = "yellow";

        // ctx.moveTo(0, 0);
        // ctx.lineTo(right, bottom);
        // ctx.stroke();


        // ctx.fillStyle = "red";
        // ctx.fillRect(
        //   right - 100, 
        //   bottom - 100, 
        //   100, 100
        // );

        // ctx.fillStyle = "blue";
        // ctx.fillRect(
        //   right - 500, 
        //   bottom - 500, 
        //   100, 100
        // );

        // const x = this.swallower.x;
        // const y = this.swallower.y;
        // const r1 = this.swallower.radius;
        // const r2 = this.swallower.radius * 0.50;

        // var gradient = ctx.createRadialGradient(x, y, r1, x, y, r2);

        // gradient.addColorStop(0, '#00000000');
        // gradient.addColorStop(0.2, this.pallet.highlight);
        // gradient.addColorStop(1, '#000000ff');

        // ctx.fillStyle = gradient;
        // ctx.fillRect(x - r1, y - r1, r1 * 2, r1 * 2);

        if (Particle.isTracing) {
            ctx.drawImage(this.particlesCanvas, 0, 0)
        }

    }


}

