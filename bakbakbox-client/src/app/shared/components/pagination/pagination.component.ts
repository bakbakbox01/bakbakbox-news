import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-pagination',
  standalone: true,
  templateUrl: './pagination.component.html',
  styleUrl: './pagination.component.scss',
})
export class PaginationComponent {
  readonly total = input.required<number>();
  readonly page = input.required<number>();
  readonly limit = input(10);

  readonly pageChange = output<number>();

  get totalPages(): number {
    return Math.ceil(this.total() / this.limit()) || 1;
  }

  get pages(): number[] {
    const total = this.totalPages;
    const current = this.page();
    const delta = 2;
    const range: number[] = [];

    for (let i = Math.max(1, current - delta); i <= Math.min(total, current + delta); i++) {
      range.push(i);
    }

    return range;
  }

  goTo(page: number): void {
    if (page >= 1 && page <= this.totalPages && page !== this.page()) {
      this.pageChange.emit(page);
    }
  }
}
