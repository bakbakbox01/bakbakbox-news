import { Component, inject } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router, RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { filter, map, startWith } from 'rxjs';
import { AsyncPipe } from '@angular/common';

interface BreadcrumbItem {
  label: string;
  url?: string;
}

@Component({
  selector: 'app-breadcrumb',
  standalone: true,
  imports: [RouterLink, MatIconModule, AsyncPipe],
  template: `
    @if (breadcrumbs$ | async; as breadcrumbs) {
      @if (breadcrumbs.length && !(breadcrumbs.length === 1 && breadcrumbs[0].label === 'Dashboard')) {
        <nav aria-label="breadcrumb" class="breadcrumb-nav mb-3">
          <ol class="breadcrumb mb-0">
            <li class="breadcrumb-item">
              <a routerLink="/admin/dashboard">Dashboard</a>
            </li>
            @for (item of breadcrumbs; track item.label; let last = $last) {
              <li class="breadcrumb-item" [class.active]="last" [attr.aria-current]="last ? 'page' : null">
                @if (!last && item.url) {
                  <a [routerLink]="item.url">{{ item.label }}</a>
                } @else {
                  {{ item.label }}
                }
              </li>
            }
          </ol>
        </nav>
      }
    }
  `,
  styles: `
    .breadcrumb-nav {
      font-size: 0.875rem;
      overflow-x: auto;
      -webkit-overflow-scrolling: touch;
    }

    .breadcrumb {
      flex-wrap: nowrap;
      white-space: nowrap;
      margin-bottom: 0;
    }

    .breadcrumb-item {
      max-width: 160px;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  `,
})
export class BreadcrumbComponent {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly breadcrumbs$ = this.router.events.pipe(
    filter((event) => event instanceof NavigationEnd),
    startWith(null),
    map(() => this.buildBreadcrumbs(this.route.root))
  );

  private buildBreadcrumbs(
    route: ActivatedRoute,
    url = '',
    breadcrumbs: BreadcrumbItem[] = []
  ): BreadcrumbItem[] {
    const children = route.children;

    if (!children.length) {
      return breadcrumbs;
    }

    for (const child of children) {
      const routeUrl = child.snapshot.url.map((segment) => segment.path).join('/');
      const nextUrl = routeUrl ? `${url}/${routeUrl}` : url;
      const label = child.snapshot.data['breadcrumb'] as string | undefined;

      if (label) {
        breadcrumbs.push({ label, url: nextUrl });
      }

      return this.buildBreadcrumbs(child, nextUrl, breadcrumbs);
    }

    return breadcrumbs;
  }
}
