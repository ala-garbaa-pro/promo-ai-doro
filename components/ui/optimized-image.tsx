"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface OptimizedImageProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
  priority?: boolean;
  quality?: number;
  sizes?: string;
  fill?: boolean;
  objectFit?: "contain" | "cover" | "fill" | "none" | "scale-down";
  objectPosition?: string;
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  className,
  priority = false,
  quality = 75,
  sizes,
  fill = false,
  objectFit = "cover",
  objectPosition = "center",
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <div
      className={cn(
        "relative overflow-hidden",
        fill ? "w-full h-full" : "",
        className
      )}
      style={{
        width: fill ? "100%" : width,
        height: fill ? "100%" : height,
      }}
    >
      {isLoading && (
        <Skeleton
          className="absolute inset-0 z-10"
          style={{
            width: fill ? "100%" : width,
            height: fill ? "100%" : height,
          }}
        />
      )}
      <Image
        src={src}
        alt={alt}
        width={fill ? undefined : width}
        height={fill ? undefined : height}
        className={cn(
          "transition-opacity duration-300",
          isLoading ? "opacity-0" : "opacity-100"
        )}
        style={{
          objectFit,
          objectPosition,
        }}
        priority={priority}
        quality={quality}
        sizes={sizes}
        fill={fill}
        onLoad={() => setIsLoading(false)}
      />
    </div>
  );
}
