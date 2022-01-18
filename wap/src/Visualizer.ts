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

const palletsx = [
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

const palletsy = [
    {
        name: "purple",
        background: "#400B4F",
        highlight: "#400B4F",
        color1: ["#9C9025", "#4F490F"],
        color2: ["#069C0F", "#074F0B"]
    },
    {
        name: "red",
        background: "#521D0F",
        highlight: "#400B4F",
        color1: ["#2C9E3C", "#13521B"],
        color2: ["#0D7A9E", "#0B4052"]
    },
    {
        name: "blue",
        background: "#223C52",
        highlight: "#400B4F",
        color1: ["#9E6B51", "#523426"],
        color2: ["#9E8A31", "#52481D"]
    },
    {
        name: "green",
        background: colorShade("#0D3614", 20),
        highlight: "#400B4F",
        color1: ["#7A2C82", "#321036"],
        color2: ["#822D12", "#36150A"]
    },
    {
        name: "yellow",
        background: colorShade("#423B0C", 20),
        highlight: "pink",
        color1: ["#28518F", "#0F2442"],
        color2: ["#640B8F", "#300942"]
    }
]


const R2_RATIO = 0.3;
const R3_RATIO = 0.5;
const R4_RATIO = 0.3;
const GRID_SIZE = MAX_RADIUS * 2;
const OUTER_GRID_LEFT = 0;
const INNER_GRID_LEFT = GRID_SIZE * MAX_RADIUS;
const NUM_COLOR_STEPS = 20;

// for(const p of pallets) {
//     p.background = colorShade(p.background, -50);
//     p.highlight = colorShade(p.background, 20);
//     const fc1 = chroma.scale([chroma(p.color1[0]).brighten(3), chroma(p.color1[1]).brighten(1)]);
//     const fc2 = chroma.scale([chroma(p.color2[0]).brighten(3), chroma(p.color2[1]).brighten(1)]);
//     p.color1 = new Array<string>(NUM_COLOR_STEPS);
//     p.color2 = new Array<string>(NUM_COLOR_STEPS);
//     for(let c = 0; c < NUM_COLOR_STEPS; ++c) {
//         const c1 = fc1(c / (NUM_COLOR_STEPS - 1));
//         const c2 = fc2(c / (NUM_COLOR_STEPS - 1));
//         p.color1[c] = c1.hex();
//         p.color2[c] = c2.hex();
//     }
// }

const pallets = [
    {
      "name": "purple",
      "background": "#0e001d",
      "highlight": "#221431",
      "color1": [
        "#ffffb7",
        "#f8f8b0",
        "#f1f0a9",
        "#eae9a3",
        "#e4e29c",
        "#ddda96",
        "#d6d38f",
        "#cfcc88",
        "#c8c582",
        "#c1bd7b",
        "#bbb675",
        "#b4af6e",
        "#ada768",
        "#a6a061",
        "#9f995a",
        "#989154",
        "#928a4d",
        "#8b8347",
        "#847c40",
        "#7d7439"
      ],
      "color2": [
        "#c2ffa9",
        "#bbf8a3",
        "#b4f19d",
        "#adea97",
        "#a6e391",
        "#9fdd8b",
        "#98d685",
        "#91cf7f",
        "#8ac879",
        "#83c173",
        "#7cba6d",
        "#75b367",
        "#6eac61",
        "#67a55a",
        "#609e54",
        "#59984e",
        "#529148",
        "#4b8a42",
        "#44833c",
        "#3d7c36"
      ]
    },
    {
      "name": "red",
      "background": "#200000",
      "highlight": "#341414",
      "color1": [
        "#cdffcb",
        "#c6f8c4",
        "#bff2bd",
        "#b7ebb6",
        "#b0e4af",
        "#a9dda8",
        "#a2d7a0",
        "#9ad099",
        "#93c992",
        "#8cc28b",
        "#85bc84",
        "#7db57d",
        "#76ae76",
        "#6fa76f",
        "#68a168",
        "#619a61",
        "#599359",
        "#528d52",
        "#4b864b",
        "#447f44"
      ],
      "color2": [
        "#beffff",
        "#b7f7f8",
        "#b1eff1",
        "#aae8eb",
        "#a3e0e4",
        "#9cd8dd",
        "#96d0d6",
        "#8fc8d0",
        "#88c1c9",
        "#81b9c2",
        "#7bb1bb",
        "#74a9b5",
        "#6da1ae",
        "#679aa7",
        "#6092a0",
        "#598a99",
        "#528293",
        "#4c7a8c",
        "#457385",
        "#3e6b7e"
      ]
    },
    {
      "name": "blue",
      "background": "#000a20",
      "highlight": "#141e34",
      "color1": [
        "#fffddf",
        "#f8f5d7",
        "#f2edd0",
        "#ebe4c8",
        "#e4dcc0",
        "#ded3b9",
        "#d7cbb1",
        "#d0c3a9",
        "#c9baa2",
        "#c3b29a",
        "#bca993",
        "#b5a18b",
        "#af9983",
        "#a8907c",
        "#a18874",
        "#9b7f6d",
        "#947765",
        "#8d6f5d",
        "#876656",
        "#805e4e"
      ],
      "color2": [
        "#ffffc0",
        "#f8f8b9",
        "#f2f0b3",
        "#ebe9ad",
        "#e4e2a6",
        "#dedaa0",
        "#d7d399",
        "#d0cc93",
        "#c9c48c",
        "#c3bd86",
        "#bcb580",
        "#b5ae79",
        "#afa773",
        "#a89f6c",
        "#a19866",
        "#9b9160",
        "#948959",
        "#8d8253",
        "#877b4c",
        "#807346"
      ]
    },
    {
      "name": "green",
      "background": "#001800",
      "highlight": "#142c14",
      "color1": [
        "#ffbbff",
        "#f6b5f7",
        "#eeaeee",
        "#e5a7e6",
        "#dda0de",
        "#d499d5",
        "#cc92cd",
        "#c38bc4",
        "#bb84bc",
        "#b27db4",
        "#aa76ab",
        "#a16fa3",
        "#99689b",
        "#906192",
        "#885b8a",
        "#7f5482",
        "#764d79",
        "#6e4671",
        "#653f68",
        "#5d3860"
      ],
      "color2": [
        "#ffb994",
        "#f7b38f",
        "#eeac8a",
        "#e6a584",
        "#de9f7f",
        "#d6987a",
        "#cd9275",
        "#c58b70",
        "#bd846b",
        "#b57e65",
        "#ac7760",
        "#a4715b",
        "#9c6a56",
        "#946351",
        "#8b5d4b",
        "#835646",
        "#7b5041",
        "#73493c",
        "#6a4337",
        "#623c31"
      ]
    },
    {
      "name": "yellow",
      "background": "#241d00",
      "highlight": "#383114",
      "color1": [
        "#c2ddff",
        "#bbd6f7",
        "#b4cef0",
        "#adc6e8",
        "#a6bfe0",
        "#9eb7d9",
        "#97afd1",
        "#90a8c9",
        "#89a0c2",
        "#8298ba",
        "#7b91b2",
        "#7489ab",
        "#6d81a3",
        "#667a9b",
        "#5f7294",
        "#586a8c",
        "#516384",
        "#4a5b7d",
        "#435375",
        "#3c4b6d"
      ],
      "color2": [
        "#fea3ff",
        "#f69df7",
        "#ed97f0",
        "#e592e8",
        "#dc8ce0",
        "#d486d9",
        "#cb80d1",
        "#c27ac9",
        "#ba74c2",
        "#b16eba",
        "#a968b2",
        "#a062ab",
        "#985ca3",
        "#8f569b",
        "#875094",
        "#7e4a8c",
        "#754484",
        "#6d3f7d",
        "#643975",
        "#5c336d"
      ]
    }
  ];
console.log(pallets);


export class Visualizer {

    private readonly pallet = randa(pallets);
    private readonly background = colorShade(this.pallet.background, -50);
    private readonly highlight = colorShade(this.background, 20);
    private readonly particlesCanvas = document.createElement("canvas");
    private readonly particlesContext = this.particlesCanvas.getContext('2d')!;

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
        this.particlesCanvas.width = (GRID_SIZE * (MAX_RADIUS + 1)) * 2;
        this.particlesCanvas.height = GRID_SIZE * NUM_COLOR_STEPS;

        // const fc1 = chroma.scale([chroma(this.pallet.color1[0]).brighten(3), chroma(this.pallet.color1[1]).brighten(1)]);
        // const fc2 = chroma.scale([chroma(this.pallet.color2[0]).brighten(3), chroma(this.pallet.color2[1]).brighten(1)]);

        for(let r1 = 0; r1 <= MAX_RADIUS; ++r1) {
            const left = r1 * GRID_SIZE;
            for(let c = 0; c < NUM_COLOR_STEPS; ++c) {
                // const c1 = fc1(c / (NUM_COLOR_STEPS - 1));
                // const c2 = fc2(c / (NUM_COLOR_STEPS - 1));
                const c1 = this.pallet.color1[c];
                const c2 = this.pallet.color2[c];
                this.drawOuterGradient(this.particlesContext, GRID_SIZE * c, OUTER_GRID_LEFT + left, r1, c1);
                this.drawInnerGradient(this.particlesContext, GRID_SIZE * c, INNER_GRID_LEFT + left, r1, c2);
            }
        }
    }

    private drawOuterGradient(c:CanvasRenderingContext2D, top:number, left:number, r1:number, color:string) {

        const x = left + r1;
        const y = top + r1;

        const r2 = Math.floor(r1*R2_RATIO);

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

        const r3 = Math.floor(r1*R3_RATIO);
        const r4 = Math.floor(r1*R4_RATIO);

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
        const sx1 = OUTER_GRID_LEFT + r * GRID_SIZE;
        const sx2 = INNER_GRID_LEFT + r * GRID_SIZE;
        const sy1 = this.pickColor(p, this.outerMode) * GRID_SIZE;
        const sy2 = this.pickColor(p, this.innerMode) * GRID_SIZE;
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
        const i = Math.floor((NUM_COLOR_STEPS-1) * f);
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
