import { BACKEND_URL } from "@/app/config";
import axios from "axios";
import { start } from "repl";

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
} | {
    type: "pencil",
    startX: number,
    startY: number,
    endX: number,
    endY: number
}

export async function initDraw(canvas: HTMLCanvasElement, roomId: string, socket: WebSocket) {
    const ctx = canvas.getContext("2d");

    let existingShapes: Shape[] = await getExistingShapes(roomId);

    console.log(existingShapes)

    if (!ctx) {
        return;
    }


    let clicked = false;
    let startX = 0;
    let startY = 0;

    // Când apeși mouse-ul, salvezi punctul de start
    canvas.addEventListener("mousedown", (e) => {
        clicked = true;
        const rect = canvas.getBoundingClientRect();
        startX = e.clientX - rect.left;
        startY = e.clientY - rect.top;
    });

    // Când dai drumul la mouse, finalizezi forma și o trimiți prin WebSocket
    canvas.addEventListener("mouseup", (e) => {
        clicked = false;
        const rect = canvas.getBoundingClientRect();
        const endX = e.clientX - rect.left;
        const endY = e.clientY - rect.top;
        const width = endX - startX;
        const height = endY - startY;

        //@ts-ignore
        const selectedTool = window.selectedTool;
        let shape: Shape | null = null;
        if (selectedTool === "rect") {
            shape = {
                //@ts-ignore
                type: "rect",
                x: startX,
                y: startY,
                width,
                height,
            }
        } else if (selectedTool === "circle") {
            const radius = Math.max(width, height) / 2;
            shape = {
                type: "circle",
                radius: radius,
                centerX: startX + radius,
                centerY: startY + radius
            }
        }

        if (!shape) {
            return
        }

        existingShapes.push(shape);

        socket.send(JSON.stringify({            //aici trimitem catre serverul din be, apoi serverul din be da broadcast la mesaj mai departe
            type: "chat",
            message: JSON.stringify(shape),
            roomId
        }))


    });

    // Cât timp mouse-ul e apăsat, arăt preview-ul formei
    canvas.addEventListener("mousemove", (e) => {
        if (clicked) {
            const rect = canvas.getBoundingClientRect();
            const currX = e.clientX - rect.left;
            const currY = e.clientY - rect.top;

            const width = currX - startX;
            const height = currY - startY;

            clearCanvas(existingShapes, canvas, ctx);
            ctx.strokeStyle = "white";
            //@ts-ignore
            const selectedTool = window.selectedTool;
            if (selectedTool === "rect") {
                ctx.strokeRect(startX, startY, width, height);
            } else if (selectedTool === "circle") {
                const radius = Math.max(width, height) / 2;
                const centerX = startX + radius;
                const centerY = startY + radius;
                ctx.beginPath();
                ctx.arc(centerX, centerY, radius, 0, Math.PI * 2)
                ctx.stroke()
                ctx.closePath()

            }
        }
    });

    // Când serverul trimite un mesaj (broadcast), îl primesc aici
    socket.onmessage = (event) => {             // asta e primit din serverul din be, adica de broadcastul facut de el
        const message = JSON.parse(event.data)

        if (message.type == "chat") {
            const parsedShape = JSON.parse(message.message);
            existingShapes.push(parsedShape);
            clearCanvas(existingShapes, canvas, ctx)
        }
    }
    clearCanvas(existingShapes, canvas, ctx)

}

// Stergem formele existente si le rerandam iar, cu cele noi
function clearCanvas(existingShapes: Shape[], canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "rgba(0,0,0)"
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    existingShapes.map((shape) => {
        if (shape.type === "rect") {
            ctx.strokeStyle = "rgba(255,255,255)"
            ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);
        } else if (shape.type === "circle") {
            ctx.strokeStyle = "rgba(255,255,255)"
            ctx.beginPath();
            ctx.arc(shape.centerX, shape.centerY, shape.radius, 0, Math.PI * 2);
            ctx.stroke();
        }
    });
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