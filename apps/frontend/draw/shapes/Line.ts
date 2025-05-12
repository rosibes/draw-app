import { IShape } from "./IShape";

export class Line implements IShape {
    type: "line" = "line";
    public points: { x: number; y: number }[] = [];

    constructor(
        public startX: number,
        public startY: number
    ) {
        this.points.push({ x: startX, y: startY });
    }

    addPoint(x: number, y: number) {
        this.points.push({ x, y });
    }

    draw(ctx: CanvasRenderingContext2D) {
        if (this.points.length < 2) return;

        ctx.strokeStyle = "rgba(255,255,255)";
        ctx.lineWidth = 1.5;

        ctx.beginPath();
        ctx.moveTo(this.points[0].x, this.points[0].y);

        // Desenăm linii între toate punctele
        for (let i = 1; i < this.points.length; i++) {
            ctx.lineTo(this.points[i].x, this.points[i].y);
        }

        ctx.stroke();
    }

    serialize() {
        return JSON.stringify({
            type: "line",
            points: this.points
        });
    }
}