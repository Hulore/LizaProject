"use client";

import { useState } from "react";

type CreateInviteState = "idle" | "creating" | "copied" | "failed";

async function copyText(text: string): Promise<boolean> {
  if (window.isSecureContext && navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return true;
  }

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.top = "0";
  textarea.style.left = "0";
  textarea.style.width = "1px";
  textarea.style.height = "1px";
  textarea.style.opacity = "0";
  document.body.append(textarea);
  textarea.focus();
  textarea.select();

  const selection = window.getSelection();
  const range = document.createRange();
  range.selectNodeContents(textarea);
  selection?.removeAllRanges();
  selection?.addRange(range);
  textarea.setSelectionRange(0, text.length);

  const copied = document.execCommand("copy");
  selection?.removeAllRanges();
  textarea.remove();

  return copied;
}

export function CreateInviteButton() {
  const [state, setState] = useState<CreateInviteState>("idle");
  const [inviteUrl, setInviteUrl] = useState("");

  async function createAndCopyInvite() {
    setState("creating");

    try {
      const response = await fetch("/api/teacher/invitations", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to create invitation.");
      }

      const data = (await response.json()) as { url: string };

      setInviteUrl(data.url);
      setState((await copyText(data.url)) ? "copied" : "failed");
    } catch {
      setState("failed");
    }
  }

  async function copyExistingInvite() {
    if (!inviteUrl) {
      return;
    }

    setState((await copyText(inviteUrl)) ? "copied" : "failed");
  }

  return (
    <div className="create-invite-box">
      <button type="button" className="invite-button" onClick={createAndCopyInvite} disabled={state === "creating"}>
        {state === "creating" ? "Создаю..." : "Создать приглашение"}
      </button>

      {inviteUrl ? (
        <div className="created-invite-box">
          <a href={inviteUrl} className="created-invite-link">
            {inviteUrl}
          </a>
          <button type="button" onClick={copyExistingInvite}>
            Скопировать ещё раз
          </button>
        </div>
      ) : null}

      {state === "copied" ? <small>Ссылка создана и скопирована.</small> : null}
      {state === "failed" ? (
        <small>Телефон мог заблокировать буфер обмена на http. Нажми “Скопировать ещё раз” или зажми ссылку.</small>
      ) : null}
    </div>
  );
}
