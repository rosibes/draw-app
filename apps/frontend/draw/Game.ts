import { ShapeManager } from "./managers/ShapeManager";
import { SocketService } from "./services/SocketService";
import { Circle } from "./shapes/Circle";
import { Rectangle } from "./shapes/Rectangle";
import { Tool } from "@/components/Canvas";
import { IShape } from "./shapes/IShape";
import { Pencil } from "./shapes/Pencil";
import { Rhombus } from "./shapes/Rhombus";
import { Line } from "./shapes/Line";

export class Game {
    private shapeManager = new ShapeManager();
    private socketService: SocketService;
    private selectedTool: Tool = "hand";
    private clicked = false;
    private isPanning = false;
    private startX = 0;
    private startY = 0;
    private currentPencilPoints: { x: number; y: number }[] = [];
    private zoom = 1;
    private offsetX = 0;
    private offsetY = 0;
    private lastPanX = 0;
    private lastPanY = 0;
    private isSpacePressed = false;
    private undoStack: IShape[][] = [];
    private redoStack: IShape[][] = [];
    private currentPolyline: Line | null = null;
    private selectedShape: IShape | null = null;
    private isDragging = false;
    private dragStartX = 0;
    private dragStartY = 0;
    private selectedHandleIndex: number = -1;
    private onToolChange: ((tool: Tool) => void) | null = null;

    constructor(
        private canvas: HTMLCanvasElement,
        private roomId: string,
        socket: WebSocket,
        onToolChange?: (tool: Tool) => void
    ) {
        const ctx = canvas.getContext("2d")!;
        this.socketService = new SocketService(socket, roomId);
        this.onToolChange = onToolChange || null;
        this.initialize(ctx);
        this.initHandlers();
        this.initMouseHandlers();
        this.initKeyboardHandlers();
    }

    private initHandlers() {
        this.socketService.onShapeReceived((shape) => {
            this.shapeManager.addShape(shape);
            this.redrawCanvas();
        });
    }

    private async initialize(ctx: CanvasRenderingContext2D) {
        try {
            await this.shapeManager.loadInitialShapes(this.roomId);
            this.shapeManager.clearAndDraw(ctx, this.canvas.width, this.canvas.height);
        } catch (error) {
            console.error("Initialization failed:", error);
        }
    }

    public redrawCanvas() {
        const ctx = this.canvas.getContext("2d")!;
        ctx.save();
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        ctx.translate(this.offsetX, this.offsetY);
        ctx.scale(this.zoom, this.zoom);

        // Desenăm toate formele salvate
        this.shapeManager.clearAndDraw(ctx, this.canvas.width / this.zoom, this.canvas.height / this.zoom);

        // Dacă avem o linie în desen, o desenăm și pe ea
        if (this.selectedTool === "line" && this.currentPolyline) {
            this.currentPolyline.draw(ctx);
        }

        ctx.restore();
    }

    setTool(tool: Tool) {
        if (this.selectedShape) {
            this.selectedShape.isSelected = false;
            this.selectedShape = null;
        }
        if (this.selectedTool === "line" && this.currentPolyline) {
            // Finalizăm linia când schimbăm tool-ul
            this.addToHistory();  // Adaugă această linie
            this.shapeManager.addShape(this.currentPolyline);
            this.socketService.sendShape(this.currentPolyline);
            this.currentPolyline = null;
        }
        this.selectedTool = tool;
        // Update cursor based on selected tool
        if (tool === "hand") {
            this.canvas.style.cursor = 'grab';
        } else {
            this.canvas.style.cursor = 'default';
        }
        // Notify toolbar about tool change
        if (this.onToolChange) {
            this.onToolChange(tool);
        }
        this.redrawCanvas();

    }

