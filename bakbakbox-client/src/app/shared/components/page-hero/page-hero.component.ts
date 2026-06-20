import { Component, input } from '@angular/core';
import { fadeInUp } from '../../animations/public.animations';

export type PageHeroVariant =
  | 'breaking'
  | 'trending'
  | 'latest'
  | 'categories'
  | 'category'
  | 'about'
  | 'contact'
  | 'search'
  | 'article'
  | 'default';

@Component({
  selector: 'app-page-hero',
  standalone: true,
  animations: [fadeInUp],
  template: `
    <section class="page-hero" [class]="'page-hero--' + variant()">
      <div class="page-hero__bg" aria-hidden="true">
        <div class="page-hero__orb page-hero__orb--1"></div>
        <div class="page-hero__orb page-hero__orb--2"></div>
        <div class="page-hero__grid"></div>
      </div>

      <div class="page-hero__inner" @fadeInUp>
        @if (badge()) {
          <span class="page-hero__badge">
            @if (badgePulse()) {
              <span class="page-hero__badge-dot"></span>
            }
            {{ badge() }}
          </span>
        }

        @if (icon()) {
          <span class="page-hero__icon" aria-hidden="true">{{ icon() }}</span>
        }

        <h1 class="page-hero__title">{{ title() }}</h1>

        @if (subtitle()) {
          <p class="page-hero__subtitle">{{ subtitle() }}</p>
        }

        @if (meta()) {
          <p class="page-hero__meta">{{ meta() }}</p>
        }

        <ng-content />
      </div>
    </section>
  `,
  styles: `
    :host {
      display: block;
      margin: -1rem -0.75rem 2rem;
      overflow-x: clip;
      max-width: 100vw;
    }

    @media (min-width: 576px) {
      :host {
        margin: -1.5rem calc(-0.5 * var(--bs-gutter-x, 1.5rem)) 2rem;
      }
    }

    .page-hero {
      position: relative;
      overflow: hidden;
      padding: clamp(2.5rem, 6vw, 4rem) 1.5rem;
      color: #fff;
      text-align: center;

      &__bg {
        position: absolute;
        inset: 0;
      }

      &__orb {
        position: absolute;
        border-radius: 50%;
        filter: blur(70px);
        opacity: 0.4;
        animation: hero-float 9s ease-in-out infinite;

        &--1 {
          width: 320px;
          height: 320px;
          top: -80px;
          right: -60px;
        }

        &--2 {
          width: 260px;
          height: 260px;
          bottom: -60px;
          left: -40px;
          animation-delay: -4s;
        }
      }

      &__grid {
        position: absolute;
        inset: 0;
        background-image:
          linear-gradient(rgba(255, 255, 255, 0.04) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255, 255, 255, 0.04) 1px, transparent 1px);
        background-size: 40px 40px;
        mask-image: linear-gradient(to bottom, black 50%, transparent);
      }

      &__inner {
        position: relative;
        z-index: 1;
        max-width: 720px;
        margin: 0 auto;
      }

      &__badge {
        display: inline-flex;
        align-items: center;
        gap: 0.4rem;
        padding: 0.35rem 0.85rem;
        border-radius: 999px;
        font-size: 0.7rem;
        font-weight: 800;
        letter-spacing: 0.1em;
        text-transform: uppercase;
        background: rgba(255, 255, 255, 0.15);
        border: 1px solid rgba(255, 255, 255, 0.25);
        margin-bottom: 1rem;
        backdrop-filter: blur(8px);
      }

      &__badge-dot {
        width: 7px;
        height: 7px;
        border-radius: 50%;
        background: #fff;
        animation: hero-blink 1.2s ease-in-out infinite;
      }

      &__icon {
        display: block;
        font-size: clamp(2rem, 5vw, 2.75rem);
        margin-bottom: 0.75rem;
        animation: hero-icon-pop 0.6s cubic-bezier(0.4, 0, 0.2, 1) both;
      }

      &__title {
        font-size: clamp(1.75rem, 5vw, 2.75rem);
        font-weight: 800;
        letter-spacing: -0.03em;
        margin: 0 0 0.75rem;
        line-height: 1.15;
      }

      &__subtitle {
        font-size: clamp(1rem, 2.5vw, 1.15rem);
        opacity: 0.88;
        margin: 0;
        line-height: 1.6;
      }

      &__meta {
        margin: 0.75rem 0 0;
        font-size: 0.875rem;
        opacity: 0.7;
      }

      &--breaking {
        .page-hero__bg {
          background: linear-gradient(135deg, #450a0a 0%, #b91c1c 50%, #dc2626 100%);
        }
        .page-hero__orb--1 { background: #ef4444; }
        .page-hero__orb--2 { background: #f97316; }
      }

      &--trending {
        .page-hero__bg {
          background: linear-gradient(135deg, #431407 0%, #c2410c 45%, #f59e0b 100%);
        }
        .page-hero__orb--1 { background: #f59e0b; }
        .page-hero__orb--2 { background: #ef4444; }
      }

      &--latest {
        .page-hero__bg {
          background: linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #2563eb 100%);
        }
        .page-hero__orb--1 { background: #2563eb; }
        .page-hero__orb--2 { background: #7c3aed; }
      }

      &--categories,
      &--category {
        .page-hero__bg {
          background: linear-gradient(135deg, #2e1065 0%, #6d28d9 50%, #8b5cf6 100%);
        }
        .page-hero__orb--1 { background: #8b5cf6; }
        .page-hero__orb--2 { background: #ec4899; }
      }

      &--about {
        .page-hero__bg {
          background: linear-gradient(135deg, #1e1b4b 0%, #3730a3 50%, #4f46e5 100%);
        }
        .page-hero__orb--1 { background: #6366f1; }
        .page-hero__orb--2 { background: #818cf8; }
      }

      &--contact {
        .page-hero__bg {
          background: linear-gradient(135deg, #042f2e 0%, #0f766e 50%, #14b8a6 100%);
        }
        .page-hero__orb--1 { background: #14b8a6; }
        .page-hero__orb--2 { background: #06b6d4; }
      }

      &--search {
        .page-hero__bg {
          background: linear-gradient(135deg, #0f172a 0%, #334155 50%, #475569 100%);
        }
        .page-hero__orb--1 { background: #64748b; }
        .page-hero__orb--2 { background: #2563eb; }
      }

      &--article {
        .page-hero__bg {
          background: linear-gradient(135deg, #0f172a 0%, #1e293b 60%, #334155 100%);
        }
        .page-hero__orb--1 { background: #475569; }
        .page-hero__orb--2 { background: #2563eb; }
        text-align: left;

        .page-hero__inner {
          max-width: 900px;
        }
      }

      &--default {
        .page-hero__bg {
          background: linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #2563eb 100%);
        }
        .page-hero__orb--1 { background: #2563eb; }
        .page-hero__orb--2 { background: #7c3aed; }
      }
    }

    @keyframes hero-float {
      0%, 100% { transform: translate(0, 0); }
      50% { transform: translate(16px, -16px); }
    }

    @keyframes hero-blink {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.3; }
    }

    @keyframes hero-icon-pop {
      from { transform: scale(0.5); opacity: 0; }
      to { transform: scale(1); opacity: 1; }
    }

    @media (prefers-reduced-motion: reduce) {
      .page-hero__orb,
      .page-hero__badge-dot,
      .page-hero__icon {
        animation: none;
      }
    }
  `,
})
export class PageHeroComponent {
  readonly variant = input<PageHeroVariant>('default');
  readonly title = input.required<string>();
  readonly subtitle = input('');
  readonly meta = input('');
  readonly icon = input('');
  readonly badge = input('');
  readonly badgePulse = input(false);
}
