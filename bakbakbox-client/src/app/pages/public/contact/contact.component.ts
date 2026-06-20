import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { SeoService } from '../../../core/services/seo.service';
import { PageHeroComponent } from '../../../shared/components/page-hero/page-hero.component';
import { fadeInUp, scaleIn } from '../../../shared/animations/public.animations';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [ReactiveFormsModule, PageHeroComponent],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.scss',
  animations: [fadeInUp, scaleIn],
})
export class ContactComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly seo = inject(SeoService);

  readonly submitted = signal(false);

  readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    subject: ['', Validators.required],
    message: ['', [Validators.required, Validators.minLength(10)]],
  });

  readonly contactCards = [
    { icon: '✉️', title: 'General', value: 'news@bakbakbox.com' },
    { icon: '📝', title: 'Editorial', value: 'editorial@bakbakbox.com' },
    { icon: '🕐', title: 'Hours', value: 'Mon–Fri, 9am–6pm' },
  ];

  ngOnInit(): void {
    this.seo.updateTags({
      title: 'Contact Us',
      description: 'Get in touch with the Bak Bak Box News editorial team.',
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.submitted.set(true);
  }
}
