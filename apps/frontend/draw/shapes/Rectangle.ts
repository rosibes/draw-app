import { IShape } from "./IShape";

export class Rectangle implements IShape {
    type: "rect" = "rect";
    isSelected: boolean = false;
    constructor(
        public x: number,
        public y: number,
        public width: number,
        public height: number
    ) { }

    containsPoint(x: number, y: number): boolean {
        return x >= this.x && x <= this.x + this.width &&
            y >= this.y && y <= this.y + this.height;
    }

    getBoundingBox(): { x: number; y: number; width: number; height: number } {
        return {
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height
        };
    }

    draw(ctx: CanvasRenderingContext2D) {
        // Desenăm forma normală
        ctx.strokeStyle = "rgba(255,255,255)";
        ctx.lineWidth = 1.5;
        ctx.strokeRect(this.x, this.y, this.width, this.height);

        // Dacă forma e selectată, desenăm bounding box-ul și punctele de control
        if (this.isSelected) {
            // Desenăm bounding box-ul
            ctx.strokeStyle = "rgba(255,255,255,0.5)";
            ctx.setLineDash([5, 5]);
            ctx.strokeRect(this.x, this.y, this.width, this.height);
            ctx.setLineDash([]);

            // Desenăm punctele de control
            const handles = this.getHandles();
            handles.forEach(handle => {
                ctx.fillStyle = "white";
                ctx.beginPath();
                ctx.arc(handle.x, handle.y, 4, 0, Math.PI * 2);
                ctx.fill();
            });
        }
    }
    getHandles(): { x: number; y: number }[] {
        return [
            { x: this.x, y: this.y },                    // Top-left
            { x: this.x + this.width / 2, y: this.y },     // Top-center
            { x: this.x + this.width, y: this.y },       // Top-right
            { x: this.x + this.width, y: this.y + this.height / 2 }, // Right-center
            { x: this.x + this.width, y: this.y + this.height },   // Bottom-right
            { x: this.x + this.width / 2, y: this.y + this.height }, // Bottom-center
            { x: this.x, y: this.y + this.height },      // Bottom-left
            { x: this.x, y: this.y + this.height / 2 }     // Left-center
        ];
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