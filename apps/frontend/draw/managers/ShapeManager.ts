import { Circle } from "../shapes/Circle";
import { Rectangle } from "../shapes/Rectangle";
import { IShape } from "../shapes/IShape";
import { getExistingShapes } from "../services/ExistingShapes";
import { Pencil } from "../shapes/Pencil";
import { Line } from "../shapes/Line";
import { Rhombus } from "../shapes/Rhombus";

export class ShapeManager {
    private shapes: IShape[] = [];
    private initialized = false;

    getShapes(): IShape[] {
        return [...this.shapes];  // Returnăm o copie pentru siguranță
    }

    setShapes(shapes: IShape[]) {
        this.shapes = [...shapes];  // Facem o copie pentru siguranță
    }

    async loadInitialShapes(roomId: string): Promise<boolean> {
        try {
            const shapesData = await getExistingShapes(roomId);

            this.shapes = shapesData.map((shapeData: any) => {
                if (shapeData.type === "circle") {
                    return new Circle(
                        shapeData.centerX,
                        shapeData.centerY,
                        shapeData.radius
                    );
                } else if (shapeData.type === "rect") {
                    return new Rectangle(
                        shapeData.x,
                        shapeData.y,
                        shapeData.width,
                        shapeData.height
                    );
                } else if (shapeData.type === "pencil") {
                    return new Pencil(shapeData.points);
                } else if (shapeData.type === "line") {
                    // Verificăm dacă avem puncte
                    if (shapeData.points && shapeData.points.length > 0) {
                        const line = new Line(shapeData.points[0].x, shapeData.points[0].y);
                        shapeData.points.slice(1).forEach((point: { x: number; y: number }) => {
                            line.addPoint(point.x, point.y);
                        });
                        return line;
                    }
                    return null;
                } else if (shapeData.type === "romb") {
                    return new Rhombus(
                        shapeData.x,
                        shapeData.y,
                        shapeData.width,
                        shapeData.height
                    );
                }
                return null;
            }).filter((shape: IShape | null): shape is IShape => shape !== null);

            this.initialized = true;
            return true;
        } catch (error) {
            console.error("Error loading shapes:", error);
            return false;
        }
    }

    addShape(shape: IShape) {
        this.shapes.push(shape);
    }

    drawAll(ctx: CanvasRenderingContext2D) {
        this.shapes.forEach(shape => {
            shape.draw(ctx);
        });
    }

    clearAndDraw(ctx: CanvasRenderingContext2D, width: number, height: number) {
        ctx.clearRect(0, 0, width, height);
        ctx.fillStyle = "rgba(0,0,0)";
        ctx.fillRect(0, 0, width, height);
        this.drawAll(ctx);
    }

    isInitialized(): boolean {
        return this.initialized;
    }
}