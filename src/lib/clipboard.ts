import { spawnSync } from "child_process";

export function copyToHostClipboard(text: string) {
  if (process.platform !== "win32") {
    return false;
  }

  const clipResult = spawnSync("clip.exe", {
    input: text,
    windowsHide: true,
  });

  if (clipResult.status === 0) {
    return true;
  }

  const powershellResult = spawnSync(
    "powershell.exe",
    ["-NoProfile", "-NonInteractive", "-Command", "Set-Clipboard -Value ([Console]::In.ReadToEnd())"],
    {
      input: text,
      windowsHide: true,
    },
  );

  return powershellResult.status === 0;
}
