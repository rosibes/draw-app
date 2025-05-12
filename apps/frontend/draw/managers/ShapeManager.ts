import { Circle } from "../shapes/Circle";
import { Rectangle } from "../shapes/Rectangle";
import { IShape } from "../shapes/IShape";
import { getExistingShapes } from "../services/ExistingShapes";
import { Pencil } from "../shapes/Pencil";

export class ShapeManager {
    private shapes: IShape[] = [];
    private initialized = false;

    getShapesCopy(): IShape[] {
        const shapesData = JSON.parse(JSON.stringify(this.shapes));
        return shapesData.map((shapeData: any) => {
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
            }
            throw new Error(`Unknown shape type: ${shapeData.type}`);
        });
    }

    setShapes(shapes: IShape[]) {
        this.shapes = shapes.map(shape => {
            // Asigură-te că shape-urile sunt deja instanțe corecte
            if (shape instanceof Circle || shape instanceof Rectangle || shape instanceof Pencil) {
                return shape;
            }
            // Dacă nu, reconstruiește-le (pentru cazurile de undo/redo)
            const shapeData = JSON.parse(JSON.stringify(shape));
            if (shapeData.type === "circle") {
                return new Circle(shapeData.centerX, shapeData.centerY, shapeData.radius);
            } else if (shapeData.type === "rect") {
                return new Rectangle(shapeData.x, shapeData.y, shapeData.width, shapeData.height);
            } else if (shapeData.type === "pencil") {
                return new Pencil(shapeData.points);
            }
            throw new Error(`Unknown shape type: ${shapeData.type}`);
        });
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