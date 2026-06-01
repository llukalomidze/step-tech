import { Injectable } from "@angular/core";
import { environment } from "../../../environments/environment";

const SESSION_KEY = "step_tech_chat_session_v1";

/**
 * Talks to the n8n Chat Trigger webhook. Uses fetch() on purpose so the
 * global auth interceptor doesn't attach X-API-KEY — n8n cloud rejects
 * the CORS preflight when unexpected headers are present.
 */
@Injectable({ providedIn: "root" })
export class ChatService {
  private readonly url = environment.n8nChatUrl;

  sessionId(): string {
    let id = localStorage.getItem(SESSION_KEY);
    if (!id) {
      id = (crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`);
      localStorage.setItem(SESSION_KEY, id);
    }
    return id;
  }

  async send(message: string): Promise<string> {
    const res = await fetch(this.url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "sendMessage",
        sessionId: this.sessionId(),
        chatInput: message,
      }),
    });

    if (!res.ok) throw new Error(`Chat request failed (${res.status})`);

    const data = await res.json().catch(() => ({} as Record<string, unknown>));
    return (
      (data as any).output ??
      (data as any).text ??
      (data as any).message ??
      (data as any).response ??
      ""
    );
  }
}
