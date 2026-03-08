"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBusy(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const json = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(json.error ?? "Login failed");
      }

      const nextPath = new URLSearchParams(window.location.search).get("next");
      router.replace(nextPath && nextPath.startsWith("/") ? nextPath : "/");
      router.refresh();
    } catch (caught) {
      setError((caught as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="loginShell">
      <section className="loginPanel">
        <p className="kicker">Concert Presale Watcher</p>
        <h1>Sign In</h1>
        <p className="muted">Enter your deployment password to continue.</p>
        <form className="stack" onSubmit={submit}>
          <input
            type="password"
            autoFocus
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Password"
            required
          />
          <button type="submit" disabled={busy}>
            {busy ? "Signing in..." : "Sign In"}
          </button>
        </form>
        {error ? <p className="errorBanner">{error}</p> : null}
      </section>
    </main>
  );
}
