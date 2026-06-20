import { Component, input, output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { NavItem } from '../../../core/models/nav-item.model';

@Component({
  selector: 'app-admin-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, MatIconModule, MatListModule],
  templateUrl: './admin-sidebar.component.html',
  styleUrl: './admin-sidebar.component.scss',
})
export class AdminSidebarComponent {
  readonly navItems = input.required<NavItem[]>();
  readonly brandName = input('Bak Bak Box Admin');
  readonly navClicked = output<void>();
}
