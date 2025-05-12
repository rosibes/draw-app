import { IShape } from "./IShape";

export class Pencil implements IShape {
    type: "pencil" = "pencil";
    constructor(
        public points: {
            x: number,
            y: number
        }[]
    ) {

    }

    draw(ctx: CanvasRenderingContext2D) {
        ctx.strokeStyle = "rgba(255,255,255)"
        ctx.lineWidth = 1.5;
        ctx.beginPath();

        // Desenează linia conectând punctele
        this.points.forEach((point, index) => {
            if (index === 0) {
                ctx.moveTo(point.x, point.y);
            } else {
                ctx.lineTo(point.x, point.y);
            }
        });

        ctx.stroke();
    }

    serialize() {
        return JSON.stringify({
            type: "pencil",
            points: this.points
        });
    }
}