import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { Controller, useFormContext } from "react-hook-form";

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  name: string;
  label: string;
  description?: string;
}

export function FormInput({
  name,
  label,
  description,
  className,
  ...props
}: FormInputProps) {
  const {
    register,
    formState: { errors },
  } = useFormContext();
  const error = errors[name]?.message as string | undefined;

  return (
    <div className="space-y-2">
      <Label htmlFor={name}>{label}</Label>
      {description && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}
      <Input
        id={name}
        {...register(name)}
        {...props}
        className={cn(
          error && "border-destructive focus-visible:ring-destructive",
          className,
        )}
      />
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

interface FormPasswordInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  name: string;
  label: string;
  description?: string;
}

/**
 * Same as FormInput, but for secrets/API keys — masks the value by
 * default with an eye button to reveal/hide it, instead of a plain
 * type="password" field with no way to check what you typed/pasted.
 */
export function FormPasswordInput({
  name,
  label,
  description,
  className,
  ...props
}: FormPasswordInputProps) {
  const {
    register,
    formState: { errors },
  } = useFormContext();
  const error = errors[name]?.message as string | undefined;
  const [visible, setVisible] = useState(false);

  return (
    <div className="space-y-2">
      <Label htmlFor={name}>{label}</Label>
      {description && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}
      <div className="relative">
        <Input
          id={name}
          type={visible ? "text" : "password"}
          autoComplete="off"
          {...register(name)}
          {...props}
          className={cn(
            "pr-10",
            error && "border-destructive focus-visible:ring-destructive",
            className,
          )}
        />
        <button
          type="button"
          onClick={() => setVisible((current) => !current)}
          className="absolute right-0 top-0 flex h-full w-10 items-center justify-center text-muted-foreground hover:text-foreground"
          tabIndex={-1}
          aria-label={visible ? `Hide ${label}` : `Show ${label}`}
        >
          {visible ? (
            <EyeOff className="h-4 w-4" />
          ) : (
            <Eye className="h-4 w-4" />
          )}
        </button>
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

interface FormTextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  name: string;
  label: string;
  description?: string;
}

export function FormTextarea({
  name,
  label,
  description,
  className,
  ...props
}: FormTextareaProps) {
  const {
    register,
    formState: { errors },
  } = useFormContext();
  const error = errors[name]?.message as string | undefined;

  return (
    <div className="space-y-2">
      <Label htmlFor={name}>{label}</Label>
      {description && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}
      <Textarea
        id={name}
        {...register(name)}
        {...props}
        className={cn(
          error && "border-destructive focus-visible:ring-destructive",
          className,
        )}
      />
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

interface FormSelectProps {
  name: string;
  label: string;
  description?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
}

export function FormSelect({
  name,
  label,
  description,
  options,
  placeholder,
}: FormSelectProps) {
  const {
    control,
    formState: { errors },
  } = useFormContext();
  const error = errors[name]?.message as string | undefined;

  return (
    <div className="space-y-2">
      <Label htmlFor={name}>{label}</Label>
      {description && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <Select onValueChange={field.onChange} defaultValue={field.value}>
            <SelectTrigger
              id={name}
              className={cn(
                error && "border-destructive focus-visible:ring-destructive",
              )}
            >
              <SelectValue placeholder={placeholder || `Select ${label}`} />
            </SelectTrigger>
            <SelectContent>
              {options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      />
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

interface FormCheckboxProps {
  name: string;
  label: string;
  description?: string;
}

export function FormCheckbox({ name, label, description }: FormCheckboxProps) {
  const {
    control,
    formState: { errors },
  } = useFormContext();
  const error = errors[name]?.message as string | undefined;

  return (
    <div className="space-y-2">
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <div className="flex items-center space-x-2">
            <Checkbox
              id={name}
              checked={field.value}
              onCheckedChange={field.onChange}
            />
            <div className="space-y-1">
              <Label
                htmlFor={name}
                className="text-sm font-normal cursor-pointer"
              >
                {label}
              </Label>
              {description && (
                <p className="text-xs text-muted-foreground">{description}</p>
              )}
            </div>
          </div>
        )}
      />
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
