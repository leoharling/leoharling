import Link from "next/link";
import { ReactNode } from "react";

interface ButtonProps {
  children: ReactNode;
  href?: string;
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
  external?: boolean;
  className?: string;
  onClick?: () => void;
  type?: "button" | "submit";
  disabled?: boolean;
}

const variants = {
  primary:
    "bg-accent text-white hover:bg-accent-hover shadow-lg shadow-accent/20",
  secondary:
    "border border-white/10 text-foreground hover:border-accent/50 hover:bg-white/5",
  ghost: "text-muted-foreground hover:text-foreground hover:bg-white/5",
};

const sizes = {
  sm: "px-4 py-2 text-sm",
  md: "px-6 py-3 text-base",
  lg: "px-8 py-4 text-lg",
};

export default function Button({
  children,
  href,
  variant = "primary",
  size = "md",
  external = false,
  className = "",
  onClick,
  type = "button",
  disabled = false,
}: ButtonProps) {
  const classes = `inline-flex items-center justify-center gap-2 rounded-full font-medium transition-all duration-300 ${variants[variant]} ${sizes[size]} ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"} ${className}`;

  if (href) {
    if (external) {
      return (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className={classes}
        >
          {children}
        </a>
      );
    }
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={classes}
    >
      {children}
    </button>
  );
}
