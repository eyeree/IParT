function handleError(e:any) {
    const span = document.createElement("span");
    span.innerText = "(" + e + ")";
    document.body.replaceChildren(span);
}

try {

    window.onhashchange = () => window.location.reload();

    const tokenId = getTokenId();

    function getTokenId() {
        try {
            const tokenId = Number.parseInt(window.location.hash.substring(1));
            if(isNaN(tokenId)) {
                return 1;
                throw new Error(`could not parse "${window.location.hash.substring(1)}" as an integer`);
            }
            return tokenId;
        } catch(e) {
            throw new Error(`url fragment must be the token id ➜ ${e}`);
        }
    }

    // Tests show mulberry32 produces good random values even when sequential 
    // low valued integral values, such as token ids, are used as the seed.
    const rand1 = mulberry32(tokenId); 
    const randf = (min:number, max:number) => rand1() * (max - min) + min;
    const randi = (min:number, max:number) => Math.floor(randf(min, max));
    const randb = () => rand1() < 0.5;
    const randa = <T>(a:T[], min=0):T => a[randi(min, a.length)];
    const randg = randn_bm;

    const PALLETS = [
        ["black", "gold", "darkmagenta", "darkseagreen" ],
        ["indigo", "goldenrod", "hotpink",  "mediumpurple"],
        ["aquamarine", "cadetblue", "chocolate", "firebrick"],
        ["darkred", "darkolivegreen", "lightgoldenrodyellow", "lightsteelblue"],
        ["skyblue", "midnightblue", "orangered", "sienna"]
    ];
    const PALLET = randa(PALLETS);
    const BACKGROUND_COLOR = PALLET[0];

    const MIN_GRAVITY = 30;
    const MAX_GRAVITY = 50;
    const MIN_FRICTION = 0.1;
    const MAX_FRICTION = 1;
    const MIN_LIFE = 20;
    const MAX_LIFE = 90;
    const MAX_DELTA_LIFE = MIN_LIFE - 5;
    const MIN_DELTA_LIFE = -MAX_DELTA_LIFE;
    const MIN_MOVE = 0.5;
    const MIN_DELAY = 0.01;
    const MAX_DELAY = 0.1;

    const gravity:number = randf(MIN_GRAVITY, MAX_GRAVITY);

    type Context = CanvasRenderingContext2D;

    class ContextBase {

        protected constructor(protected context:Context) {
        }

        protected get canvasWidth() { return this.context.canvas.width; }
        protected get canvasHeight() { return this.context.canvas.height; }

    }

    const IMMORTAL = 0;

    let traceNext = false;

    class Particle extends ContextBase {

        public x:number = 0;
        public y:number = 0;
        public dx:number = 0;
        public dy:number = 0;
        public radius:number = 1;
        public health:number = 1;
        public life:number = IMMORTAL;
        public lived:number = 0;
        public trace:boolean = false;

        public constructor(protected context:Context) {
            super(context);
            if(traceNext) {
                this.trace = true;
                traceNext = false;
                console.log("[Particle] Created Particle");
            }
        }

        public update(seconds:number) {

            this.x += this.dx * seconds;
            this.y += this.dy * seconds;

            if(this.life != IMMORTAL) {
                this.lived += seconds;
                this.health = 1 - (this.lived / this.life);
            }

            if(this.trace) {
                console.log(
                    "[Particle] Update - seconds: %f - dx: %f - x += %f - dy: %f - y += %f - x: %f - y:%f - life: %f - lived: %f - health: %f", 
                    seconds, this.dx, this.dx * seconds, this.dy, this.dy * seconds, this.x, this.y, this.life, this.lived, this.health
                );
            }

        }

        public draw() {}

    }

    type ParticleConstructor = new (...args: any[]) => Particle;

    function Gravity<TBase extends ParticleConstructor>(Base: TBase) {

        class Gravity extends Base {

            static readonly gravity:number = randf(MIN_GRAVITY, MAX_GRAVITY);

            update(seconds:number) {
                this.dy += Gravity.gravity * seconds;
                if(this.trace) {
                    console.log("[Gravity] dy: %f - dy += %f", this.dy, Gravity.gravity * seconds);
                }
                super.update(seconds);
            }

        }

        console.log("Gravity - %f", Gravity.gravity);

        return Gravity;

    }

    function Friction<TBase extends ParticleConstructor>(Base: TBase) {

        class Friction extends Base {

            static readonly friction:number = randf(MIN_FRICTION, MAX_FRICTION);
            
            update(seconds:number) {
                const friction = Friction.friction * seconds;
                const ddy = 1 - friction;
                const ddx = 1 - friction;
                this.dy *= ddy;
                this.dx *= ddx;
                if(this.trace) {
                    console.log("[Friction] friction: %f - dx: %f - dx -= %f - dy: %f - dy -= %f", Friction.friction, this.dx, ddx, this.dy, ddy);
                }
                super.update(seconds);
            }

        }

        console.log("Friction - %f", Friction.friction);

        return Friction;
        
    }

    function FromTop<TBase extends ParticleConstructor>(Base: TBase) {
        
        class FromTop extends Base {

            constructor(...args: any[]) {
                super(...args);
                this.x = randf(0, this.canvasWidth);
                this.y = 0;
                const ddy = randf(MIN_GRAVITY, MAX_GRAVITY);
                this.dy += ddy;
                if(this.trace) {
                    console.log("[FromTop] x: %f - dy: %f - dy += %f", this.x, this.dy, ddy)
                }
            }

        }

        console.log("FromTop");

        return FromTop;

    }

    function FromBottom<TBase extends ParticleConstructor>(Base: TBase) {
        
        class FromBottom extends Base {

            constructor(...args: any[]) {
                super(...args);
                this.x = randf(0, this.canvasWidth);
                this.y = this.canvasHeight;
                const ddy = randf(MAX_GRAVITY * 1, MAX_GRAVITY * 8);
                this.dy -= ddy;
                if(this.trace) {
                    console.log("[FromBottom] x: %f - dy: %f - dy -= %f", this.x, this.dy, ddy)
                }
            }

        }

        console.log("FromBottom");

        return FromBottom;

    }

    function FromCenter<TBase extends ParticleConstructor>(Base: TBase) {

        class FromCenter extends Base {

            constructor(...args: any[]) {
                super(...args);
                this.x = this.canvasWidth / 2;
                this.y = this.canvasHeight / 2;
                const ddy = randf(-MAX_GRAVITY * 2, MAX_GRAVITY * 2);
                const ddx = randf(-MAX_GRAVITY * 2, MAX_GRAVITY * 2);  
                this.dy += ddy;
                this.dx += ddx;
                if(this.trace) {
                    console.log("[FromCenter] x: %f - dy: %f - dy -= %f - dx: %f - dx -= %f", this.x, this.dy, ddy, this.dx, ddx);
                }
            }

        }

        console.log("FromCenter");

        return FromCenter;

    }

    const Emitters = [FromTop, FromBottom, FromCenter];

    function AgeKill<TBase extends ParticleConstructor>(Base: TBase) {

        class AgeKill extends Base {

            static baseLife = randf(MIN_LIFE, MAX_LIFE);

            constructor(...args: any[]) {
                super(...args);
                this.life = AgeKill.baseLife + randf(MIN_DELTA_LIFE, MAX_DELTA_LIFE);
                if(this.trace) {
                    console.log("[AgeKill] - life: %f", this.life);
                }
            }

        }

        console.log("AgeKill - %f", AgeKill.baseLife);

        return AgeKill;
        
    }

    function StopKill<TBase extends ParticleConstructor>(Base: TBase) {

        class StopKill extends Base {

            update(seconds:number) {
                super.update(seconds);
                if(this.dx < MIN_MOVE && this.dy < MIN_MOVE && this.life == IMMORTAL) {
                    this.life = randf(2, 5);
                    if(this.trace) {
                        console.log("[StopKill] - life: %f - dx: %f - dy: %f", this.life, this.dx, this.dy);
                    }
                }
            }

        }

        console.log("StopKill");

        return StopKill;
        
    }

    const Killers = [AgeKill, StopKill];

    function DeathShrink<TBase extends ParticleConstructor>(Base: TBase) {

        class DeathShrink extends Base {

            baseRadius = 0;

            update(seconds:number) {
                super.update(seconds);
                if(this.health < 1) {
                    if(this.baseRadius == 0) {
                        this.baseRadius = this.radius;
                    }
                    this.radius = this.baseRadius * this.health;
                    if(this.trace) {
                        console.log("[DeathShrink] radius: %f - health: %f", this.radius, this.health);
                    }
                } 
            }

        }

        console.log("DeathShrink");
        
        return DeathShrink;

    }

    function EdgeKill<TBase extends ParticleConstructor>(Base: TBase) {

        class EdgeKill extends Base {

            update(seconds:number) {
                super.update(seconds);
                if(
                    this.x < 0 - this.radius || 
                    this.x > this.canvasWidth + this.radius ||
                    this.y < 0 - this.radius ||
                    this.y > this.canvasHeight + this.radius
                ) {
                    this.health = 0;
                    if(this.trace) {
                        console.log("[EdgeKill] x: %f - y: %f - radius: %f", this.x, this.y, this.radius);
                    }
                }
            }

        }

        console.log("EdgeKill");

        return EdgeKill;
        
    }

    function EdgeBounce<TBase extends ParticleConstructor>(Base: TBase) {

        class EdgeBounce extends Base {

            static maxDeflection:number = randf(3, 15);
            static minDeflection:number = -this.maxDeflection;

            update(seconds:number) {
                super.update(seconds);
                if(this.x < 0 + this.radius) {
                    this.x = this.radius;
                    this.dx = -this.dx;
                    if(Math.abs(this.dx) < 0.5) {
                        this.dx = randf(EdgeBounce.minDeflection, EdgeBounce.maxDeflection);
                        if(this.trace) {
                            console.log("[EdgeBounce] LEFT DEFLECTED - x: %f - dx: %f", this.x, this.dx)
                        }
                    } else {
                        this.dx = -this.dx;
                        if(this.trace) {
                            console.log("[EdgeBounce] LEFT - x: %f - dx: %f", this.x, this.dx)
                        }
                    }
                } else if (this.x > this.canvasWidth - this.radius) {
                    this.x = this.canvasWidth - this.radius;
                    if(Math.abs(this.dx) < 0.5) {
                        this.dx = randf(EdgeBounce.minDeflection, EdgeBounce.maxDeflection);
                        if(this.trace) {
                            console.log("[EdgeBounce] RIGHT DEFLECTED - x: %f - dx: %f", this.x, this.dx)
                        }
                    } else {
                        this.dx = -this.dx;
                        if(this.trace) {
                            console.log("[EdgeBounce] RIGHT - x: %f - dx: %f", this.x, this.dx)
                        }
                    }
                }
                if(this.y < 0 + this.radius) {
                    this.y = this.radius;
                    this.dy = -this.dy;
                    if(Math.abs(this.dy) < 0.5) {
                        this.dy = randf(EdgeBounce.minDeflection, EdgeBounce.maxDeflection);
                        if(this.trace) {
                            console.log("[EdgeBounce] TOP DEFLECTED - y: %f - dy: %f", this.y, this.dy)
                        }
                    } else {
                        this.dy = -this.dy;
                        if(this.trace) {
                            console.log("[EdgeBounce] TOP - y: %f - dy: %f", this.y, this.dy)
                        }
                    }
                } else if (this.y > this.canvasHeight - this.radius) {
                    this.y = this.canvasHeight - this.radius;
                    if(Math.abs(this.dy) < 0.5) {
                        this.dy = randf(EdgeBounce.minDeflection, EdgeBounce.maxDeflection);
                        if(this.trace) {
                            console.log("[EdgeBounce] BOTTOM DEFLECTED - y: %f - dy: %f", this.y, this.dy)
                        }
                    } else {
                        this.dy = -this.dx;
                        if(this.trace) {
                            console.log("[EdgeBounce] BOTTOM - y: %f - dy: %f", this.y, this.dy)
                        }
                    }
                }
            }

        }

        console.log("EdgeBounce - %f", EdgeBounce.maxDeflection);

        return EdgeBounce;
        
    }

    const Edges = [EdgeKill, EdgeBounce];

    function DrawArc<TBase extends ParticleConstructor>(Base: TBase) {

        class DrawArc extends Base {

            readonly style:string = randa(PALLET, 1);

            constructor(...args: any[]) {
                super(...args);
                this.radius = randf(3, 6);
            }

            draw() {
                this.context.beginPath();
                this.context.fillStyle = this.style;
                this.context.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
                this.context.closePath();
                this.context.fill();

                if(this.trace) {
                    this.context.beginPath();
                    this.context.strokeStyle = "hotpink";
                    this.context.moveTo(0, this.y);
                    this.context.lineTo(this.canvasWidth, this.y);
                    this.context.moveTo(this.x, 0);
                    this.context.lineTo(this.x, this.canvasHeight);
                    this.context.stroke();
                }
            }

        }

        console.log("DrawArc");

        return DrawArc;
        
    }

    const MAX_PARTICLES = 4000;

    class ParticleSet {

        private particles = new Set<Particle>();

        constructor() {
        }

        public get count() { return this.particles.size; }

        update(seconds: number) {
            for(const particle of this.particles) {
                particle.update(seconds);
                if(particle.health <= 0) {
                    this.remove(particle);
                    if(particle.trace) {
                        console.log("[ParticleSet] Removed Particle - health %f", particle.health);
                        console.log("**************************************************************************************************");
                        traceNext = true;
                    }
                } else {
                    particle.draw();
                }
            }
        }

        public get full() { 
            return this.particles.size >= MAX_PARTICLES; 
        }

        add(particle:Particle) {
            if(!this.full) {
                this.particles.add(particle);
            } else {
                console.warn("too many particles")
            }
        }

        remove(particle:Particle) {
            this.particles.delete(particle);
        }

    }

    class Emitter extends ContextBase {

        private next:number = 0;
        private readonly ParticleClass:ParticleConstructor;

        constructor(protected context:Context, private particles:ParticleSet) {
            super(context);

            let ParticleClass = Particle;

            ParticleClass = randa(Emitters)(ParticleClass);

            if (randb()) ParticleClass = Friction(ParticleClass);
            if (randb()) ParticleClass = Gravity(ParticleClass);

            ParticleClass = randa(Killers)(ParticleClass);
            ParticleClass = randa(Edges)(ParticleClass);

            ParticleClass = DeathShrink(ParticleClass);
            ParticleClass = DrawArc(ParticleClass);

            this.ParticleClass = ParticleClass;
        }

        public update(seconds:number) {
            this.next -= seconds;
            if (this.next <= 0) {
                this.next = randf(MIN_DELAY, MAX_DELAY);
                this.particles.add(new this.ParticleClass(this.context));
            }
        }

    }

    class Background extends ContextBase {

        constructor(protected context:Context) {
            super(context);
        }

        public update(seconds:number) {
            this.context.fillStyle = BACKGROUND_COLOR;
            this.context.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
        }

    }

    class Info {

        private readonly info = document.getElementById("info")! as HTMLDivElement;
        private readonly stat_fps = document.getElementById("fps") as HTMLSpanElement;
        private readonly stat_particles = document.getElementById("particles") as HTMLSpanElement;
        private readonly token_id = document.getElementById("token_id") as HTMLSpanElement;

        private interval = -1;

        private count = 0;
        private elapsed = 0;
        private fps = 0;

        constructor(private tokenId:number, private particles:ParticleSet) {
            this.token_id.innerText = tokenId.toString();
        }

        private updateInfo() {
            this.stat_fps.innerText = Math.round(this.fps).toString();
            this.stat_particles.innerText = this.particles.count.toString();
        }
                    
        showInfo() {
            this.updateInfo();
            this.info.classList.remove("hidden");
            this.interval = setInterval(() => this.updateInfo(), 1000);
        }

        hideInfo() {
            this.info.classList.add("hidden");   
            clearInterval(this.interval);
            this.interval = -1;
        }

        countFrame(seconds:number) {
            this.count++;
            this.elapsed += seconds;
            if(this.elapsed >= 1) {
                this.fps = this.count;
                this.count = 0;
                this.elapsed = 0;
            }    
        }

        get isVisible() { return this.interval != -1; }

    }

    class Mouse {

        private readonly show_info = document.getElementById("show_info")! as HTMLDivElement;
        private readonly full_screen = document.getElementById("full_screen")! as HTMLDivElement;

        constructor(private info:Info, private canvas:HTMLCanvasElement) {

            window.onmousemove = event => {
                console.log("mouse", event.x, event.y);
            };

            window.onmousedown = event => {
                if(event.target == canvas && this.info.isVisible) {
                    this.info.hideInfo();
                }
            };

            window.onmouseup = event => {

            }

            this.show_info.onclick = () => {
                if(info.isVisible) {
                    info.hideInfo();
                } else {
                    info.showInfo();
                }
            }

            if(document.fullscreenEnabled) {
                this.full_screen.onclick = () => {

                    var elem = document.documentElement;

                    if(document.fullscreenElement) {
                        document.exitFullscreen();
                    } else {
                        document.documentElement.requestFullscreen();
                    }

                }
            } else {
                this.full_screen.classList.add("hidden");
            }

        }

    }

    window.onload = () => {

        try {

            const canvas = document.createElement("canvas");
            const context = canvas.getContext("2d")!;
            if (context == null) throw new Error("canvas is not supported");

            function setSize() {
                canvas.width = window.innerWidth;
                canvas.height = window.innerHeight;
            };

            window.onresize = setSize;
            setSize();

            const particles = new ParticleSet();
            const emitter = new Emitter(context, particles);
            const background = new Background(context);
            const info = new Info(tokenId, particles);
            const mouse = new Mouse(info, canvas);
            
            let last = performance.now();

            function draw(time:number) {
                try {

                    // const seconds = 0.006960; 
                    const seconds = (time - last) / 1000;
                    last = time;

                    info.countFrame(seconds);

                    background.update(seconds);
                    emitter.update(seconds);
                    particles.update(seconds);

                    window.requestAnimationFrame(draw);

                } catch(e) {
                    handleError(e);
                }
            }

            draw(last);

            document.body.appendChild(canvas);

        } catch(e) {
            handleError(e);
        }

    }


    // from https://stackoverflow.com/a/47593316
    function mulberry32(a:number) {
        return function() {
        var t = a += 0x6D2B79F5;
        t = Math.imul(t ^ t >>> 15, t | 1);
        t ^= t + Math.imul(t ^ t >>> 7, t | 61);
        return ((t ^ t >>> 14) >>> 0) / 4294967296;
        }
    }

    // from https://stackoverflow.com/a/36481059
    function randn_bm() {
        var u = 0, v = 0;
        while(u === 0) u = rand1(); //Converting [0,1) to (0,1)
        while(v === 0) v = rand1();
        return Math.sqrt( -2.0 * Math.log( u ) ) * Math.cos( 2.0 * Math.PI * v );
    }

} catch(e) {
    handleError(e);
}