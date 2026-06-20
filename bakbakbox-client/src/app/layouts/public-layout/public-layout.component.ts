import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { PUBLIC_FOOTER_LINKS, PUBLIC_NAV_ITEMS } from '../../core/constants/public-nav.constants';
import { PublicFooterComponent } from './public-footer/public-footer.component';
import { PublicHeaderComponent } from './public-header/public-header.component';

@Component({
  selector: 'app-public-layout',
  standalone: true,
  imports: [RouterOutlet, PublicHeaderComponent, PublicFooterComponent],
  templateUrl: './public-layout.component.html',
  styleUrl: './public-layout.component.scss',
})
export class PublicLayoutComponent {
  readonly navItems = PUBLIC_NAV_ITEMS;
  readonly footerLinks = PUBLIC_FOOTER_LINKS;
}
