export interface IShape {
    type: "circle" | "rect" | "pencil" | "romb";
    draw(ctx: CanvasRenderingContext2D): void;
    serialize(): string;
}