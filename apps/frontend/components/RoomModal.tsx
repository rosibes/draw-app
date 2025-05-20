"use client"

import { Button } from "@repo/ui/button"
import { FiUsers, FiPlus } from "react-icons/fi"
import { useRouter } from "next/navigation"
import { useRef, useState } from "react"
import axios from "axios"
import { BACKEND_URL } from "@/app/config"
import { useAuth } from "@repo/common/auth-context"

interface RoomModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function RoomModal({ isOpen, onClose }: RoomModalProps) {
    const router = useRouter();
    const { isAuthenticated, checkAuth } = useAuth();
    const [showJoinInput, setShowJoinInput] = useState(false);
    const [showCreateInput, setShowCreateInput] = useState(false);
    const [roomCode, setRoomCode] = useState("");
    const [roomName, setRoomName] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    if (!isOpen) return null;

    const handleAuthCheck = async () => {
        const isStillAuthenticated = await checkAuth();
        if (!isStillAuthenticated) {
            router.push('/signin');
            return false;
        }
        return true;
    };

    const handleJoinRoom = async () => {
        if (!roomCode.trim()) {
            setError("Please enter a room code");
            return;
        }

        if (!await handleAuthCheck()) return;

        try {
            setIsLoading(true);
            setError("");
            const response = await axios.get(`${BACKEND_URL}/api/v1/chat/chats/${roomCode}`);
            if (response.data) {
                router.push(`/canvas/${roomCode}`);
            }
        } catch (err) {
            if (axios.isAxiosError(err) && err.response?.status === 401) {
                router.push('/signin');
            } else {
                setError("Room not found");
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateRoom = async () => {
        if (!roomName.trim()) {
            setError("Please enter a room name");
            return;
        }

        if (!await handleAuthCheck()) return;

        try {
            setIsLoading(true);
            setError("");
            const token = localStorage.getItem("token");
            const response = await axios.post(`${BACKEND_URL}/api/v1/chat/room`,
                { name: roomName },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
            if (response.data?.roomId) {
                router.push(`/canvas/${response.data.roomId}`);
            }
        } catch (err) {
            if (axios.isAxiosError(err) && err.response?.status === 401) {
                router.push('/signin');
            } else {
                setError("Failed to create room");
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-slate-800 p-8 rounded-2xl w-full max-w-md border border-slate-700">
                <h2 className="text-2xl font-bold text-white mb-6 text-center">Choose an Option</h2>

                {error && (
                    <div className="mb-4 p-3 bg-red-500/20 border border-red-500 rounded-lg text-red-400 text-sm text-center">
                        {error}
                    </div>
                )}

                <div className="space-y-4">
                    {!showCreateInput ? (
                        <Button
                            children="Create New Room"
                            size="lg"
                            variant="primary"
                            startIcon={<FiPlus size={20} />}
                            onClick={() => setShowCreateInput(true)}
                            className="w-full bg-indigo-500 hover:bg-indigo-600 text-white"
                        />
                    ) : (
                        <div className="space-y-4">
                            <div className="relative">
                                <input
                                    type="text"
                                    value={roomName}
                                    onChange={(e) => setRoomName(e.target.value)}
                                    placeholder="Enter room name"
                                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-indigo-500"
                                />
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    children={isLoading ? "Creating..." : "Create"}
                                    size="lg"
                                    variant="primary"
                                    onClick={handleCreateRoom}
                                    className="flex-1 bg-indigo-500 hover:bg-indigo-600 text-white"
                                />
                                <Button
                                    children="Back"
                                    size="lg"
                                    variant="secondary"
                                    onClick={() => {
                                        setShowCreateInput(false);
                                        setRoomName("");
                                        setError("");
                                    }}
                                    className="flex-1 bg-slate-700 hover:bg-slate-600 text-white"
                                />
                            </div>
                        </div>
                    )}

                    {!showJoinInput ? (
                        <Button
                            children="Join Existing Room"
                            size="lg"
                            variant="secondary"
                            startIcon={<FiUsers size={20} />}
                            onClick={() => setShowJoinInput(true)}
                            className="w-full bg-slate-700 hover:bg-slate-600 text-white"
                        />
                    ) : (
                        <div className="space-y-4">
                            <div className="relative">
                                <input
                                    type="text"
                                    value={roomCode}
                                    onChange={(e) => setRoomCode(e.target.value)}
                                    placeholder="Enter room code"
                                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-indigo-500"
                                />
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    children={isLoading ? "Joining..." : "Join"}
                                    size="lg"
                                    variant="primary"
                                    onClick={handleJoinRoom}
                                    className="flex-1 bg-indigo-500 hover:bg-indigo-600 text-white"
                                />
                                <Button
                                    children="Back"
                                    size="lg"
                                    variant="secondary"
                                    onClick={() => {
                                        setShowJoinInput(false);
                                        setRoomCode("");
                                        setError("");
                                    }}
                                    className="flex-1 bg-slate-700 hover:bg-slate-600 text-white"
                                />
                            </div>
                        </div>
                    )}
                </div>

                <button
                    onClick={onClose}
                    className="mt-6 text-gray-400 hover:text-white w-full text-center"
                >
                    Cancel
                </button>
            </div>
        </div>
    )
} 