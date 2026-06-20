import { Component, inject, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { AuthService } from '../../../core/services/auth.service';
import { NavItem } from '../../../core/models/nav-item.model';

@Component({
  selector: 'app-admin-header',
  standalone: true,
  imports: [RouterLink, MatToolbarModule, MatButtonModule, MatIconModule],
  templateUrl: './admin-header.component.html',
  styleUrl: './admin-header.component.scss',
})
export class AdminHeaderComponent {
  private readonly auth = inject(AuthService);

  readonly actions = input<NavItem[]>([]);
  readonly menuToggle = output<void>();

  readonly adminName = this.auth.fullName;

  onLogout(): void {
    this.auth.logout().subscribe();
  }
}
