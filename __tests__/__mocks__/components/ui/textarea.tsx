import React from "react";

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>((props, ref) => <textarea ref={ref} data-testid="textarea" {...props} />);

Textarea.displayName = "Textarea";

export { Textarea };
