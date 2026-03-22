import Image from "next/image";
import { cn } from "@/lib/utils";

interface LogoProps {
  variant?: "filled" | "contained";
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

export function Logo({
  variant = "filled",
  size = "md",
  className,
}: LogoProps) {
  const sizeMap = {
    sm: { width: 24, height: 24 },
    md: { width: 32, height: 32 },
    lg: { width: 40, height: 40 },
    xl: { width: 80, height: 80 },
  };

  const { width, height } = sizeMap[size];
  const logoPath =
    variant === "filled"
      ? "/icons/logo-filled.svg"
      : "/icons/logo-container.svg";

  return (
    <div className={cn("flex items-center", className)}>
      <Image
        src={logoPath}
        alt="Quantify Pro Logo"
        width={width}
        height={height}
        priority
      />
    </div>
  );
}
