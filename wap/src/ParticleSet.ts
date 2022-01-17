import { Particle } from './Particle';
import { Info } from "./Info";

export const MAX_PARTICLES =  4000;

export class ParticleSet {

    private particles = new Set<Particle>();

    constructor(private info: Info) {
        info.addStat("particles", () => this.particles.size);
    }

    public get count() { 
        return this.particles.size; 
    }

    public get isFull() {
        return this.particles.size >= MAX_PARTICLES;
    }

    add(particle: Particle) {
        if (!this.isFull) {
            this.particles.add(particle);
        } else {
            console.warn("too many particles");
        }
    }

    remove(particle: Particle) {
        this.particles.delete(particle);
    }

    forEach(f:(p:Particle) => void) {
        this.particles.forEach(f);
    }

}