    public zoomIn() {
        // 1. Găsim centrul canvas-ului
        const centerX = this.canvas.width / 2;    // jumătatea lățimii canvas-ului
        const centerY = this.canvas.height / 2;   // jumătatea înălțimii canvas-ului

        // 2. Convertim centrul în coordonate canvas (ținând cont de zoom și offset)
        const canvasX = (centerX - this.offsetX) / this.zoom;
        const canvasY = (centerY - this.offsetY) / this.zoom;

        // 3. Mărim zoom-ul
        this.zoom = Math.min(this.zoom * 1.1, 5);

        // 4. Recalculăm offset-ul pentru a păstra centrul fix
        this.offsetX = centerX - canvasX * this.zoom;
        this.offsetY = centerY - canvasY * this.zoom;

        // 5. Redesenăm canvas-ul
        this.redrawCanvas();
    }

    public zoomOut() {
        // 1. Găsim centrul canvas-ului
        const centerX = this.canvas.width / 2;    // ex: 1000/2 = 500
        const centerY = this.canvas.height / 2;   // ex: 800/2 = 400

        // 2. Convertim centrul în coordonate canvas
        const canvasX = (centerX - this.offsetX) / this.zoom;
        const canvasY = (centerY - this.offsetY) / this.zoom;

        // 3. Micșorăm zoom-ul
        this.zoom = Math.max(this.zoom / 1.1, 0.2);

        // 4. Recalculăm offset-ul
        this.offsetX = centerX - canvasX * this.zoom;
        this.offsetY = centerY - canvasY * this.zoom;

        // 5. Redesenăm canvas-ul
        this.redrawCanvas();
    }

    public resetZoom() {
        this.zoom = 1;
        this.offsetX = 0;
        this.offsetY = 0;
        this.redrawCanvas();
    }

    private addToHistory() {
        // Salvezi starea curentă (toate formele)
        this.undoStack.push([...this.shapeManager.getShapes()]);
        // Golești redo stack când se face o acțiune nouă
        this.redoStack = [];
    }

    public undo() {
        if (this.undoStack.length > 0) {
            // Salvezi starea curentă în redo stack
            this.redoStack.push([...this.shapeManager.getShapes()]);
            // Aplici starea anterioară
            const previousState = this.undoStack.pop()!;
            this.shapeManager.setShapes(previousState);
            this.redrawCanvas();
        }
    }

    public redo() {
        if (this.redoStack.length > 0) {
            // Salvezi starea curentă în undo stack
            this.undoStack.push([...this.shapeManager.getShapes()]);
            // Aplici starea următoare
            const nextState = this.redoStack.pop()!;
            this.shapeManager.setShapes(nextState);
            this.redrawCanvas();
        }
    }


    private wheelHandler = (e: WheelEvent) => {
        e.preventDefault();
        const rect = this.canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        // Convert mouse position to canvas coordinates
        const canvasX = (mouseX - this.offsetX) / this.zoom;
        const canvasY = (mouseY - this.offsetY) / this.zoom;

        const delta = e.deltaY;
        const zoomFactor = delta < 0 ? 1.1 : 1 / 1.1;
        const newZoom = Math.min(Math.max(this.zoom * zoomFactor, 0.2), 5);

        // Calculate new offset to keep the mouse position fixed
        this.offsetX = mouseX - canvasX * newZoom;
        this.offsetY = mouseY - canvasY * newZoom;
        this.zoom = newZoom;

        this.redrawCanvas();
    };

