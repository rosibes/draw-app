"use client"

import { Button } from "@repo/ui/button";
import { PiSignInBold } from "react-icons/pi";
import { FiUserPlus } from "react-icons/fi";
import { HiOutlinePencilSquare } from "react-icons/hi2";
import { useAuth } from "@repo/common/auth-context";
import { useRouter } from "next/navigation";
import { BiUser } from "react-icons/bi";

export function Header() {
    const { isAuthenticated, user, logout, isLoading } = useAuth();
    const router = useRouter();

    return (
        <div className="w-full bg-slate-800/50 border-b border-slate-700 backdrop-blur-sm">
            <div className="flex items-center justify-between px-16 py-4">
                {/* Logo și titlu */}
                <div className="flex items-center space-x-2">
                    <div className="flex items-center justify-center w-8 h-8 bg-indigo-500/20 rounded">
                        <BiUser size={25} className="text-indigo-400" />
                    </div>
                    <span className="text-gray-300">Welcome {user?.name}</span>
                </div>

                {/* Butoane autentificare */}
                <div className="flex items-center space-x-3">
                    {isLoading ? (
                        <div className="w-24 h-8 bg-slate-700 animate-pulse rounded" />
                    ) : isAuthenticated ? (
                        <>
                            <Button
                                children="Logout"
                                size='sm'
                                variant='secondary'
                                onClick={logout}
                                className="bg-slate-700 hover:bg-slate-600 text-white"
                            />
                        </>
                    ) : (
                        <>
                            <Button
                                children="Sign in"
                                size='sm'
                                variant='secondary'
                                startIcon={<PiSignInBold size={19} className="text-gray-300" />}
                                onClick={() => router.push('/signin')}
                                className="bg-slate-700 hover:bg-slate-600 text-white"
                            />
                            <Button
                                children="Sign Up"
                                size='sm'
                                variant='primary'
                                startIcon={<FiUserPlus size={17} />}
                                onClick={() => router.push('/signup')}
                                className="bg-indigo-500 hover:bg-indigo-600 text-white"
                            />
                        </>
                    )}
                </div>
            </div>
        </div>
    );
} 