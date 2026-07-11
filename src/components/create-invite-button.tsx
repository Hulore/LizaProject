"use client";

import { useState } from "react";

type CreateInviteState = "idle" | "creating" | "copied" | "failed";

function createInviteCode() {
  const bytes = new Uint8Array(4);
  window.crypto.getRandomValues(bytes);
  const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0").toUpperCase()).join("");

  return `LZ-${hex.slice(0, 4)}-${hex.slice(4)}`;
}

function copyText(text: string): boolean {
  if (window.isSecureContext && navigator.clipboard?.writeText) {
    void navigator.clipboard.writeText(text);
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
    const code = createInviteCode();
    const url = `${window.location.origin}/register/${code}`;
    const copied = copyText(url);

    setInviteUrl(url);
    setState("creating");

    try {
      const response = await fetch("/api/teacher/invitations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code }),
      });

      if (!response.ok) {
        throw new Error("Failed to create invitation.");
      }

      const data = (await response.json()) as { hostClipboard?: boolean; url: string };

      setInviteUrl(data.url);
      setState(copied || data.hostClipboard ? "copied" : "failed");
    } catch {
      setState("failed");
    }
  }

  async function copyExistingInvite() {
    if (!inviteUrl) {
      return;
    }

    setState(copyText(inviteUrl) ? "copied" : "failed");
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

      {state === "copied" ? <small>Ссылка уже в буфере. Можно вставлять в чат или Блокнот.</small> : null}
      {state === "failed" ? (
        <small>Телефон мог заблокировать буфер обмена на http. Нажми “Скопировать ещё раз” или зажми ссылку.</small>
      ) : null}
    </div>
  );
}
