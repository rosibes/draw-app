import { IShape } from "./IShape";

export class Rectangle implements IShape {
    type: "rect" = "rect";
    constructor(
        public x: number,
        public y: number,
        public width: number,
        public height: number
    ) { }

    draw(ctx: CanvasRenderingContext2D) {
        ctx.strokeStyle = "rgba(255,255,255)"
        ctx.lineWidth = 1.5;
        ctx.strokeRect(this.x, this.y, this.width, this.height);
    }

    serialize() {
        return JSON.stringify({
            type: "rect",
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height
        });
    }
}