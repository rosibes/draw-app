import { BACKEND_URL } from "@/app/config";
import axios from "axios";

type Shape = {
    type: "rect",
    x: number,
    y: number,
    width: number,
    height: number
} | {
    type: "circle",
    centerX: number,
    centerY: number,
    radius: number

}

export async function initDraw(canvas: HTMLCanvasElement, roomId: string, socket: WebSocket) {
    const ctx = canvas.getContext("2d");

    let existingShapes: Shape[] = await getExistingShapes(roomId);

    console.log(existingShapes)

    if (!ctx) {
        return;
    }

    socket.onmessage = (event) => {
        const message = JSON.parse(event.data)

        if (message.type == "chat") {
            const parsedShape = JSON.parse(message.message);
            existingShapes.push(parsedShape);
            clearCanvas(existingShapes, canvas, ctx)
        }
    }
    clearCanvas(existingShapes, canvas, ctx)

    let clicked = false;
    let startX = 0;
    let startY = 0;

    canvas.addEventListener("mousedown", (e) => {
        clicked = true;
        const rect = canvas.getBoundingClientRect();
        startX = e.clientX - rect.left;
        startY = e.clientY - rect.top;
    });



    canvas.addEventListener("mouseup", (e) => {
        clicked = false;
        const rect = canvas.getBoundingClientRect();
        const endX = e.clientX - rect.left;
        const endY = e.clientY - rect.top;

        const width = endX - startX;
        const height = endY - startY;

        const shape: Shape = {
            type: "rect",
            x: startX,
            y: startY,
            width,
            height,
        }
        existingShapes.push(shape);

        socket.send(JSON.stringify({
            type: "chat",
            message: JSON.stringify(shape),
            roomId
        }))
    });


    canvas.addEventListener("mousemove", (e) => {
        if (clicked) {
            const rect = canvas.getBoundingClientRect();
            const currX = e.clientX - rect.left;
            const currY = e.clientY - rect.top;

            const width = currX - startX;
            const height = currY - startY;

            clearCanvas(existingShapes, canvas, ctx);
            ctx.strokeStyle = "white";
            ctx.strokeRect(startX, startY, width, height);
        }
    });

}

function clearCanvas(existingShapes: Shape[], canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "rgba(0,0,0)"
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    existingShapes.map((shape) => {
        if (shape.type === "rect") {
            ctx.strokeStyle = "rgba(255,255,255)"
            ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);
        }
    })
}

async function getExistingShapes(roomId: string) {
    const response = await axios.get(`${BACKEND_URL}/chats/${roomId}`);
    const messages = response.data.messages;

    const shapes = messages.map((x: { message: string }) => {
        const messageData = JSON.parse(x.message)           //in DB 'message' e de tipul String si acum il facem in JSON
        return messageData
    })
    return shapes
}