import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Button } from "@/components/ui/button";

describe("Button Component", () => {
  it("renders correctly", () => {
    render(<Button>Test Button</Button>);
    expect(
      screen.getByRole("button", { name: /test button/i })
    ).toBeInTheDocument();
  });

  it("handles click events", async () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click Me</Button>);

    const user = userEvent.setup();
    const button = screen.getByRole("button", { name: /click me/i });

    await user.click(button);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("applies variant classes correctly", () => {
    render(<Button variant="destructive">Destructive Button</Button>);
    const button = screen.getByRole("button", { name: /destructive button/i });

    expect(button).toHaveClass("bg-destructive");
    expect(button).toHaveClass("text-destructive-foreground");
  });

  it("applies size classes correctly", () => {
    render(<Button size="sm">Small Button</Button>);
    const button = screen.getByRole("button", { name: /small button/i });

    expect(button).toHaveClass("h-9");
    expect(button).toHaveClass("rounded-md");
    expect(button).toHaveClass("px-3");
  });

  it("renders as a child component when asChild is true", () => {
    render(
      <Button asChild>
        <a href="https://example.com">Link Button</a>
      </Button>
    );

    expect(
      screen.getByRole("link", { name: /link button/i })
    ).toBeInTheDocument();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("is disabled when disabled prop is true", () => {
    render(<Button disabled>Disabled Button</Button>);

    const button = screen.getByRole("button", { name: /disabled button/i });
    expect(button).toBeDisabled();
  });
});
