import type { InputHTMLAttributes, TextareaHTMLAttributes } from "react";

export function AP_TextBox(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`ap-textbox ${props.className ?? ""}`.trim()} />;
}

export function AP_TextArea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={`ap-textbox ap-textarea ${props.className ?? ""}`.trim()} />;
}
