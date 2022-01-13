import { Context, ContextBase } from './ContextBase';
import { randf, randa, randb } from './Random';
import { MIN_DELAY, MAX_DELAY } from './Configuration';
import { Particle, ParticleConstructor } from './Particle';
import { Gravity } from './Gravity';
import { Friction } from './Friction';
import { Emitters } from './Emitters';
import { Killers } from './Killers';
import { DeathShrink } from './DeathShrink';
import { Edges } from './Edges';
import { DrawArc } from './DrawArc';
import { MouseMove } from './MouseMove';
import { ParticleSet } from './ParticleSet';
import { Mouse } from "./Mouse";
import { Info } from "./Info";
import { Swallower } from './Swallower';
import { Background } from './Background';

export class Emitter extends ContextBase {

    private next: number = 0;
    public readonly ParticleClass: ParticleConstructor;

    constructor(info: Info, context: Context, protected particles: ParticleSet, mouse: Mouse, background: Background) {
        super(context);

        let ParticleClass = Particle;

        ParticleClass = randa(Emitters)(info, ParticleClass);

        if (randb())
            ParticleClass = Friction(info, ParticleClass);
        if (randb())
            ParticleClass = Gravity(info, ParticleClass);

        ParticleClass = randa(Killers)(info, ParticleClass);
        ParticleClass = randa(Edges)(info, ParticleClass);

        ParticleClass = MouseMove(info, mouse, ParticleClass);

        ParticleClass = Swallower(info, background, ParticleClass);

        ParticleClass = DeathShrink(info, ParticleClass);
        ParticleClass = DrawArc(info, ParticleClass);

        // ParticleClass = FromCenter(info, ParticleClass);
        // ParticleClass = Friction(info, ParticleClass);
        // ParticleClass = AgeKill(info, ParticleClass, {life:90});
        // ParticleClass = EdgeKill(info, ParticleClass);
        // ParticleClass = DeathShrink(info, ParticleClass);
        // ParticleClass = DrawArc(info, ParticleClass);
        this.ParticleClass = ParticleClass;
    }

    public update(seconds: number) {
        this.next -= seconds;
        if (this.next <= 0) {
            this.next = randf(MIN_DELAY, MAX_DELAY);
            if (!this.particles.full) {
                this.particles.add(new this.ParticleClass(this.context));
            }
        }
    }
}
