"use client";

interface AvatarProps {
  src: string | null | undefined;
  alt: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

export default function Avatar({ src, alt, size = "md", className = "" }: AvatarProps) {
  const sizeClasses = {
    sm: "w-6 h-6 text-xs",
    md: "w-8 h-8 text-sm",
    lg: "w-12 h-12 text-base",
    xl: "w-24 h-24 text-2xl",
  };

  const avatarSrc = src || "/default-avatar.png";

  return (
    <img
      src={avatarSrc}
      alt={alt}
      className={`rounded-full object-cover ${sizeClasses[size]} ${className}`}
    />
  );
}
