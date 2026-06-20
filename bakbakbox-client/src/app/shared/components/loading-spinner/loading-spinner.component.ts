import { Component, input, booleanAttribute } from '@angular/core';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  templateUrl: './loading-spinner.component.html',
  styleUrl: './loading-spinner.component.scss',
})
export class LoadingSpinnerComponent {
  readonly diameter = input(72);
  readonly message = input('');
  readonly overlay = input(false, { transform: booleanAttribute });
}
