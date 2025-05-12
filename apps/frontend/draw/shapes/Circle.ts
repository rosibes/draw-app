import { IShape } from "./IShape";

export class Circle implements IShape {
    type: "circle" = "circle";
    isSelected: boolean = false;

    constructor(
        public centerX: number,
        public centerY: number,
        public radius: number

    ) { }
    containsPoint(x: number, y: number): boolean {
        const dx = x - this.centerX;
        const dy = y - this.centerY;
        return dx * dx + dy * dy <= this.radius * this.radius;
    }

    getBoundingBox(): { x: number; y: number; width: number; height: number } {
        return {
            x: this.centerX - this.radius,
            y: this.centerY - this.radius,
            width: this.radius * 2,
            height: this.radius * 2
        };
    }

    draw(ctx: CanvasRenderingContext2D) {
        ctx.strokeStyle = "rgba(255,255,255)"
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(this.centerX, this.centerY, Math.abs(this.radius), 0, Math.PI * 2);
        ctx.stroke();
        if (this.isSelected) {
            const box = this.getBoundingBox();

            // Bounding box
            ctx.strokeStyle = "rgba(255,255,255,0.5)";
            ctx.setLineDash([5, 5]);
            ctx.strokeRect(box.x, box.y, box.width, box.height);
            ctx.setLineDash([]);

            // Puncte de control
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
            { x: this.centerX - this.radius, y: this.centerY },                    // Left
            { x: this.centerX, y: this.centerY - this.radius },                    // Top
            { x: this.centerX + this.radius, y: this.centerY },                    // Right
            { x: this.centerX, y: this.centerY + this.radius }                     // Bottom
        ];
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


