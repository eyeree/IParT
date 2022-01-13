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

window.onhashchange = () => window.location.reload();

window.onload = () => {

    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d")!;
    if (context == null) throw new Error("canvas 2d context is not supported");

    const info = new Info(tokenId);
    const resize = new Resize(info, canvas);
    const frame = new Frame(info);
    const mouse = new Mouse(info, canvas, frame);
    const particles = new ParticleSet(info);
    const background = new Background(info, context);
    const emitter = new Emitter(info, context, particles, mouse, background);
    
    function update(time:number) {

        const dt = frame.getDT(time);

        background.update(dt);
        emitter.update(dt);
        particles.update(dt);

        window.requestAnimationFrame(update);

    }

    update(frame.last);

    document.body.appendChild(canvas);

}