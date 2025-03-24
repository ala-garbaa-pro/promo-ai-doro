import React from "react";

const Root = ({ children }: { children: React.ReactNode }) => (
  <div data-testid="dialog-root">{children}</div>
);
Root.displayName = "DialogRoot";

const Trigger = ({ children }: { children: React.ReactNode }) => (
  <button data-testid="dialog-trigger">{children}</button>
);
Trigger.displayName = "DialogTrigger";

const Content = ({ children }: { children: React.ReactNode }) => (
  <div data-testid="dialog-content">{children}</div>
);
Content.displayName = "DialogContent";

const Close = ({ children }: { children: React.ReactNode }) => (
  <button data-testid="dialog-close">{children}</button>
);
Close.displayName = "DialogClose";

const Portal = ({ children }: { children: React.ReactNode }) => (
  <div data-testid="dialog-portal">{children}</div>
);
Portal.displayName = "DialogPortal";

const Overlay = ({ children }: { children: React.ReactNode }) => (
  <div data-testid="dialog-overlay">{children}</div>
);
Overlay.displayName = "DialogOverlay";

const Title = ({ children }: { children: React.ReactNode }) => (
  <h2 data-testid="dialog-title">{children}</h2>
);
Title.displayName = "DialogTitle";

const Description = ({ children }: { children: React.ReactNode }) => (
  <p data-testid="dialog-description">{children}</p>
);
Description.displayName = "DialogDescription";

const DialogPrimitive = {
  Root,
  Trigger,
  Content,
  Close,
  Portal,
  Overlay,
  Title,
  Description,
};

export default DialogPrimitive;
