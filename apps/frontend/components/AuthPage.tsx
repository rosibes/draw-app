"use client"

import { Button } from "@repo/ui/button"
import { Input } from "@repo/ui/input"

export function AuthPage({ isSignIn }: {
    isSignIn: boolean
}) {
    return <div className="w-screen h-screen flex justify-center items-center">
        <div className="p-6 m-2 bg-white rounded text-black">
            <div className="">
                <Input type="text" placeholder="email" />
            </div>

            <div className="">
                <Input type="password" placeholder="password" />

            </div>

            <div >
                <Button variant="primary" size="sm" children={isSignIn ? "Sign In" : "Sign Up"} />
            </div>
        </div>
    </div>
}