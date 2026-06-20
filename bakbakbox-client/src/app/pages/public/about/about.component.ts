import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SeoService } from '../../../core/services/seo.service';
import { BrandLogoComponent } from '../../../shared/components/brand-logo/brand-logo.component';
import { PageHeroComponent } from '../../../shared/components/page-hero/page-hero.component';
import { fadeInUp, listStagger } from '../../../shared/animations/public.animations';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [RouterLink, BrandLogoComponent, PageHeroComponent],
  templateUrl: './about.component.html',
  styleUrl: './about.component.scss',
  animations: [fadeInUp, listStagger],
})
export class AboutComponent implements OnInit {
  private readonly seo = inject(SeoService);

  readonly values = [
    { icon: '✓', title: 'Accuracy First', desc: 'Every story verified before it reaches you.' },
    { icon: '⚡', title: 'Speed Matters', desc: 'Breaking news delivered as events unfold.' },
    { icon: '🌍', title: 'Global Reach', desc: 'Stories from every corner that matters.' },
    { icon: '💬', title: 'Reader Voice', desc: 'News that sparks conversation and debate.' },
  ];

  readonly coverage = [
    'Breaking news as it happens',
    'Trending stories readers care about',
    'Category-based coverage for easy browsing',
    'In-depth articles from our editorial team',
  ];

  ngOnInit(): void {
    this.seo.updateTags({
      title: 'About Us',
      description: 'Learn about Bak Bak Box News — our mission, values, and commitment to quality journalism.',
    });
  }
}
