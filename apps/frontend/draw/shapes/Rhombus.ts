import { IShape } from "./IShape";

export class Rhombus implements IShape {
    type: "romb" = "romb";
    constructor(
        public x: number,
        public y: number,
        public width: number,
        public height: number
    ) { }

    draw(ctx: CanvasRenderingContext2D) {
        ctx.strokeStyle = "rgba(255,255,255)";
        ctx.lineWidth = 1.5;

        // Calculăm punctele rombului
        const centerX = this.x + this.width / 2;
        const centerY = this.y + this.height / 2;

        // Începem un nou path
        ctx.beginPath();

        // Desenăm liniile rombului
        ctx.moveTo(centerX, this.y);                    // Vârful de sus
        ctx.lineTo(this.x + this.width, centerY);       // Vârful din dreapta
        ctx.lineTo(centerX, this.y + this.height);      // Vârful de jos
        ctx.lineTo(this.x, centerY);                    // Vârful din stânga
        ctx.closePath();                                // Închidem path-ul

        // Desenăm conturul
        ctx.stroke();
    }

    serialize() {
        return JSON.stringify({
            type: "romb",
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height
        });
    }
}