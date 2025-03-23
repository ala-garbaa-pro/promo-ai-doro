import React from "react";
import { render, screen } from "@testing-library/react";

// Simple test to verify Jest is working
describe("Simple Tests", () => {
  it("should pass a simple test", () => {
    expect(true).toBe(true);
  });

  it("should render a simple component", () => {
    render(<div data-testid="test-div">Test Content</div>);
    expect(screen.getByTestId("test-div")).toBeInTheDocument();
    expect(screen.getByText("Test Content")).toBeInTheDocument();
  });
});
