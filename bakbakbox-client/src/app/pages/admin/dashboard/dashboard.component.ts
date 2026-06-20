import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { DashboardService } from '../../../core/services/dashboard.service';
import { NotificationService } from '../../../core/services/notification.service';
import { DashboardOverview } from '../../../core/models/dashboard.model';
import { StatCardComponent } from '../../../shared/components/stat-card/stat-card.component';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    RouterLink,
    DatePipe,
    MatButtonModule,
    MatCardModule,
    MatChipsModule,
    MatIconModule,
    MatTableModule,
    StatCardComponent,
    PageHeaderComponent,
    LoadingSpinnerComponent,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit {
  private readonly dashboardService = inject(DashboardService);
  private readonly notify = inject(NotificationService);

  readonly loading = signal(true);
  readonly overview = signal<DashboardOverview | null>(null);

  readonly activityColumns = ['type', 'title', 'timestamp'];

  ngOnInit(): void {
    this.loadOverview();
  }

  loadOverview(): void {
    this.loading.set(true);
    this.dashboardService.getOverview().subscribe({
      next: (data) => {
        this.overview.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.notify.error(err.message ?? 'Failed to load dashboard');
        this.loading.set(false);
      },
    });
  }

  activityLabel(type: string): string {
    return type.replace(/_/g, ' ');
  }
}
