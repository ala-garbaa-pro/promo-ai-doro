import React from "react";

const Popover = ({ children }: { children: React.ReactNode }) => (
  <div data-testid="popover">{children}</div>
);

const PopoverTrigger = ({ children }: { children: React.ReactNode }) => (
  <button data-testid="popover-trigger">{children}</button>
);

const PopoverContent = ({ children }: { children: React.ReactNode }) => (
  <div data-testid="popover-content">{children}</div>
);

export { Popover, PopoverTrigger, PopoverContent };
