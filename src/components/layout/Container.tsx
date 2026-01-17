import { ReactNode } from "react";

interface ContainerProps {
  children: ReactNode;
  className?: string;
}

export function Container({ children, className = "" }: ContainerProps) {
  return (
    <div className={`container mx-auto px-4 sm:px-6 py-10 md:py-16 ${className}`}>
      {children}
    </div>
  );
}
