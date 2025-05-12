export interface IShape {
    type: "circle" | "rect" | "pencil";
    draw(ctx: CanvasRenderingContext2D): void;
    serialize(): string;
}