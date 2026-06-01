import {
  AfterViewChecked,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  ViewChild,
  inject,
  signal,
} from "@angular/core";
import { FormsModule } from "@angular/forms";
import { ChatService } from "../../core/services/chat.service";
import { TranslatePipe } from "../pipes/translate.pipe";

type Msg = { id: number; role: "user" | "bot" | "error"; text: string };

@Component({
  selector: "app-chat-widget",
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, TranslatePipe],
  template: `
    <div class="chat" [class.chat--open]="open()">
      @if (open()) {
        <div class="chat__panel" role="dialog" aria-label="Tech Shop Assistant">
          <header class="chat__head">
            <div class="chat__title">
              <span class="chat__dot" aria-hidden="true"></span>
              <span>{{ 'chat.title' | t }}</span>
            </div>
            <button type="button" class="chat__close" (click)="toggle()" [attr.aria-label]="'chat.close' | t">✕</button>
          </header>

          <div class="chat__body" #scroller>
            @if (messages().length === 0) {
              <div class="chat__welcome">
                <p class="chat__welcome-h">{{ 'chat.welcome.title' | t }}</p>
                <p class="chat__welcome-p">{{ 'chat.welcome.body' | t }}</p>
              </div>
            }
            @for (m of messages(); track m.id) {
              <div class="msg" [class]="'msg--' + m.role">
                <div class="msg__bubble">{{ m.text }}</div>
              </div>
            }
            @if (sending()) {
              <div class="msg msg--bot">
                <div class="msg__bubble msg__bubble--typing"><span></span><span></span><span></span></div>
              </div>
            }
          </div>

          <form class="chat__form" (ngSubmit)="send()">
            <input
              type="text"
              class="chat__input"
              [(ngModel)]="draft"
              name="draft"
              autocomplete="off"
              [placeholder]="'chat.placeholder' | t"
              [disabled]="sending()"
              (keydown.enter)="$event.preventDefault(); send()"
            />
            <button type="submit" class="chat__send" [disabled]="sending() || !draft.trim()" [attr.aria-label]="'chat.send' | t">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
              </svg>
            </button>
          </form>
        </div>
      }

      <button type="button" class="chat__fab" (click)="toggle()" [attr.aria-label]="(open() ? 'chat.close' : 'chat.open') | t">
        @if (open()) {
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        } @else {
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
        }
      </button>
    </div>
  `,
  styles: [`
    .chat { position: fixed; right: 1.2rem; bottom: 1.2rem; z-index: 1100; display: flex; flex-direction: column; align-items: flex-end; gap: .75rem; }

    .chat__fab {
      width: 52px; height: 52px; border-radius: 999px;
      border: 1px solid var(--color-border-strong);
      background: var(--color-text); color: var(--color-surface);
      display: grid; place-items: center; cursor: pointer;
      box-shadow: var(--shadow-md);
      transition: transform .25s var(--ease-out-quint), box-shadow .25s var(--ease-soft);
    }
    .chat__fab:hover { transform: translateY(-2px); box-shadow: var(--shadow-lg); }
    .chat__fab:focus-visible { outline: 2px solid var(--color-accent); outline-offset: 2px; }

    .chat__panel {
      width: min(94vw, 380px); height: min(72vh, 540px);
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-lg);
      display: flex; flex-direction: column; overflow: hidden;
      animation: chatRise .28s var(--ease-out-quint);
    }
    @keyframes chatRise { from { opacity: 0; transform: translateY(12px) scale(.98); } to { opacity: 1; transform: none; } }

    .chat__head {
      display: flex; align-items: center; justify-content: space-between;
      padding: .85rem 1rem; border-bottom: 1px solid var(--color-border);
      background: var(--color-elevated);
    }
    .chat__title { display: inline-flex; align-items: center; gap: .55rem; font-weight: 600; font-size: .95rem; color: var(--color-text); }
    .chat__dot { width: 8px; height: 8px; border-radius: 999px; background: var(--color-success); box-shadow: 0 0 0 4px oklch(0.55 0.10 145 / 0.18); }
    .chat__close {
      background: transparent; border: 0; color: var(--color-text-muted); cursor: pointer;
      font-size: .9rem; width: 28px; height: 28px; border-radius: 999px;
    }
    .chat__close:hover { background: var(--color-surface-2); color: var(--color-text); }

    .chat__body {
      flex: 1; overflow-y: auto; padding: 1rem;
      display: flex; flex-direction: column; gap: .55rem;
      background: var(--color-bg);
    }
    .chat__welcome { padding: .25rem .25rem 1rem; color: var(--color-text-soft); }
    .chat__welcome-h { font-weight: 600; color: var(--color-text); margin: 0 0 .25rem; font-size: .98rem; }
    .chat__welcome-p { margin: 0; font-size: .88rem; line-height: 1.45; color: var(--color-text-muted); }

    .msg { display: flex; }
    .msg--user { justify-content: flex-end; }
    .msg--bot, .msg--error { justify-content: flex-start; }
    .msg__bubble {
      max-width: 82%; padding: .6rem .8rem; border-radius: var(--radius-md);
      font-size: .9rem; line-height: 1.45; white-space: pre-wrap; word-wrap: break-word;
      border: 1px solid var(--color-border);
    }
    .msg--user .msg__bubble {
      background: var(--color-text); color: var(--color-surface);
      border-color: var(--color-text); border-bottom-right-radius: 4px;
    }
    .msg--bot .msg__bubble { background: var(--color-surface); color: var(--color-text); border-bottom-left-radius: 4px; }
    .msg--error .msg__bubble { background: oklch(0.97 0.02 25); color: var(--color-danger); border-color: oklch(0.85 0.06 25); }

    .msg__bubble--typing { display: inline-flex; gap: 4px; padding: .75rem .85rem; }
    .msg__bubble--typing span {
      width: 6px; height: 6px; border-radius: 999px; background: var(--color-text-muted);
      animation: typing 1.2s var(--ease-soft) infinite;
    }
    .msg__bubble--typing span:nth-child(2) { animation-delay: .15s; }
    .msg__bubble--typing span:nth-child(3) { animation-delay: .3s; }
    @keyframes typing { 0%, 60%, 100% { opacity: .3; transform: translateY(0); } 30% { opacity: 1; transform: translateY(-3px); } }

    .chat__form {
      display: flex; gap: .5rem; padding: .7rem .8rem;
      border-top: 1px solid var(--color-border); background: var(--color-surface);
    }
    .chat__input {
      flex: 1; padding: .65rem .85rem; border-radius: var(--radius-sm);
      border: 1px solid var(--color-border); background: var(--color-elevated);
      color: var(--color-text); font: inherit; font-size: .92rem;
    }
    .chat__input:focus { outline: 2px solid var(--color-accent); outline-offset: 1px; }
    .chat__input:disabled { opacity: .65; }

    .chat__send {
      width: 38px; height: 38px; border-radius: var(--radius-sm);
      background: var(--color-text); color: var(--color-surface);
      border: 0; cursor: pointer; display: grid; place-items: center;
      transition: opacity .2s var(--ease-soft);
    }
    .chat__send:disabled { opacity: .45; cursor: not-allowed; }
    .chat__send:not(:disabled):hover { background: var(--color-accent-strong); }

    @media (max-width: 480px) {
      .chat { right: .8rem; bottom: .8rem; }
      .chat__panel { height: min(78vh, 560px); }
    }
  `],
})
export class ChatWidgetComponent implements AfterViewChecked {
  private readonly chat = inject(ChatService);
  private readonly cdr = inject(ChangeDetectorRef);

  @ViewChild("scroller") private scroller?: ElementRef<HTMLDivElement>;

  readonly open = signal(false);
  readonly sending = signal(false);
  readonly messages = signal<Msg[]>([]);
  draft = "";

  private nextId = 1;
  private shouldScroll = false;

  toggle(): void {
    this.open.update((v) => !v);
  }

  async send(): Promise<void> {
    const text = this.draft.trim();
    if (!text || this.sending()) return;

    this.messages.update((m) => [...m, { id: this.nextId++, role: "user", text }]);
    this.draft = "";
    this.sending.set(true);
    this.shouldScroll = true;

    try {
      const reply = await this.chat.send(text);
      this.messages.update((m) => [
        ...m,
        { id: this.nextId++, role: "bot", text: reply || "…" },
      ]);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong.";
      this.messages.update((m) => [
        ...m,
        { id: this.nextId++, role: "error", text: message },
      ]);
    } finally {
      this.sending.set(false);
      this.shouldScroll = true;
      this.cdr.markForCheck();
    }
  }

  ngAfterViewChecked(): void {
    if (this.shouldScroll && this.scroller) {
      const el = this.scroller.nativeElement;
      el.scrollTop = el.scrollHeight;
      this.shouldScroll = false;
    }
  }
}
