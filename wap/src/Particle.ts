
export class Trace {
    
    public constructor() {
        if (DEBUG && Trace.traceNext) {
            Trace.traceNext = false;
            Trace.traced = this;
            this.trace = true;
            console.log("[Particle] Created Particle");
        }
    }

    public static traceOne() {
        if(Trace.traced) {
            Trace.traced.trace = false;
            Trace.traced = null;
        }
        Trace.traceNext = true;
        console.clear();
    }

    public static toggleTrace() {
        if(Trace.autoTraceNext) {
            Trace.stopTrace();
        } else {
            Trace.startTrace();
        }
    }

    public static startTrace() {
        Trace.autoTraceNext = true;
        Trace.traceNext = true;
        if(Trace.traced) {
            Trace.traced.trace = false;
            Trace.traced = null;
        }
    }

    public static stopTrace() {
        Trace.traceNext = false;
        Trace.autoTraceNext = false;
        if(Trace.traced) {
            Trace.traced.trace = false;
            Trace.traced = null;
        }
    }

    public static get isTracing() {
        return Trace.traced?.trace ?? false;
    }

    private static autoTraceNext = false;
    private static traceNext = false;
    private static traced:Trace|null = null;    
    public trace: boolean = false;

    public died() {
        if(this.trace) {
            Trace.traced = null;
            Trace.traceNext = Trace.autoTraceNext;
            console.log("[Particle] Particle Died - traceNext: %s - autoTraceNext: %s", Trace.traceNext, Trace.autoTraceNext);
        }
    }

}

class NoTrace {
    public readonly trace = false;
    public died() {}
}

function Base():typeof Trace| typeof NoTrace {
    return DEBUG ? Trace : NoTrace;
}

export class Particle extends Trace {

    public x: number = 0;
    public y: number = 0;
    public dx: number = 0;
    public dy: number = 0;
    public health: number = 0;
    public life: number = 0;
    public age: number = 0;
    public style:string = "";
    public radius:number = 0;
    public edgeDetect:boolean = true;
    public swallowed:boolean = false;

    get isOld() { return this.age > this.life; }
    get isDead() { return this.health <= 0; }

    public kill() {
        this.health = 0;
        this.died();
    }

    public forceFrom(x:number, y:number, strength:number):[number, number, number] {
        const diffX = x - this.x;
        const diffY = y - this.y;
        const distance = Math.sqrt(diffX * diffX + diffY * diffY);
        const force = (1 / distance) * strength;
        const angle = Math.atan2(diffY, diffX);
        const ddx = Math.cos(angle) * force;
        const ddy = Math.sin(angle) * force;
        return [ddx, ddy, distance];
    }

    get speed() { 
        return Math.sqrt(this.dx*this.dx + this.dy*this.dy); 
    }

}
