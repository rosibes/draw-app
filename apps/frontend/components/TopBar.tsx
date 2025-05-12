import { IoMdAdd } from "react-icons/io"

import { IoMdRedo } from "react-icons/io"

import { IoMdRefresh, IoMdRemove } from "react-icons/io"

import { IoMdUndo } from "react-icons/io"
import { IconButton } from "./IconButton"
import { Tool } from "./Canvas"
import { IoHandRightOutline } from "react-icons/io5"
import { Game } from "@/draw/Game"
import { PiPencil } from "react-icons/pi"
import { CgShapeRhombus } from "react-icons/cg"
import { BiCircle, BiRectangle } from "react-icons/bi"
import { TbLine } from "react-icons/tb"
import { HiCursorClick } from "react-icons/hi"

export function TopBar({
    selectedTool,
    setSelectedTool,
    game
}: {
    selectedTool: Tool,
    setSelectedTool: (s: Tool) => void,
    game?: Game
}) {
    return (
        <div className="fixed top-7 left-1/2 -translate-x-1/2 z-10">
            <div className="flex gap-2">
                <div className="flex gap-2 bg-white/10 p-2 rounded-lg">
                    <IconButton
                        activated={selectedTool === "hand"}
                        icon={<IoHandRightOutline />}
                        onClick={() => { setSelectedTool("hand") }}
                        shortcut="1" />
                    <IconButton
                        activated={selectedTool === "select"}
                        icon={<HiCursorClick />}
                        onClick={() => { setSelectedTool("select") }}
                        shortcut="2" />
                    <IconButton
                        activated={selectedTool === "rect"}
                        icon={<BiRectangle />}
                        onClick={() => { setSelectedTool("rect") }}
                        shortcut="3" />
                    <IconButton
                        activated={selectedTool === "romb"}
                        icon={<CgShapeRhombus />}
                        onClick={() => { setSelectedTool("romb") }}
                        shortcut="4" />
                    <IconButton
                        activated={selectedTool === "circle"}
                        icon={<BiCircle />}
                        onClick={() => { setSelectedTool("circle") }}
                        shortcut="5" />
                    <IconButton
                        activated={selectedTool === "line"}
                        icon={<TbLine />}
                        onClick={() => { setSelectedTool("line") }}
                        shortcut="6" />
                    <IconButton
                        activated={selectedTool === "pencil"}
                        icon={<PiPencil />}
                        onClick={() => { setSelectedTool("pencil") }}
                        shortcut="7" />

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