import { Component, input } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { RouterLink } from '@angular/router';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-brand-logo',
  standalone: true,
  imports: [RouterLink, NgTemplateOutlet],
  template: `
    @if (link()) {
      <a
        class="brand-logo"
        [class.brand-logo--sm]="size() === 'sm'"
        [class.brand-logo--md]="size() === 'md'"
        [class.brand-logo--lg]="size() === 'lg'"
        [class.brand-logo--light]="variant() === 'light'"
        [class.brand-logo--dark]="variant() === 'dark'"
        routerLink="/"
        [attr.aria-label]="appName"
      >
        <ng-container *ngTemplateOutlet="logoContent" />
      </a>
    } @else {
      <span
        class="brand-logo"
        [class.brand-logo--sm]="size() === 'sm'"
        [class.brand-logo--md]="size() === 'md'"
        [class.brand-logo--lg]="size() === 'lg'"
        [class.brand-logo--light]="variant() === 'light'"
        [class.brand-logo--dark]="variant() === 'dark'"
        aria-hidden="true"
      >
        <ng-container *ngTemplateOutlet="logoContent" />
      </span>
    }

    <ng-template #logoContent>
      <span class="brand-logo__mark" aria-hidden="true">
        <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="4" y="8" width="40" height="32" rx="6" class="brand-logo__box" />
          <path d="M12 18h24M12 24h18M12 30h14" class="brand-logo__lines" stroke-width="2.5" stroke-linecap="round" />
          <circle cx="36" cy="14" r="6" class="brand-logo__pulse" />
          <path d="M33.5 14h5M36 11.5v5" class="brand-logo__plus" stroke-width="1.5" stroke-linecap="round" />
        </svg>
      </span>
      <span class="brand-logo__text">
        <span class="brand-logo__name">{{ appName }}</span>
        @if (showTagline()) {
          <span class="brand-logo__tagline">Stories that matter</span>
        }
      </span>
    </ng-template>
  `,
  styles: `
    .brand-logo {
      display: inline-flex;
      align-items: center;
      gap: 0.75rem;
      text-decoration: none;
      transition: transform 0.25s ease;

      &:hover {
        transform: translateY(-1px);
      }

      &__mark {
        display: flex;
        flex-shrink: 0;

        svg {
          display: block;
          width: 100%;
          height: 100%;
        }
      }

      &__box {
        fill: url(#brandGradient);
        fill: #2563eb;
        filter: drop-shadow(0 4px 12px rgba(37, 99, 235, 0.35));
      }

      &__lines {
        stroke: rgba(255, 255, 255, 0.92);
      }

      &__pulse {
        fill: #ef4444;
        animation: brand-pulse 2s ease-in-out infinite;
      }

      &__plus {
        stroke: #fff;
      }

      &__text {
        display: flex;
        flex-direction: column;
        line-height: 1.15;
      }

      &__name {
        font-weight: 800;
        letter-spacing: -0.03em;
      }

      &__tagline {
        font-size: 0.65em;
        font-weight: 500;
        opacity: 0.75;
        letter-spacing: 0.04em;
        text-transform: uppercase;
      }

      &--sm .brand-logo__mark {
        width: 32px;
        height: 32px;
      }

      &--sm .brand-logo__name {
        font-size: 1rem;
      }

      &--md .brand-logo__mark {
        width: 40px;
        height: 40px;
      }

      &--md .brand-logo__name {
        font-size: 1.15rem;
      }

      &--lg .brand-logo__mark {
        width: 72px;
        height: 72px;
      }

      &--lg .brand-logo__name {
        font-size: clamp(1.75rem, 4vw, 2.75rem);
      }

      &--lg .brand-logo__tagline {
        font-size: 0.55em;
        margin-top: 0.25rem;
      }

      &--light {
        color: #fff;

        .brand-logo__box {
          fill: #fff;
          filter: drop-shadow(0 4px 20px rgba(255, 255, 255, 0.2));
        }

        .brand-logo__lines {
          stroke: #1e3a8a;
        }

        .brand-logo__pulse {
          fill: #fbbf24;
        }

        .brand-logo__plus {
          stroke: #1e3a8a;
        }
      }

      &--dark {
        color: #0f172a;

        .brand-logo__name {
          background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 50%, #7c3aed 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
      }
    }

    @keyframes brand-pulse {
      0%,
      100% {
        transform: scale(1);
        opacity: 1;
      }
      50% {
        transform: scale(1.12);
        opacity: 0.85;
      }
    }
  `,
})
export class BrandLogoComponent {
  readonly size = input<'sm' | 'md' | 'lg'>('md');
  readonly variant = input<'light' | 'dark'>('dark');
  readonly showTagline = input(false);
  readonly link = input(true);

  readonly appName = environment.appName;
}
