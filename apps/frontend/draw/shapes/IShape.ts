export interface IShape {
    type: "circle" | "rect" | "pencil" | "romb" | "line";
    isSelected?: boolean;
    draw(ctx: CanvasRenderingContext2D): void;
    serialize(): string;
    // metode pentru selectare
    containsPoint(x: number, y: number): boolean;
    getBoundingBox(): { x: number; y: number; width: number; height: number };
    getHandles(): { x: number; y: number }[];
}