"use client";

import { useState } from "react";

type CreateInviteState = "idle" | "creating" | "copied" | "failed";

async function copyText(text: string) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.left = "-9999px";
  document.body.append(textarea);
  textarea.select();
  document.execCommand("copy");
  textarea.remove();
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

      await copyText(data.url);
      setInviteUrl(data.url);
      setState("copied");
    } catch {
      setState("failed");
    }
  }

  return (
    <div className="create-invite-box">
      <button type="button" className="invite-button" onClick={createAndCopyInvite} disabled={state === "creating"}>
        {state === "creating" ? "Создаю..." : "Создать приглашение"}
      </button>

      {inviteUrl ? (
        <a href={inviteUrl} className="created-invite-link">
          {inviteUrl}
        </a>
      ) : null}

      {state === "copied" ? <small>Ссылка создана и скопирована.</small> : null}
      {state === "failed" ? <small>Не получилось скопировать. Попробуй ещё раз.</small> : null}
    </div>
  );
}
