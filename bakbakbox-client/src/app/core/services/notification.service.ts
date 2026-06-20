import { Injectable, inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly snackBar = inject(MatSnackBar);

  success(message: string, duration = 4000): void {
    this.snackBar.open(message, 'Close', {
      duration,
      panelClass: ['snackbar-success'],
      horizontalPosition: 'end',
      verticalPosition: 'top',
    });
  }

  error(message: string, duration = 6000): void {
    this.snackBar.open(message, 'Close', {
      duration,
      panelClass: ['snackbar-error'],
      horizontalPosition: 'end',
      verticalPosition: 'top',
    });
  }

  info(message: string, duration = 4000): void {
    this.snackBar.open(message, 'Close', {
      duration,
      panelClass: ['snackbar-info'],
      horizontalPosition: 'end',
      verticalPosition: 'top',
    });
  }
}
