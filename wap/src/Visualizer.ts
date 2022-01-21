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

let pallets = [
    {
      "name": "purple",
      "background": "#0e001d",
      "highlight": "#221431",
      "color1": [
        "#ffffb7",
        "#fcfbb3",
        "#f8f8b0",
        "#f5f4ad",
        "#f2f1aa",
        "#eeeda7",
        "#ebeaa3",
        "#e8e6a0",
        "#e4e39d",
        "#e1df9a",
        "#dedb97",
        "#dad893",
        "#d7d490",
        "#d4d18d",
        "#d0cd8a",
        "#cdca86",
        "#cac683",
        "#c6c380",
        "#c3bf7d",
        "#c0bb7a",
        "#bcb876",
        "#b9b473",
        "#b6b170",
        "#b2ad6d",
        "#afaa6a",
        "#aca666",
        "#a8a363",
        "#a59f60",
        "#a29b5d",
        "#9e9859",
        "#9b9456",
        "#989153",
        "#948d50",
        "#918a4d",
        "#8e8649",
        "#8a8346",
        "#877f43",
        "#847b40",
        "#80783d",
        "#7d7439"
      ],
      "color2": [
        "#c2ffa9",
        "#befca6",
        "#bbf8a3",
        "#b8f5a0",
        "#b4f29d",
        "#b1ee9a",
        "#adeb97",
        "#aae794",
        "#a7e491",
        "#a3e18f",
        "#a0dd8c",
        "#9cda89",
        "#99d786",
        "#96d383",
        "#92d080",
        "#8fcd7d",
        "#8bc97a",
        "#88c677",
        "#85c374",
        "#81bf71",
        "#7ebc6e",
        "#7ab86b",
        "#77b568",
        "#74b265",
        "#70ae62",
        "#6dab5f",
        "#6aa85c",
        "#66a45a",
        "#63a157",
        "#5f9e54",
        "#5c9a51",
        "#59974e",
        "#55934b",
        "#529048",
        "#4e8d45",
        "#4b8942",
        "#48863f",
        "#44833c",
        "#417f39",
        "#3d7c36"
      ]
    },
    {
      "name": "red",
      "background": "#200000",
      "highlight": "#341414",
      "color1": [
        "#cdffcb",
        "#cafcc8",
        "#c6f8c4",
        "#c2f5c1",
        "#bff2bd",
        "#bbefba",
        "#b8ebb6",
        "#b4e8b3",
        "#b1e5af",
        "#ade1ac",
        "#aadea8",
        "#a6dba5",
        "#a3d8a2",
        "#9fd49e",
        "#9cd19b",
        "#98ce97",
        "#95cb94",
        "#91c790",
        "#8ec48d",
        "#8ac189",
        "#87bd86",
        "#83ba82",
        "#80b77f",
        "#7cb47c",
        "#78b078",
        "#75ad75",
        "#71aa71",
        "#6ea66e",
        "#6aa36a",
        "#67a067",
        "#639d63",
        "#609960",
        "#5c965c",
        "#599359",
        "#558f55",
        "#528c52",
        "#4e894f",
        "#4b864b",
        "#478248",
        "#447f44"
      ],
      "color2": [
        "#beffff",
        "#bbfbfc",
        "#b7f7f8",
        "#b4f4f5",
        "#b1f0f2",
        "#aeecef",
        "#aae8eb",
        "#a7e4e8",
        "#a4e1e5",
        "#a0dde1",
        "#9dd9de",
        "#9ad5db",
        "#97d1d7",
        "#93ced4",
        "#90cad1",
        "#8dc6ce",
        "#8ac2ca",
        "#86bec7",
        "#83bbc4",
        "#80b7c0",
        "#7cb3bd",
        "#79afba",
        "#76abb6",
        "#73a8b3",
        "#6fa4b0",
        "#6ca0ad",
        "#699ca9",
        "#6698a6",
        "#6295a3",
        "#5f919f",
        "#5c8d9c",
        "#588999",
        "#558595",
        "#528292",
        "#4f7e8f",
        "#4b7a8c",
        "#487688",
        "#457285",
        "#426f82",
        "#3e6b7e"
      ]
    },
    {
      "name": "blue",
      "background": "#000a20",
      "highlight": "#141e34",
      "color1": [
        "#fffddf",
        "#fcf9db",
        "#f8f5d7",
        "#f5f1d4",
        "#f2edd0",
        "#efe9cc",
        "#ebe5c8",
        "#e8e1c5",
        "#e5ddc1",
        "#e2d9bd",
        "#ded4ba",
        "#dbd0b6",
        "#d8ccb2",
        "#d5c8af",
        "#d1c4ab",
        "#cec0a7",
        "#cbbca3",
        "#c8b8a0",
        "#c4b49c",
        "#c1b098",
        "#beac95",
        "#bba791",
        "#b7a38d",
        "#b49f8a",
        "#b19b86",
        "#ae9782",
        "#aa937e",
        "#a78f7b",
        "#a48b77",
        "#a08773",
        "#9d8370",
        "#9a7f6c",
        "#977a68",
        "#937664",
        "#907261",
        "#8d6e5d",
        "#8a6a59",
        "#866656",
        "#836252",
        "#805e4e"
      ],
      "color2": [
        "#ffffc0",
        "#fcfbbd",
        "#f8f8b9",
        "#f5f4b6",
        "#f2f1b3",
        "#efedb0",
        "#ebeaad",
        "#e8e6aa",
        "#e5e2a7",
        "#e2dfa4",
        "#dedba0",
        "#dbd89d",
        "#d8d49a",
        "#d5d097",
        "#d1cd94",
        "#cec991",
        "#cbc68e",
        "#c8c28b",
        "#c4bf88",
        "#c1bb84",
        "#beb781",
        "#bbb47e",
        "#b7b07b",
        "#b4ad78",
        "#b1a975",
        "#ada572",
        "#aaa26f",
        "#a79e6b",
        "#a49b68",
        "#a09765",
        "#9d9462",
        "#9a905f",
        "#978c5c",
        "#938959",
        "#908556",
        "#8d8252",
        "#8a7e4f",
        "#867a4c",
        "#837749",
        "#807346"
      ]
    },
    {
      "name": "green",
      "highlight": "#142c14",
      "background": "#001800",
      "color1": [
        "#ffbbff",
        "#fbb8fb",
        "#f7b5f7",
        "#f3b1f3",
        "#eeaeef",
        "#eaabeb",
        "#e6a7e7",
        "#e2a4e2",
        "#dea0de",
        "#da9dda",
        "#d59ad6",
        "#d196d2",
        "#cd93ce",
        "#c990ca",
        "#c58cc6",
        "#c189c2",
        "#bc85be",
        "#b882ba",
        "#b47fb6",
        "#b07bb2",
        "#ac78ae",
        "#a875a9",
        "#a471a5",
        "#9f6ea1",
        "#9b6b9d",
        "#976799",
        "#936495",
        "#8f6091",
        "#8b5d8d",
        "#865a89",
        "#825685",
        "#7e5381",
        "#7a507d",
        "#764c79",
        "#724974",
        "#6d4570",
        "#69426c",
        "#653f68",
        "#613b64",
        "#5d3860"
      ],
      "color2": [
        "#ffb994",
        "#fbb691",
        "#f7b38f",
        "#f3af8c",
        "#efac8a",
        "#eba987",
        "#e7a685",
        "#e3a382",
        "#df9f80",
        "#db9c7d",
        "#d7997b",
        "#d39678",
        "#cf9376",
        "#cb8f73",
        "#c78c71",
        "#c3896e",
        "#bf866c",
        "#bb8369",
        "#b77f67",
        "#b37c64",
        "#af7961",
        "#ab765f",
        "#a7735c",
        "#a36f5a",
        "#9f6c57",
        "#9b6955",
        "#966652",
        "#926250",
        "#8e5f4d",
        "#8a5c4b",
        "#865948",
        "#825646",
        "#7e5243",
        "#7a4f41",
        "#764c3e",
        "#72493c",
        "#6e4639",
        "#6a4237",
        "#663f34",
        "#623c31"
      ]
    },
    {
      "name": "yellow",
      "highlight": "#383114",
      "background": "#241d00",
      "color1": [
        "#c2ddff",
        "#bedafb",
        "#bbd6f8",
        "#b7d2f4",
        "#b4cef0",
        "#b1cbec",
        "#adc7e9",
        "#aac3e5",
        "#a6bfe1",
        "#a3bcdd",
        "#9fb8da",
        "#9cb4d6",
        "#98b0d2",
        "#95adce",
        "#92a9cb",
        "#8ea5c7",
        "#8ba1c3",
        "#879ebf",
        "#849abc",
        "#8096b8",
        "#7d92b4",
        "#798fb1",
        "#768bad",
        "#7387a9",
        "#6f84a5",
        "#6c80a2",
        "#687c9e",
        "#65789a",
        "#617596",
        "#5e7193",
        "#5b6d8f",
        "#57698b",
        "#546687",
        "#506284",
        "#4d5e80",
        "#495a7c",
        "#465778",
        "#425375",
        "#3f4f71",
        "#3c4b6d"
      ],
      "color2": [
        "#fea3ff",
        "#faa0fb",
        "#f69ef8",
        "#f29bf4",
        "#ee98f0",
        "#e995ec",
        "#e592e9",
        "#e18fe5",
        "#dd8ce1",
        "#d989dd",
        "#d586da",
        "#d084d6",
        "#cc81d2",
        "#c87ece",
        "#c47bcb",
        "#c078c7",
        "#bc75c3",
        "#b772c0",
        "#b36fbc",
        "#af6cb8",
        "#ab6ab4",
        "#a767b1",
        "#a364ad",
        "#9e61a9",
        "#9a5ea5",
        "#965ba2",
        "#92589e",
        "#8e559a",
        "#8a5297",
        "#855093",
        "#814d8f",
        "#7d4a8b",
        "#794788",
        "#754484",
        "#714180",
        "#6c3e7c",
        "#683b79",
        "#643875",
        "#603671",
        "#5c336d"
      ]
    }
  ]