    private mouseDownHandler = (e: MouseEvent) => {
        // Deselectăm forma când facem click în altă parte
        if (this.selectedShape && this.selectedTool === "select") {
            const rect = this.canvas.getBoundingClientRect();
            const x = (e.clientX - rect.left - this.offsetX) / this.zoom;
            const y = (e.clientY - rect.top - this.offsetY) / this.zoom;

            // Verificăm dacă am dat click pe forma selectată
            if (!this.selectedShape.containsPoint(x, y)) {
                this.selectedShape.isSelected = false;
                this.selectedShape = null;
                this.redrawCanvas();
            }
        }

        // Start panning on right click, space + left click, or hand tool
        if ((e.button === 0 && (this.isSpacePressed || this.selectedTool === "hand"))) {
            this.isPanning = true;
            this.lastPanX = e.clientX;
            this.lastPanY = e.clientY;
            this.canvas.style.cursor = 'grabbing';
            return;
        }

        if (this.selectedTool === "select") {
            const rect = this.canvas.getBoundingClientRect();
            const x = (e.clientX - rect.left - this.offsetX) / this.zoom;
            const y = (e.clientY - rect.top - this.offsetY) / this.zoom;

            // Verificăm dacă am dat click pe un handle
            if (this.selectedShape) {
                const handles = this.selectedShape.getHandles();
                const handleIndex = handles.findIndex(handle =>
                    Math.abs(handle.x - x) < 5 && Math.abs(handle.y - y) < 5
                );

                if (handleIndex !== -1) {
                    this.isDragging = true;
                    this.dragStartX = x;
                    this.dragStartY = y;
                    this.selectedHandleIndex = handleIndex;
                    return;
                }
            }

            // Verificăm dacă am dat click pe o formă
            const clickedShape = this.shapeManager.getShapes().find(shape =>
                shape.containsPoint(x, y)
            );

            // Deselectăm forma anterioară
            if (this.selectedShape) {
                this.selectedShape.isSelected = false;
            }

            // Selectăm noua formă
            if (clickedShape) {
                clickedShape.isSelected = true;
                this.selectedShape = clickedShape;
                this.isDragging = true;
                this.dragStartX = x;
                this.dragStartY = y;
                this.selectedHandleIndex = -1; // Nu e handle
            } else {
                this.selectedShape = null;
            }

            this.redrawCanvas();
            return;
        }

        if (this.selectedTool === "line") {
            const rect = this.canvas.getBoundingClientRect();
            const x = (e.clientX - rect.left - this.offsetX) / this.zoom;
            const y = (e.clientY - rect.top - this.offsetY) / this.zoom;

            if (!this.currentPolyline) {
                // Începem o nouă linie
                this.currentPolyline = new Line(x, y);
            } else {
                // Adăugăm un nou punct
                this.currentPolyline.addPoint(x, y);
            }
            return;
        }

        // Normal drawing behavior
        this.clicked = true;
        const rect = this.canvas.getBoundingClientRect();
        this.startX = (e.clientX - rect.left - this.offsetX) / this.zoom;
        this.startY = (e.clientY - rect.top - this.offsetY) / this.zoom;
    };

    private mouseUpHandler = (e: MouseEvent) => {
        if (this.isDragging) {
            this.isDragging = false;
            // Salvăm starea pentru undo/redo
            this.addToHistory();
            return;
        }
        if (this.isPanning) {
            this.isPanning = false;
            this.canvas.style.cursor = 'default';
            return;
        }

        if (!this.clicked) return;

        this.clicked = false;
        const rect = this.canvas.getBoundingClientRect();
        const endX = (e.clientX - rect.left - this.offsetX) / this.zoom;
        const endY = (e.clientY - rect.top - this.offsetY) / this.zoom;
        const width = endX - this.startX;
        const height = endY - this.startY;

        let shape: IShape | null = null;

        if (this.selectedTool === "rect") {
            shape = new Rectangle(this.startX, this.startY, width, height);
        } else if (this.selectedTool === "circle") {
            const radius = Math.max(Math.abs(width), Math.abs(height)) / 2;
            const centerX = this.startX + (width < 0 ? -radius : radius);
            const centerY = this.startY + (height < 0 ? -radius : radius);
            shape = new Circle(centerX, centerY, radius);
        } else if (this.selectedTool === "pencil" && this.currentPencilPoints.length > 1) {
            shape = new Pencil([...this.currentPencilPoints]);
        } else if (this.selectedTool === "romb") {
            shape = new Rhombus(this.startX, this.startY, width, height);
        }
        this.currentPencilPoints = [];

        if (shape) {
            this.addToHistory();
            this.shapeManager.addShape(shape);
            this.socketService.sendShape(shape);
        }
    };

