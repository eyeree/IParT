declare global { const DEBUG:boolean; }

import './ErrorHandler';

import { ParticleSet } from './ParticleSet';
import { Emitter } from './Emitter';
import { Info } from './Info';
import { Mouse } from './Mouse';
import { Frame } from './Frame';
import { Scale as Scale } from './Scale';
import { Swallower } from './Swallower';
import { Position } from './Position';
import { Visualizer } from './Visualizer';
import { Lifetime } from './Lifetime';
import { Particle } from './Particle';
import { Size } from './Size';

window.onhashchange = () => window.location.reload();

window.onload = () => {
    setTimeout(run, 500)
}

const run = () => {

    const canvas = document.createElement("canvas");
    document.body.appendChild(canvas);

    const context = canvas.getContext("2d");
    if (context == null) throw new Error("canvas 2d context is not supported");   

    const info = new Info();
    const frame = new Frame(info);
    const particles = new ParticleSet(info);
    const swallower = new Swallower(info);
    const scale = new Scale(info, context, particles, swallower);
    const mouse = new Mouse(info, context, frame, swallower, particles, scale);
    const visualizer = new Visualizer(info, context, swallower, scale);
    const position = new Position(info, canvas, scale);
    const emitter = new Emitter(info, scale, position);
    const lifetime = new Lifetime(info);
    const size = new Size(info);
    
    function update(time:number) {

        const dt = frame.getDT(time);

        visualizer.drawBackground();

        if(frame.paused) {

            particles.forEach(p=>visualizer.drawParticle(p));

        } else {

            position.frame(dt);
            swallower.frame(dt);
            lifetime.frame(dt);
            mouse.frame(dt);

            particles.forEach(p => {

                swallower.update(p, dt);
                mouse.update(p);
                lifetime.update(p, dt);
                size.update(p, dt);
                emitter.update(p);
                position.update(p, dt);       

                if(p.isDead) {
                    particles.remove(p);
                } else {
                    visualizer.drawParticle(p);
                }

            });

            if(!particles.isFull && emitter.emit(dt)) {
                const p = new Particle();
                emitter.initSpeed(p);
                lifetime.init(p);
                size.init(p);
                emitter.initPosition(p);
                visualizer.init(p);
                particles.add(p);
            }

        }

        window.requestAnimationFrame(update);

    }

    update(frame.last);

}