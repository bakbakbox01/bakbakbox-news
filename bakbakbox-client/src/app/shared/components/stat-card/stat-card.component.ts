import { Component, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-stat-card',
  standalone: true,
  imports: [MatIconModule],
  template: `
    <div class="stat-card card border-0 shadow-sm h-100">
      <div class="card-body d-flex align-items-center gap-3">
        <div class="stat-card__icon" [style.background]="color()">
          <mat-icon>{{ icon() }}</mat-icon>
        </div>
        <div>
          <p class="stat-card__label mb-1">{{ label() }}</p>
          <h3 class="stat-card__value mb-0">{{ value() }}</h3>
        </div>
      </div>
    </div>
  `,
  styles: `
    .stat-card__icon {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;

      mat-icon {
        font-size: 24px;
        width: 24px;
        height: 24px;
      }
    }

    .stat-card__label {
      font-size: 0.875rem;
      color: #6c757d;
      margin: 0;
    }

    .stat-card__value {
      font-size: 1.75rem;
      font-weight: 700;
    }
  `,
})
export class StatCardComponent {
  readonly label = input.required<string>();
  readonly value = input.required<string | number>();
  readonly icon = input.required<string>();
  readonly color = input('#3f51b5');
}
