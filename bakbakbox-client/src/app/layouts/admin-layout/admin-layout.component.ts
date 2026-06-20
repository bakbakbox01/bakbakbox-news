import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { ADMIN_HEADER_ACTIONS, ADMIN_NAV_ITEMS } from '../../core/constants/admin-nav.constants';
import { AdminHeaderComponent } from './admin-header/admin-header.component';
import { AdminSidebarComponent } from './admin-sidebar/admin-sidebar.component';
import { BreadcrumbComponent } from '../../shared/components/breadcrumb/breadcrumb.component';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [
    RouterOutlet,
    MatSidenavModule,
    AdminHeaderComponent,
    AdminSidebarComponent,
    BreadcrumbComponent,
  ],
  templateUrl: './admin-layout.component.html',
  styleUrl: './admin-layout.component.scss',
})
export class AdminLayoutComponent {
  readonly navItems = ADMIN_NAV_ITEMS;
  readonly headerActions = ADMIN_HEADER_ACTIONS;
  readonly sidenavOpen = signal(false);

  toggleSidenav(): void {
    this.sidenavOpen.update((open) => !open);
  }

  closeSidenav(): void {
    this.sidenavOpen.set(false);
  }
}
