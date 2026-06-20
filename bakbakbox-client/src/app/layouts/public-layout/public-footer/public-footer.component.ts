import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NavItem } from '../../../core/models/nav-item.model';

@Component({
  selector: 'app-public-footer',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './public-footer.component.html',
  styleUrl: './public-footer.component.scss',
})
export class PublicFooterComponent {
  readonly footerLinks = input.required<NavItem[]>();
  readonly brandName = input('Bak Bak Box News');
  readonly year = new Date().getFullYear();
}
