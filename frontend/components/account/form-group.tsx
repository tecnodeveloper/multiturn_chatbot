import { FC, InputHTMLAttributes } from "react";

interface FormGroupProps extends InputHTMLAttributes<HTMLInputElement | HTMLTextAreaElement> {
  label: string;
  type?: string;
  isTextArea?: boolean;
}

export const FormGroup: FC<FormGroupProps> = ({ label, type = "text", isTextArea = false, ...props }) => {
  return (
    <div className="flex flex-col gap-2 w-full">
      <label className="text-sm font-medium text-gray-700">
        {label}
      </label>
      {isTextArea ? (
        <textarea
          className="bg-gray-50/50 border border-gray-200 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#8b6f5c]/20 transition-all resize-none"
          rows={3}
          {...(props as any)}
        />
      ) : (
        <input
          type={type}
          className="bg-gray-50/50 border border-gray-200 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#8b6f5c]/20 transition-all"
          {...props}
        />
      )}
    </div>
  );
};
