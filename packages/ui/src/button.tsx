"use client";

import { ReactNode, ReactElement } from "react";

interface ButtonProps {
  variant: "primary" | "secondary";
  size: "sm" | "md" | "lg";
  children: ReactNode;
  className?: string;
  appName?: string;
  onClick?: () => void;
  startIcon?: ReactElement;
  endIcon?: ReactElement;
  disabled?: boolean;
}

const variantStyle = {
  primary: "bg-primary text-white hover:bg-secondary",
  secondary: "text-gray-700 hover:bg-gray-100",
};

const defaultStyles = "rounded-md flex cursor-pointer";

const sizeStyles = {
  sm: "py-1 px-3",
  md: "py-2 px-5",
  lg: "py-3 px-7",
};

export const Button = ({
  children,
  className = "",
  onClick,
  variant,
  size,
  startIcon,
  endIcon,
  disabled
}: ButtonProps) => {
  return (
    <button
      onClick={onClick}
      className={`${defaultStyles} ${variantStyle[variant]} ${sizeStyles[size]} ${className} ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
    >
      {startIcon ? <div className="pr-2 flex items-center">{startIcon}</div> : null}
      {children}
      {endIcon}
    </button>
  );
};
