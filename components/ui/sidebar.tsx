"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/* -----------------------------------------------------------------------------
 * Context
 * ---------------------------------------------------------------------------*/

interface SidebarContextValue {
  state: {
    open: boolean;
    openMobile: boolean;
    isMobile: boolean;
  };
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  openMobile: boolean;
  setOpenMobile: React.Dispatch<React.SetStateAction<boolean>>;
  isMobile: boolean;
  toggleSidebar: () => void;
}

const SidebarContext = React.createContext<SidebarContextValue | undefined>(
  undefined
);

export function useSidebar() {
  const context = React.useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
}

/* -----------------------------------------------------------------------------
 * Provider
 * ---------------------------------------------------------------------------*/

interface SidebarProviderProps {
  children: React.ReactNode;
  defaultOpen?: boolean;
  defaultOpenMobile?: boolean;
  onOpenChange?: (open: boolean) => void;
  onOpenMobileChange?: (open: boolean) => void;
}

export function SidebarProvider({
  children,
  defaultOpen = true,
  defaultOpenMobile = false,
  onOpenChange,
  onOpenMobileChange,
}: SidebarProviderProps) {
  const [open, setOpen] = React.useState(defaultOpen);
  const [openMobile, setOpenMobile] = React.useState(defaultOpenMobile);
  const [isMobile, setIsMobile] = React.useState(false);

  // Handle open change
  React.useEffect(() => {
    onOpenChange?.(open);
  }, [open, onOpenChange]);

  // Handle open mobile change
  React.useEffect(() => {
    onOpenMobileChange?.(openMobile);
  }, [openMobile, onOpenMobileChange]);

  // Handle mobile detection
  React.useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Toggle sidebar
  const toggleSidebar = React.useCallback(() => {
    if (isMobile) {
      setOpenMobile(!openMobile);
    } else {
      setOpen(!open);
    }
  }, [isMobile, open, openMobile]);

  // Keyboard shortcut
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "b" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        toggleSidebar();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [toggleSidebar]);

  const contextValue = React.useMemo(
    () => ({
      state: {
        open,
        openMobile,
        isMobile,
      },
      open,
      setOpen,
      openMobile,
      setOpenMobile,
      isMobile,
      toggleSidebar,
    }),
    [open, openMobile, isMobile, toggleSidebar]
  );

  return (
    <SidebarContext.Provider value={contextValue}>
      {children}
    </SidebarContext.Provider>
  );
}

/* -----------------------------------------------------------------------------
 * Sidebar
 * ---------------------------------------------------------------------------*/

const sidebarVariants = cva(
  "fixed inset-y-0 left-0 z-20 flex h-full flex-col border-r bg-background transition-all duration-300 data-[state=open]:translate-x-0 data-[state=closed]:translate-x-[-100%] md:data-[state=closed]:translate-x-0",
  {
    variants: {
      variant: {
        default: "w-[270px] md:w-[270px] md:data-[state=closed]:w-[80px]",
        inset: "w-[270px] md:w-[270px] md:data-[state=closed]:w-[80px]",
      },
      collapsible: {
        none: "",
        icon: "md:data-[state=closed]:w-[80px]",
        offcanvas: "",
      },
    },
    defaultVariants: {
      variant: "default",
      collapsible: "icon",
    },
  }
);

interface SidebarProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof sidebarVariants> {}

export function Sidebar({
  className,
  variant,
  collapsible,
  ...props
}: SidebarProps) {
  const { open, openMobile, isMobile } = useSidebar();
  const isOpen = isMobile ? openMobile : open;

  return (
    <>
      {/* Backdrop */}
      {isMobile && openMobile && (
        <div
          className="fixed inset-0 z-10 bg-background/80 backdrop-blur-sm"
          onClick={() => {
            const { setOpenMobile } = useSidebar();
            setOpenMobile(false);
          }}
        />
      )}
      {/* Sidebar */}
      <aside
        className={cn(sidebarVariants({ variant, collapsible, className }))}
        data-state={isOpen ? "open" : "closed"}
        {...props}
      />
    </>
  );
}

