import { Component, input } from '@angular/core';

@Component({
  selector: 'app-page-header',
  standalone: true,
  template: `
    <div class="page-header d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
      <div>
        <h1 class="page-header__title h4 mb-1">{{ title() }}</h1>
        @if (subtitle()) {
          <p class="page-header__subtitle text-muted mb-0">{{ subtitle() }}</p>
        }
      </div>
      <div class="page-header__actions">
        <ng-content />
      </div>
    </div>
  `,
  styles: `
    .page-header__title {
      font-weight: 600;
      font-size: clamp(1.15rem, 4vw, 1.5rem);
      word-break: break-word;
    }

    .page-header__subtitle {
      font-size: 0.9rem;
    }

    .page-header__actions {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      width: 100%;
    }

    @media (min-width: 576px) {
      .page-header__actions {
        width: auto;
      }
    }

    @media (max-width: 575.98px) {
      .page-header__actions ::ng-deep .mat-mdc-button-base,
      .page-header__actions ::ng-deep a.mat-mdc-button-base {
        width: 100%;
        justify-content: center;
      }
    }
  `,
})
export class PageHeaderComponent {
  readonly title = input.required<string>();
  readonly subtitle = input('');
}
