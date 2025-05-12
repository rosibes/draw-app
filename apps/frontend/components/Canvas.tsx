import { useEffect, useRef, useState } from "react";
import { IconButton } from "./IconButton";
import { PiPencil } from "react-icons/pi";
import { BiCircle, BiRectangle } from "react-icons/bi";
import { Game } from "@/draw/Game";
import { IoMdAdd, IoMdRemove, IoMdRefresh, IoMdRedo, IoMdUndo } from "react-icons/io";
import { IoHandRightOutline } from "react-icons/io5";
import { CgShapeRhombus } from "react-icons/cg";

export type Tool = "circle" | "rect" | "pencil" | "hand" | "romb"

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

function TopBar({
    selectedTool,
    setSelectedTool,
    game
}: {
    selectedTool: Tool,
    setSelectedTool: (s: Tool) => void,
    game?: Game
}) {
    return (
        <div className="fixed top-10 left-10 z-10">
            <div className="flex gap-2">
                <div className="flex gap-2 bg-white/10 p-2 rounded-lg">
                    <IconButton
                        activated={selectedTool === "hand"}
                        icon={<IoHandRightOutline />}
                        onClick={() => { setSelectedTool("hand") }} />
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
                    <IconButton
                        activated={selectedTool === "romb"}
                        icon={<CgShapeRhombus />}
                        onClick={() => { setSelectedTool("romb") }} />
                </div>
                <div className="flex gap-2 bg-white/10 p-2 rounded-lg">
                    <IconButton
                        activated={false}
                        icon={<IoMdAdd />}
                        onClick={() => { game?.zoomIn() }} />
                    <IconButton
                        activated={false}
                        icon={<IoMdRemove />}
                        onClick={() => { game?.zoomOut() }} />
                    <IconButton
                        activated={false}
                        icon={<IoMdRefresh />}
                        onClick={() => { game?.resetZoom() }} />
                </div>
                <div className="flex gap-2 bg-white/10 p-2 rounded-lg">
                    <IconButton
                        activated={false}
                        icon={<IoMdUndo />}
                        onClick={() => { game?.undo() }} />
                    <IconButton
                        activated={false}
                        icon={<IoMdRedo />}
                        onClick={() => { game?.redo() }} />
                </div>
            </div>
        </div>
    )
}