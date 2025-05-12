import { IShape } from "./IShape";

export class Circle implements IShape {
    type: "circle" = "circle"; // Valoare literală fixă
    constructor(
        public centerX: number,
        public centerY: number,
        public radius: number
    ) { }

    draw(ctx: CanvasRenderingContext2D) {
        ctx.strokeStyle = "rgba(255,255,255)"
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(this.centerX, this.centerY, Math.abs(this.radius), 0, Math.PI * 2);
        ctx.stroke();
    }

    serialize() {
        return JSON.stringify({
            type: "circle",
            centerX: this.centerX,
            centerY: this.centerY,
            radius: this.radius
        });
    }
}