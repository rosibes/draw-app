import { IShape } from "../shapes/IShape";
import { Circle } from "../shapes/Circle";
import { Rectangle } from "../shapes/Rectangle";
import { Pencil } from "../shapes/Pencil";

export class SocketService {
    constructor(private socket: WebSocket, private roomId: string) { }

    sendShape(shape: IShape) {
        this.socket.send(JSON.stringify({       //aici trimitem catre serverul din be, apoi serverul din be da broadcast la mesaj mai departe
            type: "chat",
            message: shape.serialize(),
            roomId: this.roomId
        }));
    }

    onShapeReceived(callback: (shape: IShape) => void) {
        // Când serverul trimite un mesaj (broadcast), îl primesc aici
        this.socket.onmessage = (event) => {                 // asta e primit din serverul din be, adica de broadcastul facut de el
            const message = JSON.parse(event.data);
            if (message.type === "chat") {
                const shapeData = JSON.parse(message.message);
                let shape: IShape | undefined;

                if (shapeData.type === "circle") {
                    shape = new Circle(shapeData.centerX, shapeData.centerY, Math.abs(shapeData.radius));
                } else if (shapeData.type === "rect") {
                    shape = new Rectangle(shapeData.x, shapeData.y, shapeData.width, shapeData.height);
                } else if (shapeData.type === "pencil") {
                    shape = new Pencil(shapeData.points)
                }

                if (shape) {
                    callback(shape);
                }
            }
        };
    }
}