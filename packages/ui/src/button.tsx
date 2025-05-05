// packages/ui/src/button.tsx
"use client";

import { ReactNode } from "react";

interface ButtonProps {
  variant: "primary" | "secondary";
  size: "sm" | "md" | "lg";
  children: ReactNode;
  className?: string;
  appName?: string;
  onClick?: () => void;
}

const variantStyle = {
  primary: "bg-purple-600 text-white",
  secondary: "bg-purple-100 text-purple-600",
};

const defaultStyles = "rounded-md flex cursor-pointer";

const sizeStyles = {
  sm: "py-2 px-3",
  md: "py-3 px-5",
  lg: "py-4 px-7",
};

export const Button = ({
  children,
  className = "",
  onClick,
  variant,
  size,
}: ButtonProps) => {
  return (
    <button
      onClick={onClick}
      className={`${defaultStyles} ${variantStyle[variant]} ${sizeStyles[size]} ${className}`}
    >
      {children}
    </button>
  );
};