    private mouseMoveHandler = (e: MouseEvent) => {
        if (this.selectedTool === "select" && this.isDragging && this.selectedShape) {
            const rect = this.canvas.getBoundingClientRect();
            const x = (e.clientX - rect.left - this.offsetX) / this.zoom;
            const y = (e.clientY - rect.top - this.offsetY) / this.zoom;

            // Calculăm diferența
            const dx = x - this.dragStartX;
            const dy = y - this.dragStartY;

            if (this.selectedHandleIndex !== -1) {
                // Modificăm forma în funcție de handle-ul selectat
                if (this.selectedShape instanceof Rectangle) {
                    switch (this.selectedHandleIndex) {
                        case 0: // Top-left
                            this.selectedShape.x += dx;
                            this.selectedShape.y += dy;
                            this.selectedShape.width -= dx;
                            this.selectedShape.height -= dy;
                            break;
                        case 1: // Top-right
                            this.selectedShape.y += dy;
                            this.selectedShape.width += dx;
                            this.selectedShape.height -= dy;
                            break;
                        case 2: // Bottom-right
                            this.selectedShape.width += dx;
                            this.selectedShape.height += dy;
                            break;
                        case 3: // Bottom-left
                            this.selectedShape.x += dx;
                            this.selectedShape.width -= dx;
                            this.selectedShape.height += dy;
                            break;
                    }
                } else if (this.selectedShape instanceof Circle) {
                    if (this.selectedHandleIndex === 4) { // Center handle
                        this.selectedShape.centerX += dx;
                        this.selectedShape.centerY += dy;
                    } else {
                        // Calculăm raza bazată pe distanța de la centru la mouse
                        const dx = x - this.selectedShape.centerX;
                        const dy = y - this.selectedShape.centerY;
                        this.selectedShape.radius = Math.sqrt(dx * dx + dy * dy);
                    }
                } else if (this.selectedShape instanceof Rhombus) {
                    switch (this.selectedHandleIndex) {
                        case 0: // Top
                            this.selectedShape.height = Math.max(10, this.selectedShape.height - dy);
                            break;
                        case 1: // Right
                            this.selectedShape.width = Math.max(10, this.selectedShape.width + dx);
                            break;
                        case 2: // Bottom
                            this.selectedShape.height = Math.max(10, this.selectedShape.height + dy);
                            break;
                        case 3: // Left
                            this.selectedShape.width = Math.max(10, this.selectedShape.width - dx);
                            break;
                    }
                } else if (this.selectedShape instanceof Pencil || this.selectedShape instanceof Line) {
                    // Modificăm punctul individual
                    this.selectedShape.points[this.selectedHandleIndex].x = x;
                    this.selectedShape.points[this.selectedHandleIndex].y = y;
                }
            } else {
                // Mutăm forma în funcție de tipul ei
                if (this.selectedShape instanceof Rectangle) {
                    this.selectedShape.x += dx;
                    this.selectedShape.y += dy;
                } else if (this.selectedShape instanceof Circle) {
                    this.selectedShape.centerX += dx;
                    this.selectedShape.centerY += dy;
                } else if (this.selectedShape instanceof Line) {
                    this.selectedShape.points.forEach(point => {
                        point.x += dx;
                        point.y += dy;
                    });
                } else if (this.selectedShape instanceof Rhombus) {
                    this.selectedShape.x += dx;
                    this.selectedShape.y += dy;
                } else if (this.selectedShape instanceof Pencil) {
                    this.selectedShape.points.forEach(point => {
                        point.x += dx;
                        point.y += dy;
                    });
                }
            }

            this.dragStartX = x;
            this.dragStartY = y;
            this.redrawCanvas();
            return;
        }
        if (this.selectedTool === "line" && this.currentPolyline) {
            const rect = this.canvas.getBoundingClientRect();
            const x = (e.clientX - rect.left - this.offsetX) / this.zoom;
            const y = (e.clientY - rect.top - this.offsetY) / this.zoom;

            // Desenăm preview-ul
            this.redrawCanvas();
            const ctx = this.canvas.getContext("2d")!;
            ctx.save();
            ctx.translate(this.offsetX, this.offsetY);
            ctx.scale(this.zoom, this.zoom);

            // Desenăm linia curentă
            this.currentPolyline.draw(ctx);

            // Desenăm linia de la ultimul punct la mouse
            if (this.currentPolyline.points.length > 0) {
                const lastPoint = this.currentPolyline.points[this.currentPolyline.points.length - 1];
                ctx.beginPath();
                ctx.moveTo(lastPoint.x, lastPoint.y);
                ctx.lineTo(x, y);
                ctx.stroke();
            }

            ctx.restore();
            return;
        }
        if (this.isPanning) {
            const deltaX = e.clientX - this.lastPanX;
            const deltaY = e.clientY - this.lastPanY;
            this.offsetX += deltaX;
            this.offsetY += deltaY;
            this.lastPanX = e.clientX;
            this.lastPanY = e.clientY;
            this.redrawCanvas();
            return;
        }

        if (!this.clicked) return;

        const rect = this.canvas.getBoundingClientRect();
        const currX = (e.clientX - rect.left - this.offsetX) / this.zoom;
        const currY = (e.clientY - rect.top - this.offsetY) / this.zoom;
        const width = currX - this.startX;
        const height = currY - this.startY;

        this.redrawCanvas();
        const ctx = this.canvas.getContext("2d")!;
        ctx.save();
        ctx.translate(this.offsetX, this.offsetY);
        ctx.scale(this.zoom, this.zoom);
        ctx.strokeStyle = "white";

        if (this.selectedTool === "rect") {
            const previewRect = new Rectangle(
                this.startX,
                this.startY,
                width,
                height
            );
            previewRect.draw(ctx);
        } else if (this.selectedTool === "circle") {
            const radius = Math.max(Math.abs(width), Math.abs(height)) / 2;
            const centerX = this.startX + (width < 0 ? -radius : radius);
            const centerY = this.startY + (height < 0 ? -radius : radius);
            const previewCircle = new Circle(
                centerX,
                centerY,
                radius
            );
            previewCircle.draw(ctx);
        } else if (this.selectedTool === "pencil") {
            this.currentPencilPoints.push({ x: currX, y: currY });
            const previewLine = new Pencil(this.currentPencilPoints);
            previewLine.draw(ctx);
        } else if (this.selectedTool === "romb") {
            const previewRhombus = new Rhombus(this.startX, this.startY, width, height);
            previewRhombus.draw(ctx);
        }
        ctx.restore();
    };

