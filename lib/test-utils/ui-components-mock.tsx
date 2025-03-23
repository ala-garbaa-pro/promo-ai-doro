import React from "react";

// Mock Dialog components
export const Dialog = ({ children, open, onOpenChange }: any) => (
  <div data-testid="dialog" data-open={open}>
    {open && children}
  </div>
);

export const DialogContent = ({ children }: any) => (
  <div data-testid="dialog-content">{children}</div>
);

export const DialogHeader = ({ children }: any) => (
  <div data-testid="dialog-header">{children}</div>
);

export const DialogTitle = ({ children }: any) => (
  <h2 data-testid="dialog-title">{children}</h2>
);

export const DialogDescription = ({ children }: any) => (
  <p data-testid="dialog-description">{children}</p>
);

export const DialogFooter = ({ children }: any) => (
  <div data-testid="dialog-footer">{children}</div>
);

// Mock Input component
export const Input = React.forwardRef(({ ...props }: any, ref) => (
  <input ref={ref} {...props} />
));
Input.displayName = "Input";

// Mock Label component
export const Label = ({ children, htmlFor }: any) => (
  <label htmlFor={htmlFor}>{children}</label>
);

// Mock Textarea component
export const Textarea = React.forwardRef(({ ...props }: any, ref) => (
  <textarea ref={ref} {...props} />
));
Textarea.displayName = "Textarea";

// Mock Select components
export const Select = ({ children, value, onValueChange }: any) => (
  <div data-testid="select" data-value={value}>
    {children}
    <select
      value={value}
      onChange={(e) => onValueChange && onValueChange(e.target.value)}
    >
      <option value="low">Low</option>
      <option value="medium">Medium</option>
      <option value="high">High</option>
      <option value="pending">Pending</option>
      <option value="in_progress">In Progress</option>
      <option value="completed">Completed</option>
      <option value="cancelled">Cancelled</option>
    </select>
  </div>
);

export const SelectTrigger = ({ children, id }: any) => (
  <div data-testid="select-trigger" id={id}>
    {children}
  </div>
);

export const SelectValue = ({ children, placeholder }: any) => (
  <div data-testid="select-value" data-placeholder={placeholder}>
    {children}
  </div>
);

export const SelectContent = ({ children }: any) => (
  <div data-testid="select-content">{children}</div>
);

export const SelectItem = ({ children, value }: any) => (
  <div data-testid="select-item" data-value={value}>
    {children}
  </div>
);

// Mock Button component
export const Button = React.forwardRef(
  ({ children, onClick, disabled, ...props }: any, ref) => (
    <button ref={ref} onClick={onClick} disabled={disabled} {...props}>
      {children}
    </button>
  )
);
Button.displayName = "Button";

// Mock Popover components
export const Popover = ({ children }: any) => (
  <div data-testid="popover">{children}</div>
);

export const PopoverTrigger = ({ children, asChild }: any) => (
  <div data-testid="popover-trigger" data-aschild={asChild}>
    {children}
  </div>
);

export const PopoverContent = ({ children }: any) => (
  <div data-testid="popover-content">{children}</div>
);

// Mock Calendar component
export const Calendar = ({ selected, onSelect, initialFocus, mode }: any) => (
  <div
    data-testid="calendar"
    data-selected={selected?.toISOString()}
    data-mode={mode}
  >
    <button onClick={() => onSelect(new Date("2023-12-31"))}>
      Select Date
    </button>
  </div>
);

// Export all mocked components
export default {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  Input,
  Label,
  Textarea,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  Button,
  Popover,
  PopoverTrigger,
  PopoverContent,
  Calendar,
};
