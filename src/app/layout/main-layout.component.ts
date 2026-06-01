import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './header/header.component';
import { FooterComponent } from './footer/footer.component';
import { ToastContainerComponent } from '../shared/components/toast-container.component';
import { DotGridComponent } from '../shared/components/dot-grid.component';
import { ChatWidgetComponent } from '../shared/components/chat-widget.component';
import { LoadingService } from '../core/services/loading.service';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, HeaderComponent, FooterComponent, ToastContainerComponent, DotGridComponent, ChatWidgetComponent],
  template: `
    <app-dot-grid />
    <div class="layout">
      <app-header />
      @if (loading.isLoading()) { <div class="topbar" aria-hidden="true"></div> }
      <main id="main" class="main"><router-outlet /></main>
      <app-footer />
    </div>
    <app-toast-container />
    <app-chat-widget />
  `,
  styles: [`
    :host { display: block; min-height: 100vh; }

    /* Page content sits above the fixed dot-grid canvas. */
    .layout { position: relative; z-index: 1; display: flex; flex-direction: column; min-height: 100vh; }
    .main { flex: 1; }

    .topbar {
      position: fixed; top: 0; left: 0; right: 0; height: 2px; z-index: 60;
      background: linear-gradient(90deg, transparent, var(--color-accent), transparent);
      background-size: 60% 100%; background-repeat: no-repeat;
      animation: topbarSlide 1.4s linear infinite;
    }
    @keyframes topbarSlide {
      0%   { background-position: -60% 0; }
      100% { background-position: 160% 0; }
    }
  `]
})
export class MainLayoutComponent {
  readonly loading = inject(LoadingService);
}
