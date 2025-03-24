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
    <div {...props} data-testid="tabs-list">
      {children}
    </div>
  );
}

export function TabsTrigger({ children, value, ...props }: any) {
  return (
    <button {...props} data-testid="tabs-trigger" data-value={value}>
      {children}
    </button>
  );
}

export function TabsContent({ children, value, ...props }: any) {
  return (
    <div {...props} data-testid="tabs-content" data-value={value}>
      {children}
    </div>
  );
}

export function Checkbox({ checked, ...props }: any) {
  return (
    <input
      type="checkbox"
      checked={checked}
      {...props}
      data-testid="checkbox"
    />
  );
}

export function Label({ children, ...props }: any) {
  return (
    <label {...props} data-testid="label">
      {children}
    </label>
  );
}

export function Input(props: any) {
  return <input {...props} data-testid="input" />;
}

export function Textarea(props: any) {
  return <textarea {...props} data-testid="textarea" />;
}

export function Select({ children, ...props }: any) {
  return (
    <div {...props} data-testid="select">
      {children}
    </div>
  );
}

export function SelectTrigger({ children, ...props }: any) {
  return (
    <div {...props} data-testid="select-trigger">
      {children}
    </div>
  );
}

export function SelectValue({ children, ...props }: any) {
  return (
    <div {...props} data-testid="select-value">
      {children}
    </div>
  );
}

export function SelectContent({ children, ...props }: any) {
  return (
    <div {...props} data-testid="select-content">
      {children}
    </div>
  );
}

export function SelectItem({ children, value, ...props }: any) {
  return (
    <div {...props} data-testid="select-item" data-value={value}>
      {children}
    </div>
  );
}

export function Dialog({ children, ...props }: any) {
  return (
    <div {...props} data-testid="dialog">
      {children}
    </div>
  );
}

export function DialogTrigger({ children, ...props }: any) {
  return (
    <div {...props} data-testid="dialog-trigger">
      {children}
    </div>
  );
}

export function DialogContent({ children, ...props }: any) {
  return (
    <div {...props} data-testid="dialog-content">
      {children}
    </div>
  );
}

export function DialogHeader({ children, ...props }: any) {
  return (
    <div {...props} data-testid="dialog-header">
      {children}
    </div>
  );
}

export function DialogTitle({ children, ...props }: any) {
  return (
    <div {...props} data-testid="dialog-title">
      {children}
    </div>
  );
}

export function DialogDescription({ children, ...props }: any) {
  return (
    <div {...props} data-testid="dialog-description">
      {children}
    </div>
  );
}

export function DialogFooter({ children, ...props }: any) {
  return (
    <div {...props} data-testid="dialog-footer">
      {children}
    </div>
  );
}

export function Popover({ children, ...props }: any) {
  return (
    <div {...props} data-testid="popover">
      {children}
    </div>
  );
}

export function PopoverTrigger({ children, ...props }: any) {
  return (
    <div {...props} data-testid="popover-trigger">
      {children}
    </div>
  );
}

export function PopoverContent({ children, ...props }: any) {
  return (
    <div {...props} data-testid="popover-content">
      {children}
    </div>
  );
}

export function Calendar(props: any) {
  return <div {...props} data-testid="calendar" />;
}

export function DropdownMenu({ children, ...props }: any) {
  return (
    <div {...props} data-testid="dropdown-menu">
      {children}
    </div>
  );
}

export function DropdownMenuTrigger({ children, ...props }: any) {
  return (
    <div {...props} data-testid="dropdown-menu-trigger">
      {children}
    </div>
  );
}

export function DropdownMenuContent({ children, ...props }: any) {
  return (
    <div {...props} data-testid="dropdown-menu-content">
      {children}
    </div>
  );
}

export function DropdownMenuItem({ children, ...props }: any) {
  return (
    <div {...props} data-testid="dropdown-menu-item">
      {children}
    </div>
  );
}

export function DropdownMenuSeparator(props: any) {
  return <div {...props} data-testid="dropdown-menu-separator" />;
}

export function ScrollArea({ children, ...props }: any) {
  return (
    <div {...props} data-testid="scroll-area">
      {children}
    </div>
  );
}

export function Switch(props: any) {
  return <input type="checkbox" {...props} data-testid="switch" />;
}

export function Skeleton(props: any) {
  return <div {...props} data-testid="skeleton" />;
}

export function Badge({ children, ...props }: any) {
  return (
    <div {...props} data-testid="badge">
      {children}
    </div>
  );
}

export function Slider(props: any) {
  return <input type="range" {...props} data-testid="slider" />;
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

export function Avatar(props: any) {
  return <div {...props} data-testid="avatar" />;
}

export function AvatarImage(props: any) {
  return <img {...props} data-testid="avatar-image" />;
}

export function AvatarFallback({ children, ...props }: any) {
  return (
    <div {...props} data-testid="avatar-fallback">
      {children}
    </div>
  );
}