    private initKeyboardHandlers() {
        window.addEventListener('keydown', (e) => {
            if (e.code === 'Space') {
                this.isSpacePressed = true;
                this.canvas.style.cursor = 'grab';
            }
            if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
                e.preventDefault();
                if (e.shiftKey) {
                    this.redo();
                } else {
                    this.undo();
                }
            }

            // Shortcuts pentru tool-uri
            switch (e.key) {
                case '1':
                    this.setTool('hand');
                    break;
                case '2':
                    this.setTool('select');
                    break;
                case '3':
                    this.setTool('rect');
                    break;
                case '4':
                    this.setTool('romb');
                    break;
                case '5':
                    this.setTool('circle');
                    break;
                case '6':
                    this.setTool('line');
                    break;
                case '7':
                    this.setTool('pencil');
                    break;
            }
        });

        window.addEventListener('keyup', (e) => {
            if (e.code === 'Space') {
                this.isSpacePressed = false;
                this.canvas.style.cursor = 'default';
            }
        });
    }

    private initMouseHandlers() {
        this.canvas.addEventListener("mousedown", this.mouseDownHandler);
        this.canvas.addEventListener("mouseup", this.mouseUpHandler);
        this.canvas.addEventListener("mousemove", this.mouseMoveHandler);
        this.canvas.addEventListener("wheel", this.wheelHandler);
    }

    destroy() {
        this.canvas.removeEventListener("mousedown", this.mouseDownHandler);
        this.canvas.removeEventListener("mouseup", this.mouseUpHandler);
        this.canvas.removeEventListener("mousemove", this.mouseMoveHandler);
        this.canvas.removeEventListener("wheel", this.wheelHandler);
        window.removeEventListener('keydown', this.initKeyboardHandlers);
        window.removeEventListener('keyup', this.initKeyboardHandlers);
    }
}