import { Particle } from './Particle';
import { Info } from "./Info";
import { randf, rande } from './Random';
import { easeInQuad } from './Easing';
import { Scale } from './Scale';

export enum Strength {
    None =       0,
    Small =   6000,
    Medium = 12000,
    Large =  24000,
    Huge = 48000,
}

const Radius:{[key:number]:number} = {
    [Strength.None]:    0,
    [Strength.Small]:  15,
    [Strength.Medium]: 25,
    [Strength.Large]:  35,
    [Strength.Huge]: 40,
}

export class Swallower {

    public readonly strength = rande(Strength, {[Strength.None]:0});
    public readonly radius = Radius[this.strength];
    public x:number;
    public y:number;

    private frame_strength:number = 0;

    constructor(info:Info, private scale:Scale) {
        this.x = this.scale.width * randf(0.1, 0.8);
        this.y = this.scale.height * randf(0.1, 0.8);
        info.addStat("swallower", Strength[this.strength].toLowerCase());
    }

    frame(dt: number): void {
        if(this.strength == Strength.None) return;
        this.frame_strength = this.strength * dt;  
       
    }

    update(p:Particle, dt:number) {

        if(this.strength == Strength.None) return;

        let [ddx, ddy, distance] = p.forceFrom(this.x, this.y, this.frame_strength);

        const nearest = distance < p.radius ? 0 : distance - p.radius;

        if(nearest <= this.radius) {

            const max_distance = this.radius + p.radius;
            const percent_to_center = distance > max_distance ? 0 : 1 - distance / max_distance; // 1 = center, 0 = fully outside

            const dx = p.dx;
            const dy = p.dy;

            const slow = 1 - easeInQuad(percent_to_center); 
            p.dx *= slow;
            p.dy *= slow;
            
            p.dx += ddx * slow;
            p.dy += ddy * slow;

            p.health -= 0.5 * dt * percent_to_center;

            p.swallowed = true;

            if(DEBUG && p.trace) {
                console.log(
                    "[Swallowed] max_distance: %4.4f -- distance: %4.4f -- percent_to_center: %0.4f -- dx: %4.4f * %4.4f = %4.4f + %4.4f * %4.4f = %4.4f --- dy: %4.4f * %4.4f = %4.4f + %4.4f * %4.4f = %4.4f - health: %4.4f",
                    max_distance, distance, percent_to_center, dx, slow, dx * slow, ddx, slow, p.dx, dy, slow, dy * slow, ddy, slow, p.dy)
                ;
            }

        } else {

            p.dx += ddx;
            p.dy += ddy;

            p.swallowed = false;

            if (DEBUG && p.trace) {
                console.log("[Swallower] dx: %f - dy: %f - ddx: %f - ddy: %f - distance: %f - health: %f", p.dx, p.dy, ddx, ddy, distance, p.health);
            }
    
        }

    }

}
