import React from "react";

const Command = ({ children }: { children: React.ReactNode }) => (
  <div data-testid="command">{children}</div>
);

const CommandInput = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>((props, ref) => <input ref={ref} data-testid="command-input" {...props} />);
CommandInput.displayName = "CommandInput";

const CommandList = ({ children }: { children: React.ReactNode }) => (
  <div data-testid="command-list">{children}</div>
);

const CommandEmpty = ({ children }: { children: React.ReactNode }) => (
  <div data-testid="command-empty">{children}</div>
);

const CommandGroup = ({ children }: { children: React.ReactNode }) => (
  <div data-testid="command-group">{children}</div>
);

const CommandItem = ({
  children,
  onSelect,
}: {
  children: React.ReactNode;
  onSelect?: () => void;
}) => (
  <div data-testid="command-item" onClick={onSelect}>
    {children}
  </div>
);

const CommandSeparator = () => <hr data-testid="command-separator" />;

export {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
};
