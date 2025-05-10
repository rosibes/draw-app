// Renders the canvas

import { initDraw } from "@/draw";
import { useEffect, useRef, useState } from "react";
import { IconButton } from "./IconButton";
import { PiPencil } from "react-icons/pi";
import { BiCircle, BiRectangle } from "react-icons/bi";
import { Game } from "@/draw/Game";

export type Tool = "circle" | "rect" | "pencil"

export function Canvas({
    roomId,
    socket
}: {
    roomId: string,
    socket: WebSocket
}) {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const [game, setGame] = useState<Game>()
    const [selectedTool, setSelectedTool] = useState<Tool>("circle");

    useEffect(() => {
        game?.setTool(selectedTool)
    }, [selectedTool, game])

    useEffect(() => {
        if (canvasRef.current) {
            const g = new Game(canvasRef.current, roomId, socket)
            setGame(g);

            return (() => {
                g.destroy()
            })
        }
    }, [canvasRef])

    return <div className="h-screen bg-red-200 overflow-hidden">
        <TopBar selectedTool={selectedTool} setSelectedTool={setSelectedTool} />
        <canvas ref={canvasRef} width={window.innerWidth} height={window.innerHeight}></canvas>
    </div>
}

function TopBar({ selectedTool, setSelectedTool }: {
    selectedTool: Tool,
    setSelectedTool: (s: Tool) => void
}) {
    return <div className="fixed top-10 left-10 ">
        <div className="flex gap-2">
            <IconButton
                activated={selectedTool === "pencil"}
                icon={<PiPencil />}
                onClick={() => { setSelectedTool("pencil") }} />
            <IconButton
                activated={selectedTool === "rect"}
                icon={<BiRectangle />}
                onClick={() => { setSelectedTool("rect") }} />
            <IconButton
                activated={selectedTool === "circle"}
                icon={<BiCircle />}
                onClick={() => { setSelectedTool("circle") }} />
        </div>
    </div>
}