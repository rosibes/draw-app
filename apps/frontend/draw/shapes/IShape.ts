export interface IShape {
    type: "circle" | "rect" | "pencil" | "romb" | "line";
    draw(ctx: CanvasRenderingContext2D): void;
    serialize(): string;
}