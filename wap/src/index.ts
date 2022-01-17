declare global { const DEBUG:boolean; }

import './ErrorHandler';

import { tokenId } from './TokenId';
import { ParticleSet } from './ParticleSet';
import { Emitter } from './Emitter';
import { Background } from './Background';
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

window.onhashchange = () => window.location.reload();

window.onload = () => {

    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d")!;
    if (context == null) throw new Error("canvas 2d context is not supported");

    const info = new Info(tokenId);
    const resize = new Resize(info, canvas);
    const frame = new Frame(info);
    const swallower = new Swallower(info, context);
    const particles = new ParticleSet(info);
    const mouse = new Mouse(info, context, frame, swallower, particles);
    const visualizer = new Visualizer(info, context);
    const emitter = new Emitter(info, canvas);
    const background = new Background(info, context);
    const position = new Position(info, canvas);
    const lifetime = new Lifetime(info);
    const size = new Size(info);
    
    function update(time:number) {

        const dt = frame.getDT(time);

        background.draw();
        swallower.draw();

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
                visualizer.draw(p);
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

        window.requestAnimationFrame(update);

    }

    update(frame.last);

    document.body.appendChild(canvas);

}