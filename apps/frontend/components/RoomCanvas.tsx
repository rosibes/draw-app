// Creates a Socket Connection to our WS-server, and after the connection is made it render the  Canvas component

"use client"

import { WS_URL } from "@/app/config";
import { useEffect, useRef, useState } from "react"
import { Canvas } from "./Canvas";

export function RoomCanvas({ roomId }: { roomId: string }) {
    const [socket, setSocket] = useState<WebSocket | null>(null);

    useEffect(() => {
        const ws = new WebSocket(`${WS_URL}?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJiMWQ3YjJkZi1jNDMyLTQzMzUtODY2OS1mN2ZiMzAzMDEyZjEiLCJpYXQiOjE3NDcwNDQ1MjUsImV4cCI6MTc0NzA0ODEyNX0.A-0dre7U7ZQy-Sz4Aw5BW4EHmUOt_lrdjGlSoyFPcMs`)

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