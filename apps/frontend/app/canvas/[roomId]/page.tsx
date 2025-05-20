//  It extracts the roomId from the url params and renders a RoomCanvas

import { RoomCanvas } from "@/components/RoomCanvas";
export default async function CanvasPage({ params }: {
    params: {
        roomId: string
    }
}) {
    const roomId = (await params).roomId

    return <RoomCanvas roomId={roomId} />
}