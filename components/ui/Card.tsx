import { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}

export default function Card({
  children,
  className = "",
  hover = true,
}: CardProps) {
  return (
    <div
      className={`glass-card p-6 transition-all duration-300 ${hover ? "hover:scale-[1.02]" : ""} ${className}`}
    >
      {children}
    </div>
  );
}
