"use client"

import { useAuth } from "@repo/common/auth-context";
import { BACKEND_URL } from "@/app/config";
import { Button } from "@repo/ui/button";
import { Input } from "@repo/ui/input";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useRef } from "react";
import toast from "react-hot-toast";

export function AuthPage({ isSignIn }: { isSignIn: boolean }) {
    const usernameRef = useRef<HTMLInputElement>(null);
    const passwordRef = useRef<HTMLInputElement>(null);
    const nameRef = useRef<HTMLInputElement>(null);
    const router = useRouter();
    const { login } = useAuth();

    const handleSignIn = async () => {
        const username = usernameRef.current?.value;
        const password = passwordRef.current?.value;
        try {
            const response = await axios.post(`${BACKEND_URL}/api/v1/user/signin`,
                {
                    username,
                    password
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    withCredentials: true
                }
            );
            console.log(response.data);

            if (response) {
                const { token, userId, email, name } = response.data;
                login(token, {
                    id: userId,
                    email: email,
                    name: name
                });
                toast.success("Signed in successfully!");
                setTimeout(() => {
                    router.push("/");
                }, 100);
            }
        } catch (error) {
            console.error("Sign in failed:", error);
            toast.error("Sign in failed. Please try again.");
        }
    };

    const handleSignUp = async () => {
        const username = usernameRef.current?.value;
        const password = passwordRef.current?.value;
        const name = nameRef.current?.value;
        try {
            const response = await axios.post(`${BACKEND_URL}/api/v1/user/signup`,
                {
                    username,
                    password,
                    name
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    withCredentials: true
                }
            );

            if (response) {
                toast.success("Signed up successfully!");
                await router.push("/signin");
            }
        } catch (error) {
            console.error("Sign up failed:", error);
            toast.error("Sign up failed. Please try again.");
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 flex justify-center items-center p-4">
            <div className="w-full max-w-sm bg-slate-800 p-8 rounded-lg">
                <h1 className="text-2xl font-bold text-white mb-6 text-center">
                    {isSignIn ? "Sign In" : "Sign Up"}
                </h1>

                <div className="space-y-4 flex flex-col gap-4">
                    <Input
                        reference={usernameRef}
                        type="text"
                        placeholder="Email"
                        className="bg-slate-700 border-slate-600 text-white"

                    />

                    <Input
                        reference={passwordRef}
                        type="password"
                        placeholder="Password"
                        className="bg-slate-700 border-slate-600 text-white"
                    />

                    {!isSignIn && (
                        <Input
                            reference={nameRef}
                            type="text"
                            placeholder="Full Name"
                            className="bg-slate-700 border-slate-600 text-white"
                        />
                    )}
                </div>

                <div className="mt-6 flex justify-center">
                    <Button
                        variant="primary"
                        size="lg"
                        onClick={() => {
                            if (isSignIn) {
                                handleSignIn()
                            } else {
                                handleSignUp()
                            }
                        }}
                        className="w-32 bg-indigo-600 hover:bg-indigo-700"
                    >
                        {isSignIn ? "Sign In" : "Sign Up"}
                    </Button>
                </div>

                <p className="mt-4 text-center text-slate-400">
                    {isSignIn ? "Don't have an account? " : "Already have an account? "}
                    <button
                        onClick={() => router.push(isSignIn ? "/signup" : "/signin")}
                        className="text-indigo-400 hover:text-indigo-300"
                    >
                        {isSignIn ? "Sign Up" : "Sign In"}
                    </button>
                </p>
            </div>
        </div>
    );
}

