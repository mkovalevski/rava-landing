import { useId, useState, type InputHTMLAttributes, type ReactNode } from "react";

import { EyeIcon, EyeOffIcon } from "@/components/icons/EyeIcon";

type Props = {
  label: string;
  hint?: ReactNode;
} & InputHTMLAttributes<HTMLInputElement>;

export function AuthField({ label, hint, type = "text", ...rest }: Props) {
  const id = useId();
  const [reveal, setReveal] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword && reveal ? "text" : type;

  return (
    <label className="field" htmlFor={id}>
      <span className="field-label">{label}</span>
      <span className="field-control">
        <input id={id} type={inputType} className="field-input" {...rest} />
        {isPassword && (
          <button
            type="button"
            className="field-toggle"
            onClick={() => setReveal((v) => !v)}
            aria-label={reveal ? "Скрыть пароль" : "Показать пароль"}
            tabIndex={-1}
          >
            {reveal ? <EyeOffIcon /> : <EyeIcon />}
          </button>
        )}
      </span>
      {hint && <span className="field-hint">{hint}</span>}
    </label>
  );
}
