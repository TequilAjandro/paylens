import * as React from "react";
import { cn } from "@/lib/utils";

const Select = React.forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement>
>(({ className, children, ...props }, ref) => {
  return (
    <select
      ref={ref}
      className={cn(
        "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    >
      {children}
    </select>
  );
});

Select.displayName = "Select";

const SelectTrigger = Select;

function SelectValue({ placeholder }: { placeholder?: string }) {
  return <span>{placeholder}</span>;
}

function SelectContent({
  children,
}: React.HTMLAttributes<HTMLOptGroupElement>) {
  return <>{children}</>;
}

function SelectItem({
  children,
  ...props
}: React.OptionHTMLAttributes<HTMLOptionElement>) {
  return <option {...props}>{children}</option>;
}

function SelectGroup({ children }: React.HTMLAttributes<HTMLOptGroupElement>) {
  return <>{children}</>;
}

function SelectLabel({
  children,
  ...props
}: React.HTMLAttributes<HTMLOptGroupElement>) {
  return <optgroup label={typeof children === "string" ? children : ""} {...props} />;
}

function SelectSeparator() {
  return null;
}

export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
};
