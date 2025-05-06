import React from 'react';
import { LogIn, UserPlus } from 'lucide-react';
import { Button } from './button';
import { PiSignInBold } from "react-icons/pi";
import { FiUserPlus } from "react-icons/fi";
import { HiOutlinePencilSquare } from "react-icons/hi2";



export function Header() {
    return (
        <div className="w-full bg-white border-b border-gray-200 shadow-sm">
            <div className="flex items-center justify-between px-16 py-4">
                {/* Logo și titlu */}
                <div className="flex items-center space-x-2">
                    <div className="flex items-center justify-center w-8 h-8 bg-gray-200 rounded">
                        <HiOutlinePencilSquare size={25} />

                    </div>
                    <h1 className="text-lg font-bold text-gray-800">ExcaliDraw</h1>
                </div>

                {/* Butoane autentificare */}
                <div className="flex items-center space-x-3">
                    <Button children="Sign in" size='sm' variant='secondary' startIcon={<PiSignInBold size={19} color='gray' />} />
                    <Button children="Sign Up" size='sm' variant='primary' startIcon={<FiUserPlus size={17} />} />
                </div>
            </div>
        </div>
    );
}