import { Info } from './Info';
import { Particle } from './Particle';
import { rande, randf, randfs } from './Random';

enum EdgeMode {
    Kill,
    Bounce
}

export class Position {

    private readonly minDeflection: number = randf(5, 15);
    private readonly maxDeflection: number = randf(15, 20);

    private readonly edgeMode = rande(EdgeMode);
    private readonly edgeDetect = {
        [EdgeMode.Kill]: (p:Particle) => this.edgeKill(p),
        [EdgeMode.Bounce]: (p:Particle) => this.edgeBounce(p)
    }[this.edgeMode];

    constructor(info:Info, private canvas:HTMLCanvasElement) {

    }

    public update(p: Particle): void {
        p.x += p.dx;
        p.y += p.dy;
        this.edgeDetect(p);
    }

    private edgeBounce(p:Particle) {

        if (p.x < 0 + p.radius) {
            p.x = p.radius;
            if (Math.abs(p.dy) < 0.5) {
                p.dy = randfs(this.minDeflection, this.maxDeflection);
                if (p.trace) {
                    console.log("[Position] LEFT DEFLECTED - x: %f - dx: %f", p.y, p.dy);
                }
            }
            p.dx = -p.dx;
            if (p.trace) {
                console.log("[Position] LEFT - x: %f - dx: %f", p.x, p.dx);
            }
        } else if (p.x > this.canvas.width - p.radius) {
            p.x = this.canvas.width - p.radius;
            if (Math.abs(p.dy) < 0.5) {
                p.dy = randfs(this.minDeflection, this.maxDeflection);;
                if (p.trace) {
                    console.log("[Position] RIGHT DEFLECTED - y: %f - yx: %f", p.y, p.dy);
                }
            }
            p.dx = -p.dx;
            if (p.trace) {
                console.log("[Position] RIGHT - x: %f - dx: %f", p.x, p.dx);
            }
        } else if (p.y < 0 + p.radius) {
            p.y = p.radius;
            if (Math.abs(p.dx) < 0.5) {
                p.dx = randfs(this.minDeflection, this.maxDeflection);;
                if (p.trace) {
                    console.log("[Position] TOP DEFLECTED - x: %f - dx: %f", p.x, p.dx);
                }
            }
            p.dy = -p.dy;
            if (p.trace) {
                console.log("[Position] TOP - y: %f - dy: %f", p.y, p.dy);
            }
        } else if (p.y > this.canvas.height - p.radius) {
            p.y = this.canvas.height - p.radius;
            if (Math.abs(p.dx) < 0.5) {
                p.dx = randfs(this.minDeflection, this.maxDeflection);
                if (p.trace) {
                    console.log("[Position] BOTTOM DEFLECTED - x: %f - dx: %f", p.x, p.dx);
                }
            }
            p.dy = -p.dy;
            if (p.trace) {
                console.log("[Position] BOTTOM - y: %f - dy: %f", p.y, p.dy);
            }
        } else {
            if (p.trace) {
                console.log("[Position] x: %.2f - y: %.2f - dx: %.4f - dy: %.4f", p.x, p.y, p.dx, p.dy);
            }
        }

    }

    private edgeKill(p:Particle) {
        if (p.x < 0 - p.radius ||
            p.x > this.canvas.width + p.radius ||
            p.y < 0 - p.radius ||
            p.y > this.canvas.height + p.radius
        ) {
            p.kill();
            if (p.trace) {
                console.log("[Position] EDGE x: %f - y: %f - radius: %f", p.x, p.y, p.radius);
            }
        } else {
            console.log("[Position] x: %.2f - y: %.2f - dx: %.4f - dy: %.4f", p.x, p.y, p.dx, p.dy);
        }
    }

}
