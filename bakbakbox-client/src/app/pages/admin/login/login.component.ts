import { Component, inject, signal } from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { AuthService } from '../../../core/services/auth.service';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';

interface ApiErrorShape {
  message?: string;
}

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCheckboxModule,
    MatIconModule,
    LoadingSpinnerComponent,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly route = inject(ActivatedRoute);

  readonly hidePassword = signal(true);
  readonly errorMessage = signal('');

  readonly loginForm = this.fb.nonNullable.group({
    email: [
      this.auth.getRememberedEmail(),
      [Validators.required, Validators.email],
    ],
    password: ['', [Validators.required, Validators.minLength(8)]],
    rememberMe: [!!this.auth.getRememberedEmail()],
  });

  readonly isLoading = this.auth.loading;

  togglePasswordVisibility(): void {
    this.hidePassword.update((hidden) => !hidden);
  }

  onSubmit(): void {
    this.errorMessage.set('');

    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    const { email, password, rememberMe } = this.loginForm.getRawValue();

    this.auth.login({ email, password, rememberMe }).subscribe({
      next: () => {
        const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
        this.auth.redirectAfterLogin(returnUrl ?? undefined);
      },
      error: (error: ApiErrorShape) => {
        this.errorMessage.set(
          error.message ?? 'Login failed. Please check your credentials.'
        );
      },
    });
  }

  getError(field: 'email' | 'password'): string {
    const control = this.loginForm.controls[field];

    if (!control.touched || !control.errors) {
      return '';
    }

    if (control.errors['required']) {
      return field === 'email' ? 'Email is required' : 'Password is required';
    }

    if (control.errors['email']) {
      return 'Enter a valid email address';
    }

    if (control.errors['minlength']) {
      return 'Password must be at least 8 characters';
    }

    return 'Invalid value';
  }
}
