import { ShapeManager } from "./managers/ShapeManager";
import { SocketService } from "./services/SocketService";
import { Circle } from "./shapes/Circle";
import { Rectangle } from "./shapes/Rectangle";
import { Tool } from "@/components/Canvas";
import { IShape } from "./shapes/IShape";
import { Pencil } from "./shapes/Pencil";

export class Game {
    private shapeManager = new ShapeManager();
    private socketService: SocketService;
    private selectedTool: Tool = "circle";
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

    constructor(
        private canvas: HTMLCanvasElement,
        private roomId: string,
        socket: WebSocket
    ) {
        const ctx = canvas.getContext("2d")!;
        this.socketService = new SocketService(socket, roomId);
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
        ctx.save();                                                   // Salvăm starea curentă
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);  // Ștergem tot

        // Apply zoom and pan transformations
        ctx.translate(this.offsetX, this.offsetY);                  // 1. Mai întâi mutăm (pan)
        ctx.scale(this.zoom, this.zoom);                            // 2. Apoi mărim/micșorăm (zoom)

        this.shapeManager.clearAndDraw(ctx, this.canvas.width / this.zoom, this.canvas.height / this.zoom);
        ctx.restore();
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

    setTool(tool: Tool) {
        this.selectedTool = tool;
        // Update cursor based on selected tool
        if (tool === "hand") {
            this.canvas.style.cursor = 'grab';
        } else {
            this.canvas.style.cursor = 'default';
        }
    }

    private mouseDownHandler = (e: MouseEvent) => {
        // Start panning on right click, space + left click, or hand tool
        if (e.button === 2 || (e.button === 0 && (this.isSpacePressed || this.selectedTool === "hand"))) {
            this.isPanning = true;
            this.lastPanX = e.clientX;
            this.lastPanY = e.clientY;
            this.canvas.style.cursor = 'grabbing';
            return;
        }

        // Normal drawing behavior
        this.clicked = true;
        const rect = this.canvas.getBoundingClientRect();
        this.startX = (e.clientX - rect.left - this.offsetX) / this.zoom;
        this.startY = (e.clientY - rect.top - this.offsetY) / this.zoom;
    };

    private mouseUpHandler = (e: MouseEvent) => {
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
            const radius = Math.max(width, height) / 2;
            shape = new Circle(this.startX + radius, this.startY + radius, radius);
        } else if (this.selectedTool === "pencil" && this.currentPencilPoints.length > 1) {
            shape = new Pencil([...this.currentPencilPoints]);
        }
        this.currentPencilPoints = [];

        if (shape) {
            this.shapeManager.addShape(shape);
            this.socketService.sendShape(shape);
        }
    };

    private mouseMoveHandler = (e: MouseEvent) => {
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
            const radius = Math.max(width, height) / 2;
            const previewCircle = new Circle(
                this.startX + radius,
                this.startY + radius,
                radius
            );
            previewCircle.draw(ctx);
        } else if (this.selectedTool === "pencil") {
            this.currentPencilPoints.push({ x: currX, y: currY });
            const previewLine = new Pencil(this.currentPencilPoints);
            previewLine.draw(ctx);
        }
        ctx.restore();
    };

    private initKeyboardHandlers() {
        window.addEventListener('keydown', (e) => {
            if (e.code === 'Space') {
                this.isSpacePressed = true;
                this.canvas.style.cursor = 'grab';
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
        // Prevent context menu on right click
        this.canvas.addEventListener("contextmenu", (e) => e.preventDefault());
    }

    destroy() {
        this.canvas.removeEventListener("mousedown", this.mouseDownHandler);
        this.canvas.removeEventListener("mouseup", this.mouseUpHandler);
        this.canvas.removeEventListener("mousemove", this.mouseMoveHandler);
        this.canvas.removeEventListener("wheel", this.wheelHandler);
        this.canvas.removeEventListener("contextmenu", (e) => e.preventDefault());
        window.removeEventListener('keydown', this.initKeyboardHandlers);
        window.removeEventListener('keyup', this.initKeyboardHandlers);
    }
}