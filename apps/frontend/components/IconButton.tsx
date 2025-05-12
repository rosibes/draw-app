import { ReactNode } from "react";

export function IconButton({
    icon, onClick, activated, shortcut
}: {
    icon: ReactNode,
    onClick: () => void,
    activated: boolean,
    shortcut?: string

}) {
    return <div className="relative">
        <div className={`pointer rounded-full border p-2 bg-black hover:bg-gray-700 ${activated ? "text-red-400" : "text-white"}`} onClick={onClick} >
            {icon}
            {shortcut && (
                <div className="absolute -bottom-1 -right-1 text-xs bg-gray-800 text-white rounded-full w-4 h-4 flex items-center justify-center">
                    {shortcut}
                </div>
            )}
        </div >
    </div>
}