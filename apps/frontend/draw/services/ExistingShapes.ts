import { BACKEND_URL } from "@/app/config";
import axios from "axios";

export async function getExistingShapes(roomId: string) {
    const response = await axios.get(`${BACKEND_URL}/chats/${roomId}`);
    const messages = response.data.messages;

    const shapes = messages.map((x: { message: string }) => {
        const messageData = JSON.parse(x.message)           //in DB 'message' e de tipul String si acum il facem in JSON
        return messageData
    })
    return shapes
}