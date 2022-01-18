import { easeInCubic } from './Easing';
import { Info } from './Info';
import { Particle } from './Particle';
import { rande, randf, randfs } from './Random';

enum EdgeMode {
    Kill,
    Bounce
}

export enum FrictionLevel {
    None =   0.00,
    Low =    0.25,
    Medium = 0.50,
    High =   1.00
}

export enum GravityLevel {
    None =    0,
    Low =    50,
    Medium = 150,
    High =   300
}

const MATURE_AGE = 0.0;

export class Position {

    public readonly friction = rande(FrictionLevel);
    private frame_friction = 0;

    public readonly gravity: number = rande(GravityLevel);
    private frame_gravity:number = 0; 

    private readonly minDeflection: number = randf(5, 15);
    private readonly maxDeflection: number = randf(15, 20);

    private readonly edgeMode = rande(EdgeMode);
    private readonly edgeDetect = {
        [EdgeMode.Kill]: (p:Particle) => this.edgeKill(p),
        [EdgeMode.Bounce]: (p:Particle) => this.edgeBounce(p)
    }[this.edgeMode];

    constructor(info:Info, private canvas:HTMLCanvasElement) {
        info.addStat("friction", FrictionLevel[this.friction].toLowerCase());
        info.addStat("gravity", GravityLevel[this.gravity]);
    }

    public frame(dt:number) {
        this.frame_friction = 1 - (this.friction * dt);
        this.frame_gravity = this.gravity * dt;
    }

    public update(p: Particle, dt:number): void {

        if(p.age < MATURE_AGE) {

            if(!p.swallowed) {
                const factor = easeInCubic(p.age / MATURE_AGE);

                if(DEBUG && p.trace) {
                    console.log('[Position] NEW FACTOR %f - age: %f - MATURE_AGE: %f', factor, p.age, MATURE_AGE);
                }
                const friction = 1 - (this.friction * dt * factor)

                p.dx *= friction;
                p.dy *= friction;

                p.dy += this.frame_gravity * factor;
            }

        } else {

            if(!p.swallowed) {
                p.dx *= this.frame_friction;
                p.dy *= this.frame_friction;

                p.dy += this.frame_gravity;
            }

        }

        p.x += p.dx * dt;
        p.y += p.dy * dt;
    
        if (DEBUG && p.trace) {
            console.log("[Position] x: %.2f - y: %.2f - dx: %.4f - dy: %.4f - frame_friction: %.4f - friction: %.4f - frame_gravity: %.4f - gravity: %.4f - swallowed %s", p.x, p.y, p.dx, p.dy, this.frame_friction, this.friction, this.frame_gravity, this.gravity, p.swallowed);
        }

        if(p.edgeDetect) {
            this.edgeDetect(p);
        }

    }

    private edgeBounce(p:Particle) {

        if (p.x < 0 + p.radius) {
            p.x = p.radius;
            if (Math.abs(p.dy) < 0.5) {
                p.dy = randfs(this.minDeflection, this.maxDeflection);
                if (DEBUG && p.trace) {
                    console.log("[Position] LEFT DEFLECTED - y: %f - dy: %f", p.y, p.dy);
                }
            }
            p.dx = -p.dx;
            if (DEBUG && p.trace) {
                console.log("[Position] LEFT - x: %f - dx: %f", p.x, p.dx);
            }
        } else if (p.x > this.canvas.width - p.radius) {
            p.x = this.canvas.width - p.radius;
            if (Math.abs(p.dy) < 0.5) {
                p.dy = randfs(this.minDeflection, this.maxDeflection);;
                if (DEBUG && p.trace) {
                    console.log("[Position] RIGHT DEFLECTED - y: %f - yx: %f", p.y, p.dy);
                }
            }
            p.dx = -p.dx;
            if (DEBUG && p.trace) {
                console.log("[Position] RIGHT - x: %f - dx: %f", p.x, p.dx);
            }
        } else if (p.y < 0 + p.radius) {
            p.y = p.radius;
            if (Math.abs(p.dx) < 0.5) {
                p.dx = randfs(this.minDeflection, this.maxDeflection);;
                if (DEBUG && p.trace) {
                    console.log("[Position] TOP DEFLECTED - x: %f - dx: %f", p.x, p.dx);
                }
            }
            p.dy = -p.dy;
            if (DEBUG && p.trace) {
                console.log("[Position] TOP - y: %f - dy: %f", p.y, p.dy);
            }
        } else if (p.y > this.canvas.height - p.radius) {
            p.y = this.canvas.height - p.radius;
            if (Math.abs(p.dx) < 0.5) {
                p.dx = randfs(this.minDeflection, this.maxDeflection);
                if (DEBUG && p.trace) {
                    console.log("[Position] BOTTOM DEFLECTED - x: %f - dx: %f", p.x, p.dx);
                }
            }
            p.dy = -p.dy;
            if (DEBUG && p.trace) {
                console.log("[Position] BOTTOM - y: %f - dy: %f", p.y, p.dy);
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
            if (DEBUG && p.trace) {
                console.log("[Position] EDGE x: %f - y: %f - radius: %f", p.x, p.y, p.radius);
            }
        }
    }

}
