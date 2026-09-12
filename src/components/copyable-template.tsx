"use client";

import { useState } from "react";
import { Clipboard, Check } from "lucide-react";

export function CopyableTemplate({ title, description, text }: { title: string; description?: string; text: string }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  }
  return (
    <article className="template-card">
      <div className="template-card-head">
        <div><strong>{title}</strong>{description ? <span>{description}</span> : null}</div>
        <button className="icon-button" onClick={copy} title="Copy template">{copied ? <Check size={16} /> : <Clipboard size={16} />}</button>
      </div>
      <p>{text}</p>
    </article>
  );
}
