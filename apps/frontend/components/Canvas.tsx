import { useEffect, useRef, useState } from "react";
import { Game } from "@/draw/Game";
import { TopBar } from "./TopBar";

export type Tool = "circle" | "rect" | "pencil" | "hand" | "romb" | "line" | "select"

export function Canvas({
    roomId,
    socket
}: {
    roomId: string,
    socket: WebSocket
}) {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const [game, setGame] = useState<Game>()
    const [selectedTool, setSelectedTool] = useState<Tool>("hand")

    useEffect(() => {
        const handleResize = () => {
            if (canvasRef.current) {
                canvasRef.current.width = window.innerWidth
                canvasRef.current.height = window.innerHeight
                game?.redrawCanvas()
            }
        }

        window.addEventListener('resize', handleResize)

        return () => {
            window.removeEventListener('resize', handleResize)
        }
    }, [game])

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            switch (e.key) {
                case '1':
                    setSelectedTool('hand');
                    break;
                case '2':
                    setSelectedTool('select');
                    break;
                case '3':
                    setSelectedTool('rect');
                    break;
                case '4':
                    setSelectedTool('romb');
                    break;
                case '5':
                    setSelectedTool('circle');
                    break;
                case '6':
                    setSelectedTool('line');
                    break;
                case '7':
                    setSelectedTool('pencil');
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, []);

    useEffect(() => {
        game?.setTool(selectedTool)
    }, [selectedTool, game])

    useEffect(() => {
        if (canvasRef.current) {
            const g = new Game(canvasRef.current, roomId, socket)
            setGame(g)

            return (() => {
                g.destroy()
            })
        }
    }, [canvasRef])

    return (
        <div className="h-screen overflow-hidden bg-black">
            <TopBar
                selectedTool={selectedTool}
                setSelectedTool={setSelectedTool}
                game={game}
            />
            <canvas
                ref={canvasRef}
                width={window.innerWidth}
                height={window.innerHeight}
                className="absolute top-0 left-0 w-full h-full"
            ></canvas>
        </div>
    )
}

