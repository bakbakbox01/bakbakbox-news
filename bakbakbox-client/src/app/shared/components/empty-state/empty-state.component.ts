import { Component, input } from '@angular/core';
import { scaleIn } from '../../animations/public.animations';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  animations: [scaleIn],
  template: `
    <div class="empty-state" @scaleIn>
      <span class="empty-state__icon" aria-hidden="true">{{ icon() }}</span>
      <h2 class="empty-state__title">{{ title() }}</h2>
      <p class="empty-state__text">{{ message() }}</p>
    </div>
  `,
  styles: `
    .empty-state {
      text-align: center;
      padding: 3rem 1.5rem;
      background: #fff;
      border-radius: 1.25rem;
      border: 1px dashed #cbd5e1;
      box-shadow: 0 4px 24px rgba(15, 23, 42, 0.06);
    }

    .empty-state__icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 4rem;
      height: 4rem;
      font-size: 2rem;
      background: linear-gradient(135deg, #eff6ff, #dbeafe);
      border-radius: 1rem;
      margin-bottom: 1rem;
    }

    .empty-state__title {
      font-size: 1.15rem;
      font-weight: 700;
      color: #0f172a;
      margin: 0 0 0.5rem;
    }

    .empty-state__text {
      color: #64748b;
      margin: 0 auto;
      max-width: 360px;
      line-height: 1.6;
    }
  `,
})
export class EmptyStateComponent {
  readonly icon = input('📭');
  readonly title = input('Nothing here yet');
  readonly message = input('Check back soon for new content.');
}
