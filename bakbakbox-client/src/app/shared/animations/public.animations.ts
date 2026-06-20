import {
  animate,
  query,
  stagger,
  style,
  transition,
  trigger,
} from '@angular/animations';

export const fadeInUp = trigger('fadeInUp', [
  transition(':enter', [
    style({ opacity: 0, transform: 'translateY(24px)' }),
    animate('450ms cubic-bezier(0.4, 0, 0.2, 1)', style({ opacity: 1, transform: 'translateY(0)' })),
  ]),
]);

export const fadeIn = trigger('fadeIn', [
  transition(':enter', [
    style({ opacity: 0 }),
    animate('350ms ease-out', style({ opacity: 1 })),
  ]),
]);

export const scaleIn = trigger('scaleIn', [
  transition(':enter', [
    style({ opacity: 0, transform: 'scale(0.92)' }),
    animate('400ms cubic-bezier(0.4, 0, 0.2, 1)', style({ opacity: 1, transform: 'scale(1)' })),
  ]),
]);

export const listStagger = trigger('listStagger', [
  transition('* => *', [
    query(
      ':enter',
      [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        stagger(70, [
          animate(
            '400ms cubic-bezier(0.4, 0, 0.2, 1)',
            style({ opacity: 1, transform: 'translateY(0)' })
          ),
        ]),
      ],
      { optional: true }
    ),
  ]),
]);

export const slideInRight = trigger('slideInRight', [
  transition(':enter', [
    style({ opacity: 0, transform: 'translateX(28px)' }),
    animate('550ms 200ms cubic-bezier(0.4, 0, 0.2, 1)', style({ opacity: 1, transform: 'translateX(0)' })),
  ]),
]);

export const pageEnter = trigger('pageEnter', [
  transition(':enter', [
    query(
      '.public-page__body',
      [
        style({ opacity: 0, transform: 'translateY(12px)' }),
        animate('500ms 150ms ease-out', style({ opacity: 1, transform: 'translateY(0)' })),
      ],
      { optional: true }
    ),
  ]),
]);
