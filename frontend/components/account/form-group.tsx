import { FC, InputHTMLAttributes } from "react";

interface FormGroupProps extends InputHTMLAttributes<
  HTMLInputElement | HTMLTextAreaElement
> {
  label: string;
  type?: string;
  isTextArea?: boolean;
}

export const FormGroup: FC<FormGroupProps> = ({
  label,
  type = "text",
  isTextArea = false,
  ...props
}) => {
  return (
    <div className="flex flex-col gap-2 w-full">
      <label className="text-sm font-medium text-muted-foreground">
        {label}
      </label>
      {isTextArea ? (
        <textarea
          autoComplete="off"
          className="bg-muted/30 border border-border rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none text-foreground disabled:opacity-50"
          rows={3}
          {...(props as any)}
        />
      ) : (
        <input
          autoComplete="off"
          type={type}
          className="bg-muted/30 border border-border rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-foreground disabled:opacity-50"
          {...props}
        />
      )}
    </div>
  );
};
