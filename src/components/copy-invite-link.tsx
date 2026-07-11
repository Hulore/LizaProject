"use client";

import { useMemo, useState } from "react";

export function CopyInviteLink({ code }: { code: string }) {
  const [copyState, setCopyState] = useState<"idle" | "copied" | "failed">("idle");

  const invitePath = `/register/${code}`;
  const inviteUrl = useMemo(() => {
    if (typeof window === "undefined") {
      return invitePath;
    }

    return `${window.location.origin}${invitePath}`;
  }, [invitePath]);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopyState("copied");
    } catch {
      setCopyState("failed");
    }
  }

  return (
    <div className="invite-copy-box">
      <a href={invitePath}>{inviteUrl}</a>
      <button type="button" onClick={copyLink}>
        {copyState === "copied" ? "Ссылка скопирована" : "Скопировать ссылку"}
      </button>
      {copyState === "failed" ? <small>Не получилось автоматически скопировать. Нажми кнопку ещё раз.</small> : null}
    </div>
  );
}
