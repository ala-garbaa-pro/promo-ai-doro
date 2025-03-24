import React from "react";

// Mock UI components for testing
export function Button({ children, ...props }: any) {
  return (
    <button {...props} data-testid="button">
      {children}
    </button>
  );
}

export function Card({ children, ...props }: any) {
  return (
    <div {...props} data-testid="card">
      {children}
    </div>
  );
}

export function CardContent({ children, ...props }: any) {
  return (
    <div {...props} data-testid="card-content">
      {children}
    </div>
  );
}

export function Progress({ value, ...props }: any) {
  return <div {...props} data-testid="progress" data-value={value} />;
}

export function Tabs({ children, defaultValue, ...props }: any) {
  return (
    <div {...props} data-testid="tabs" data-default-value={defaultValue}>
      {children}
    </div>
  );
}

export function TabsList({ children, ...props }: any) {
  return (
    <div {...props} data-testid="tabs-list" role="tablist">
      {children}
    </div>
  );
}

export function TabsTrigger({ children, value, ...props }: any) {
  return (
    <button
      {...props}
      data-testid="tabs-trigger"
      data-value={value}
      role="tab"
      aria-selected={false}
    >
      {children}
    </button>
  );
}

export function TabsContent({ children, value, ...props }: any) {
  return (
    <div
      {...props}
      data-testid="tabs-content"
      data-value={value}
      role="tabpanel"
    >
      {children}
    </div>
  );
}

export function Badge({ children, ...props }: any) {
  return (
    <span {...props} data-testid="badge">
      {children}
    </span>
  );
}

export function Skeleton(props: any) {
  return <div {...props} data-testid="skeleton" />;
}

export function Tooltip({ children, ...props }: any) {
  return (
    <div {...props} data-testid="tooltip">
      {children}
    </div>
  );
}

export function TooltipTrigger({ children, ...props }: any) {
  return (
    <div {...props} data-testid="tooltip-trigger">
      {children}
    </div>
  );
}

export function TooltipContent({ children, ...props }: any) {
  return (
    <div {...props} data-testid="tooltip-content">
      {children}
    </div>
  );
}

export function AnimatedTransition({ children, ...props }: any) {
  return (
    <div {...props} data-testid="animated-transition">
      {children}
    </div>
  );
}
