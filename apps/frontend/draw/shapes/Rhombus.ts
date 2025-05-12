import { IShape } from "./IShape";

export class Rhombus implements IShape {
    type: "romb" = "romb";
    isSelected: boolean = false;
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

        // Dacă rombul e selectat, desenăm punctele de control
        if (this.isSelected) {
            const handles = this.getHandles();
            handles.forEach(handle => {
                ctx.fillStyle = "white";
                ctx.beginPath();
                ctx.arc(handle.x, handle.y, 4, 0, Math.PI * 2);
                ctx.fill();
            });
        }
    }

    containsPoint(x: number, y: number): boolean {
        const centerX = this.x + this.width / 2;
        const centerY = this.y + this.height / 2;

        // Verificăm dacă punctul este în interiorul rombului
        // Folosim ecuația parametrică pentru a verifica dacă punctul este în interior
        const dx = Math.abs(x - centerX);
        const dy = Math.abs(y - centerY);

        // Verificăm dacă punctul este în interiorul dreptunghiului care înconjoară rombul
        if (dx > this.width / 2 || dy > this.height / 2) {
            return false;
        }

        // Verificăm dacă punctul este în interiorul rombului folosind ecuația parametrică
        return (dx / (this.width / 2) + dy / (this.height / 2)) <= 1;
    }

    getBoundingBox(): { x: number; y: number; width: number; height: number } {
        return {
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height
        };
    }

    getHandles(): { x: number; y: number }[] {
        const centerX = this.x + this.width / 2;
        const centerY = this.y + this.height / 2;

        return [
            { x: centerX, y: this.y },                    // Top
            { x: this.x + this.width, y: centerY },       // Right
            { x: centerX, y: this.y + this.height },      // Bottom
            { x: this.x, y: centerY },                    // Left
            { x: centerX, y: centerY }                    // Center
        ];
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