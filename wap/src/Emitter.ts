import { Info } from './Info';
import { Particle } from './Particle';
import { Position } from './Position';
import { rande, randf, randfs } from './Random';
import { Scale } from './Scale';

enum Location {
    Interior,
    Top,
    Bottom,
    Left,
    Right
}

enum Size {
    Point =  0.00,
    Small =  0.10,
    Medium = 0.33,
    Large =  1.00
}

enum Volume {
    Spattering = 1 /  1,
    Moderate =   1 /  5,
    Heavy =      1 / 10,
    Copious =    1 / 20,
}

enum Velocity {
    Slow = 30,
    Medium = 100,
    Fast = 200
}

const Divergence = {
    [Size.Point]: 0,
    [Size.Small]: 15,
    [Size.Medium]: 10,
    [Size.Large]: 2
}

const EDGE_MARGIN = 0.05;
const CENTER_MARGIN = 0.1;

const MIN_VOLUME_VARIATION = -0.2;
const MAX_VOLUME_VARIATION =  0.2;

const MIN_SPEED_VARIATION = -0.2;
const MAX_SPEED_VARIATION =  0.2;

export class Emitter {

    private readonly size = rande(Size, {[Size.Point]:0});
    private readonly location = this.size == Size.Point ? Location.Interior : rande(Location, {[Location.Interior]:0})
    private readonly min_x:number;
    private readonly min_y:number;
    private readonly max_x:number;
    private readonly max_y:number;
    private readonly volume = rande(Volume);
    private readonly speed = rande(Velocity);
    private readonly divergence = Divergence[this.size];

    private next: number = 0;

    constructor(info:Info, private resize:Scale, private position:Position) {
        if(this.location == Location.Interior) {
            this.min_x = randf(CENTER_MARGIN, 1 - CENTER_MARGIN);
            this.min_y = randf(CENTER_MARGIN, 1 - CENTER_MARGIN);
            this.max_x = this.min_x;
            this.max_y = this.min_y;
        } else {
            const [min, max] = this.getEdgeRange();
            switch(this.location) {
                case Location.Top:
                    this.min_x = min;
                    this.max_x = max;
                    this.min_y = 0;
                    this.max_y = 0;
                    break;
                case Location.Bottom:
                    this.min_x = min;
                    this.max_x = max;
                    this.min_y = 1;
                    this.max_y = 1;
                    break;
                case Location.Left:
                    this.min_x = 0;
                    this.max_x = 0;
                    this.min_y = min;
                    this.max_y = max;
                    break;
                case Location.Right:
                    this.min_x = 1;
                    this.max_x = 1;
                    this.min_y = min;
                    this.max_y = max;
                    break;
                default:
                    throw new Error(`unhandled location: ${Location[this.location]}`);
            }
        }
        info.addStat("emitter location", Location[this.location]);
        info.addStat("emitter size", Size[this.size]);
        info.addStat("emitter volume", Volume[this.volume]);
        info.addStat("emitter velocity", Velocity[this.speed]);
    }

    private getEdgeRange():[number, number] {
        if(this.size == Size.Large) {
            return [0, 1];
        } else {
            const half = this.size/2;
            const center = randf(EDGE_MARGIN + half, 1 - EDGE_MARGIN - half);
            return [center - half, center + half]
        }
    }

    public emit(dt: number):boolean {

        this.next -= dt;
        if(this.next > 0) {
            return false;           
        } else {
            this.next = this.volume + this.volume * randf(MIN_VOLUME_VARIATION, MAX_VOLUME_VARIATION);
            return true;
        }       
    
    }

    public init_position(p:Particle) {
        p.x = randf(this.min_x, this.max_x) * this.resize.width;
        p.y = randf(this.min_y, this.max_y) * this.resize.height;
        switch(this.location) {
            case Location.Interior:
                p.x -= randf(-2, 2);
                p.y -= randf(-2, 2);
                break;
            case Location.Top:
                p.y -= p.radius;
                p.edgeDetect = false;
                break;
            case Location.Bottom:
                p.y += p.radius;
                p.edgeDetect = false;
                break;
            case Location.Left:
                p.x -= p.radius;
                p.edgeDetect = false;
                break;
            case Location.Right:
                p.x += p.radius;
                p.edgeDetect = false;
                break;
        }
        if(DEBUG && p.trace) {
            console.log("[Emitter] init_position %s - x: %.2f - y: %.2f - dx: %.4f - dy: %.4f - edgeDetect: %s", Location[this.location], p.x, p.y, p.dx, p.dy, p.edgeDetect);
        }
    }

    public update(p:Particle) {
        if(!p.edgeDetect) {
            switch(this.location) {
                case Location.Interior:
                    break;
                case Location.Top:
                    if(p.y >= p.radius) p.edgeDetect = true;
                    break;
                case Location.Bottom:
                    if(p.y < this.resize.height - p.radius) p.edgeDetect = true;
                    break;
                case Location.Left:
                    if(p.x >= p.radius) p.edgeDetect = true;
                    break;
                case Location.Right:
                    if(p.x < this.resize.width - p.radius) p.edgeDetect = true;
                    break;
            }
            if(DEBUG && p.trace) {
                console.log("[Emitter] update %s - x: %.2f - y: %.2f - dx: %.4f - dy: %.4f - edgeDetect: %s", Location[this.location], p.x, p.y, p.dx, p.dy, p.edgeDetect);
            }
        }
    }

    public init_speed(p:Particle) {
        
        if(this.location === Location.Interior) {

            const direction = randf(0, Math.PI * 2);
            const speed = (this.speed + (this.speed * randf(MIN_SPEED_VARIATION, MAX_SPEED_VARIATION)));
            const ddx = Math.sin(direction) * speed;
            const ddy = Math.cos(direction) * speed;

            p.dx += ddx;
            p.dy += ddy;

        } else {

            const speed = this.speed + (this.speed * randf(MIN_SPEED_VARIATION, MAX_SPEED_VARIATION));
            const divergence = randfs(0, this.divergence)
    
            let ddy:number;
            let ddx:number;
    
            switch(this.location) {
                case Location.Top:
                    ddx = divergence;
                    ddy = speed - this.position.gravity;
                    break;
                case Location.Bottom:
                    ddx = divergence;
                    ddy = -(speed + this.position.gravity);
                    break;
                case Location.Left:
                    ddx = speed;
                    ddy = divergence - this.position.gravity / 2;
                    break;
                case Location.Right:
                    ddx = -speed;
                    ddy = divergence - this.position.gravity / 2;
                    break;
            }

            p.dx += ddx;
            p.dy += ddy;
    
            if(DEBUG && p.trace) {
                console.log("[Emitter] init_speed %s - x: %.2f - y: %.2f - dx: %.4f - dy: %.4f - ddx: %.4f - ddy: %.4f - divergence: %.4f - speed: %.2f", Location[this.location], p.x, p.y, p.dx, p.dy, ddx, ddy, divergence, speed);
            }

        }

    }

}