// import chroma = require('chroma-js');

// if(DEBUG) {
    
//     const colorShade = (col:string, amt:number) => {
//         col = col.replace(/^#/, '')
      
//         const [rs, gs, bs] = col.match(/.{2}/g)!; 
//         let r = Math.max(Math.min(255, parseInt(rs, 16) + amt), 0).toString(16)
//         let g = Math.max(Math.min(255, parseInt(gs, 16) + amt), 0).toString(16)
//         let b = Math.max(Math.min(255, parseInt(bs, 16) + amt), 0).toString(16)
      
//         const rr = (r.length < 2 ? '0' : '') + r
//         const gg = (g.length < 2 ? '0' : '') + g
//         const bb = (b.length < 2 ? '0' : '') + b
      
//         return `#${rr}${gg}${bb}`
//     }

//     const source = [
//         {
//             name: "purple",
//             background: "#400B4F",
//             highlight: "#400B4F",
//             color1: ["#9C9025", "#4F490F"],
//             color2: ["#069C0F", "#074F0B"]
//         },
//         {
//             name: "red",
//             background: "#521D0F",
//             highlight: "#400B4F",
//             color1: ["#2C9E3C", "#13521B"],
//             color2: ["#0D7A9E", "#0B4052"]
//         },
//         {
//             name: "blue",
//             background: "#223C52",
//             highlight: "#400B4F",
//             color1: ["#9E6B51", "#523426"],
//             color2: ["#9E8A31", "#52481D"]
//         },
//         {
//             name: "green",
//             highlight: "#400B4F",
//             background: colorShade("#0D3614", 20),
//             color1: ["#7A2C82", "#321036"],
//             color2: ["#822D12", "#36150A"]
//         },
//         {
//             name: "yellow",
//             highlight: "#400B4F",
//             background: colorShade("#423B0C", 20),
//             color1: ["#28518F", "#0F2442"],
//             color2: ["#640B8F", "#300942"]
//         }
//     ]

