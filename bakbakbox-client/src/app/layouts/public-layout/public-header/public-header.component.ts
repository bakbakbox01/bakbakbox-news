import { Component, inject, input } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NavItem } from '../../../core/models/nav-item.model';
import { BrandLogoComponent } from '../../../shared/components/brand-logo/brand-logo.component';

@Component({
  selector: 'app-public-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, ReactiveFormsModule, BrandLogoComponent],
  templateUrl: './public-header.component.html',
  styleUrl: './public-header.component.scss',
})
export class PublicHeaderComponent {
  private readonly router = inject(Router);

  readonly navItems = input.required<NavItem[]>();
  readonly brandName = input('Bak Bak Box News');

  readonly searchControl = new FormControl('', { nonNullable: true });

  onSearch(): void {
    const q = this.searchControl.value.trim();
    if (q) {
      void this.router.navigate(['/search'], { queryParams: { q } });
    }
  }
}
