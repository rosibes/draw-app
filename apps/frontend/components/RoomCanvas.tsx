// Creates a Socket Connection to our WS-server, and after the connection is made it render the  Canvas component

"use client"

import { WS_URL } from "@/app/config";
import { useEffect, useRef, useState } from "react"
import { Canvas } from "./Canvas";

export function RoomCanvas({ roomId }: { roomId: string }) {
    const [socket, setSocket] = useState<WebSocket | null>(null);

    useEffect(() => {
        const ws = new WebSocket(`${WS_URL}?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJiMWQ3YjJkZi1jNDMyLTQzMzUtODY2OS1mN2ZiMzAzMDEyZjEiLCJpYXQiOjE3NDY4NjYwMTIsImV4cCI6MTc0Njg2OTYxMn0.Hk1Ca4vo8CcFz6QurRy8VYH5Gbb5VK_Nzk3MHIswass`)

        ws.onopen = () => {
            setSocket(ws)

            ws.send(JSON.stringify({
                type: "join_room",
                roomId
            }))
        }
    }, [])

    if (!socket) {
        return <div>
            Connecting to server...
        </div>
    }
    return <div>
        <Canvas roomId={roomId} socket={socket} />

    </div>
}