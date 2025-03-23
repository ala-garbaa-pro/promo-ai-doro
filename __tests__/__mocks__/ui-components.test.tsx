import React from "react";
import { render, screen } from "@testing-library/react";
import * as UIComponents from "@/lib/test-utils/ui-components-mock";

describe("UI Component Mocks", () => {
  it("should render Button component", () => {
    render(<UIComponents.Button>Test Button</UIComponents.Button>);
    expect(screen.getByText("Test Button")).toBeInTheDocument();
  });

  it("should render Dialog components", () => {
    render(
      <UIComponents.Dialog open={true}>
        <UIComponents.DialogContent>
          <UIComponents.DialogHeader>
            <UIComponents.DialogTitle>Test Dialog</UIComponents.DialogTitle>
            <UIComponents.DialogDescription>
              Test Description
            </UIComponents.DialogDescription>
          </UIComponents.DialogHeader>
          <UIComponents.DialogFooter>
            <UIComponents.Button>OK</UIComponents.Button>
          </UIComponents.DialogFooter>
        </UIComponents.DialogContent>
      </UIComponents.Dialog>
    );

    expect(screen.getByTestId("dialog")).toBeInTheDocument();
    expect(screen.getByTestId("dialog-content")).toBeInTheDocument();
    expect(screen.getByTestId("dialog-header")).toBeInTheDocument();
    expect(screen.getByTestId("dialog-title")).toBeInTheDocument();
    expect(screen.getByTestId("dialog-footer")).toBeInTheDocument();
    expect(screen.getByText("Test Dialog")).toBeInTheDocument();
    expect(screen.getByText("Test Description")).toBeInTheDocument();
    expect(screen.getByText("OK")).toBeInTheDocument();
  });
});
