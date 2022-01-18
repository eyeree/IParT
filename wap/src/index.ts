declare global { const DEBUG:boolean; }

import './ErrorHandler';

import { tokenId } from './TokenId';
import { ParticleSet } from './ParticleSet';
import { Emitter } from './Emitter';
import { Info } from './Info';
import { Mouse } from './Mouse';
import { Frame } from './Frame';
import { Resize } from './Resize';
import { Swallower } from './Swallower';
import { Position } from './Position';
import { Visualizer } from './Visualizer';
import { Lifetime } from './Lifetime';
import { Particle } from './Particle';
import { Size } from './Size';
import { seed } from './Random';

window.onhashchange = () => window.location.reload();

window.onload = () => {
    const canvas = document.createElement("canvas");
    document.body.appendChild(canvas);
    run(canvas);
}

function run(canvas:HTMLCanvasElement) {

    seed(tokenId);

    const context = canvas.getContext("2d");
    if (context == null) throw new Error("canvas 2d context is not supported");

    const info = new Info(tokenId);
    const resize = new Resize(info, canvas);
    const frame = new Frame(info);
    const particles = new ParticleSet(info);
    const swallower = new Swallower(info, context);
    const mouse = new Mouse(info, context, frame, swallower, particles);
    const visualizer = new Visualizer(info, context, swallower);
    const position = new Position(info, canvas);
    const emitter = new Emitter(info, canvas, position);
    const lifetime = new Lifetime(info);
    const size = new Size(info);
    
    function update(time:number) {

        const dt = frame.getDT(time);

        visualizer.drawBackground();

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
            emitter.init_speed(p);
            lifetime.init(p);
            size.init(p);
            emitter.init_position(p);
            visualizer.init(p);
            particles.add(p);
        }

        if(mouse.restart) {
            run(canvas);
        } else {
            window.requestAnimationFrame(update);
        }

    }

    update(frame.last);

}