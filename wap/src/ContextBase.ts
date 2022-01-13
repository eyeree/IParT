export type Context = CanvasRenderingContext2D;

export class ContextBase {

    public constructor(public context: Context) {
    }

    public get canvasWidth() { return this.context.canvas.width; }
    public get canvasHeight() { return this.context.canvas.height; }

}