/* -----------------------------------------------------------------------------
 * SidebarHeader
 * ---------------------------------------------------------------------------*/

export function SidebarHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("border-b px-4 py-4", className)} {...props} />;
}

/* -----------------------------------------------------------------------------
 * SidebarContent
 * ---------------------------------------------------------------------------*/

export function SidebarContent({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("flex-1 overflow-auto py-2", className)} {...props} />
  );
}

/* -----------------------------------------------------------------------------
 * SidebarFooter
 * ---------------------------------------------------------------------------*/

export function SidebarFooter({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("border-t px-4 py-4", className)} {...props} />;
}

/* -----------------------------------------------------------------------------
 * SidebarGroup
 * ---------------------------------------------------------------------------*/

export function SidebarGroup({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("px-2 py-2", className)} {...props} />;
}

/* -----------------------------------------------------------------------------
 * SidebarGroupLabel
 * ---------------------------------------------------------------------------*/

export function SidebarGroupLabel({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "flex items-center px-2 py-2 text-xs font-medium text-muted-foreground",
        className
      )}
      {...props}
    />
  );
}

/* -----------------------------------------------------------------------------
 * SidebarGroupContent
 * ---------------------------------------------------------------------------*/

export function SidebarGroupContent({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("space-y-1", className)} {...props} />;
}

/* -----------------------------------------------------------------------------
 * SidebarGroupAction
 * ---------------------------------------------------------------------------*/

export function SidebarGroupAction({
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn(
        "ml-auto flex h-4 w-4 items-center justify-center rounded-sm opacity-70 ring-offset-background transition-colors hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-secondary",
        className
      )}
      {...props}
    />
  );
}

/* -----------------------------------------------------------------------------
 * SidebarTrigger
 * ---------------------------------------------------------------------------*/

export function SidebarTrigger({
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const { toggleSidebar } = useSidebar();

  return (
    <button
      className={cn(
        "inline-flex h-10 items-center justify-center rounded-md px-4 py-2 text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        className
      )}
      onClick={toggleSidebar}
      {...props}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-5 w-5"
      >
        <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
        <path d="M9 3v18" />
      </svg>
      <span className="sr-only">Toggle Sidebar</span>
    </button>
  );
}

/* -----------------------------------------------------------------------------
 * SidebarNav
 * ---------------------------------------------------------------------------*/

export function SidebarNav({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  return (
    <nav
      className={cn(
        "grid gap-1 px-2 group-[[data-state=closed]]:justify-center",
        className
      )}
      {...props}
    />
  );
}

/* -----------------------------------------------------------------------------
 * SidebarNavItem
 * ---------------------------------------------------------------------------*/

interface SidebarNavItemProps extends React.HTMLAttributes<HTMLAnchorElement> {
  href: string;
  active?: boolean;
  icon?: React.ReactNode;
  label?: string;
  disabled?: boolean;
}

export function SidebarNavItem({
  className,
  href,
  active,
  icon,
  label,
  disabled,
  ...props
}: SidebarNavItemProps) {
  const { open } = useSidebar();

  return (
    <a
      href={disabled ? "#" : href}
      className={cn(
        "group flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
        active && "bg-accent text-accent-foreground",
        disabled && "pointer-events-none opacity-50",
        className
      )}
      aria-current={active ? "page" : undefined}
      {...props}
    >
      {icon && (
        <span className="mr-3 flex h-5 w-5 items-center justify-center">
          {icon}
        </span>
      )}
      {open && label && <span>{label}</span>}
    </a>
  );
}

/* -----------------------------------------------------------------------------
 * SidebarInset
 * ---------------------------------------------------------------------------*/

export function SidebarInset({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  const { open, isMobile } = useSidebar();
  const isOpen = !isMobile && open;

  return (
    <div
      className={cn(
        "ml-0 transition-all duration-300 md:ml-[80px] md:data-[state=open]:ml-[270px]",
        className
      )}
      data-state={isOpen ? "open" : "closed"}
      {...props}
    />
  );
}
