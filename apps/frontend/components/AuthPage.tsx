"use client"

import { Button } from "@repo/ui/button";
import { Input } from "@repo/ui/input";
import { PiSignIn } from "react-icons/pi";

export function AuthPage({ isSignIn }: { isSignIn: boolean }) {
    return (
        <div className="w-screen h-screen flex justify-center items-center">
            <div className="p-6 m-2 bg-white rounded text-black">
                <div className="p-2">
                    <Input type="text" placeholder="email" />
                </div>

                <div className="p-2">
                    <Input type="password" placeholder="password" />
                </div>

                <div className="flex justify-center mt-4">
                    {/* Icona înainte de textul butonului */}
                    <Button
                        variant="primary"
                        size="md"
                    >
                        {isSignIn ? "Sign In" : "Sign Up"}
                    </Button>
                </div>
            </div>
        </div>
    );
}