//     for(const p of source) {
//         p.background = colorShade(p.background, -50);
//         p.highlight = colorShade(p.background, 20);
//         const fc1 = chroma.scale([chroma(p.color1[0]).brighten(3), chroma(p.color1[1]).brighten(1)]);
//         const fc2 = chroma.scale([chroma(p.color2[0]).brighten(3), chroma(p.color2[1]).brighten(1)]);
//         p.color1 = new Array<string>(NUM_COLOR_STEPS);
//         p.color2 = new Array<string>(NUM_COLOR_STEPS);
//         for(let c = 0; c < NUM_COLOR_STEPS; ++c) {
//             const c1 = fc1(c / (NUM_COLOR_STEPS - 1));
//             const c2 = fc2(c / (NUM_COLOR_STEPS - 1));
//             p.color1[c] = c1.hex();
//             p.color2[c] = c2.hex();
//         }
//     }

//     pallets = source;
//     console.log(source);

    
// }
export class Visualizer {

    private readonly pallet = randa(pallets);
    private readonly particlesCanvas = document.createElement("canvas");
    private readonly particlesContext = this.particlesCanvas.getContext('2d')!;
    private readonly swallowerCanvas = document.createElement("canvas");
    private readonly swallowerContext = this.swallowerCanvas.getContext('2d')!;

    private readonly innerMode: BrightMode;
    private readonly outerMode: BrightMode;

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

        this.prerenderParticles();
        this.prerenderSwallower();

        info.addStat("background", this.pallet.name);
        info.addStat("outer color", BrightMode[this.outerMode]);
        info.addStat("inner color", BrightMode[this.innerMode]);

        const style = document.createElement('style');
        style.textContent = `.highlight { border-color: ${this.pallet.highlight} }`;
        document.head.append(style);

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
        gradient.addColorStop(0.2, this.pallet.highlight);
        gradient.addColorStop(1, '#000000ff');

        this.swallowerContext.fillStyle = gradient;
        this.swallowerContext.fillRect(0, 0, r1 * 2, r1 * 2);
        
    }

    private prerenderParticles() {

        this.particlesCanvas.width = ((GRID_SIZE * (MAX_RADIUS + 1)) * 2) * this.scale.dpr;
        this.particlesCanvas.height = (GRID_SIZE * NUM_COLOR_STEPS) * this.scale.dpr;
        this.particlesContext.scale(this.scale.dpr, this.scale.dpr);

        for (let r1 = 0; r1 <= MAX_RADIUS; ++r1) {
            const left = r1 * GRID_SIZE;
            for (let c = 0; c < NUM_COLOR_STEPS; ++c) {
                const c1 = this.pallet.color1[c];
                const c2 = this.pallet.color2[c];
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

        const ctx = this.context;

        ctx.fillStyle = this.pallet.background;
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

