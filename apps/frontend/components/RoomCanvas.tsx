// Creates a Socket Connection to our WS-server, and after the connection is made it render the  Canvas component

"use client"

import { WS_URL } from "@/app/config";
import { useEffect, useRef, useState } from "react"
import { Canvas } from "./Canvas";
import { useRouter } from "next/navigation";

export function RoomCanvas({ roomId }: { roomId: string }) {
    const [socket, setSocket] = useState<WebSocket | null>(null);
    const router = useRouter();

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            console.error("No token found in localStorage");
            router.push("/signin");
            return;
        }

        const ws = new WebSocket(`${WS_URL}?token=${token}`);

        ws.onopen = () => {
            setSocket(ws);

            ws.send(JSON.stringify({
                type: "join_room",
                roomId
            }));
        };

        return () => {
            if (ws.readyState === WebSocket.OPEN) {
                ws.close();
            }
        };
    }, [roomId]);

    if (!socket) {
        return <div>
            Connecting to server...
        </div>
    }
    return <div>
        <Canvas roomId={roomId} socket={socket} />
    </div>
}