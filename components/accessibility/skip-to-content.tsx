"use client";

import { useRef } from "react";
import { useKeyboardNavigation } from "@/hooks/use-keyboard-navigation";

interface SkipToContentProps {
  contentId: string;
}

export function SkipToContent({ contentId }: SkipToContentProps) {
  const skipLinkRef = useRef<HTMLAnchorElement>(null);

  useKeyboardNavigation(skipLinkRef);

  return (
    <a
      ref={skipLinkRef}
      href={`#${contentId}`}
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:p-4 focus:bg-background focus:text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
    >
      Skip to content
    </a>
  );
}
