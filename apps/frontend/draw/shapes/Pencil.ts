import { IShape } from "./IShape";

export class Pencil implements IShape {
    type: "pencil" = "pencil";
    isSelected?: boolean;

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

        // Dacă desenul e selectat, desenăm punctele de control
        if (this.isSelected) {
            this.points.forEach(point => {
                ctx.fillStyle = "white";
                ctx.beginPath();
                ctx.arc(point.x, point.y, 4, 0, Math.PI * 2);
                ctx.fill();
            });
        }
    }

    containsPoint(x: number, y: number): boolean {
        const hitDistance = 5; // Distanța maximă pentru a considera că am dat click pe linie

        // Verificăm fiecare segment al desenului
        for (let i = 0; i < this.points.length - 1; i++) {
            const p1 = this.points[i];
            const p2 = this.points[i + 1];

            // Calculăm distanța de la punct la segment
            const distance = this.distanceToSegment(x, y, p1.x, p1.y, p2.x, p2.y);
            if (distance <= hitDistance) {
                return true;
            }
        }

        return false;
    }

    getBoundingBox(): { x: number; y: number; width: number; height: number } {
        if (this.points.length === 0) {
            return { x: 0, y: 0, width: 0, height: 0 };
        }

        let minX = this.points[0].x;
        let minY = this.points[0].y;
        let maxX = this.points[0].x;
        let maxY = this.points[0].y;

        for (const point of this.points) {
            minX = Math.min(minX, point.x);
            minY = Math.min(minY, point.y);
            maxX = Math.max(maxX, point.x);
            maxY = Math.max(maxY, point.y);
        }

        return {
            x: minX,
            y: minY,
            width: maxX - minX,
            height: maxY - minY
        };
    }

    private distanceToSegment(x: number, y: number, x1: number, y1: number, x2: number, y2: number): number {
        const A = x - x1;
        const B = y - y1;
        const C = x2 - x1;
        const D = y2 - y1;

        const dot = A * C + B * D;
        const lenSq = C * C + D * D;
        let param = -1;

        if (lenSq !== 0) {
            param = dot / lenSq;
        }

        let xx, yy;

        if (param < 0) {
            xx = x1;
            yy = y1;
        } else if (param > 1) {
            xx = x2;
            yy = y2;
        } else {
            xx = x1 + param * C;
            yy = y1 + param * D;
        }

        const dx = x - xx;
        const dy = y - yy;

        return Math.sqrt(dx * dx + dy * dy);
    }

    serialize() {
        return JSON.stringify({
            type: "pencil",
            points: this.points
        });
    }

    getHandles(): { x: number; y: number }[] {
        // Returnăm toate punctele ca handles pentru a putea modifica desenul
        return this.points;
    }
}