import { Component, Input } from '@angular/core';

@Component({
  standalone: true,
  selector: 'app-location-icon',
  template: `
    <svg 
      [attr.width]="size" 
      [attr.height]="size" 
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg">
      <path 
        d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" 
        stroke="currentColor" 
        [attr.stroke-width]="strokeWidth" 
        stroke-linecap="round" 
        stroke-linejoin="round"/>
      <circle 
        cx="12" 
        cy="10" 
        r="3" 
        stroke="currentColor" 
        [attr.stroke-width]="strokeWidth" 
        stroke-linecap="round" 
        stroke-linejoin="round"/>
    </svg>
  `,
  styles: [`
    :host {
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }
  `]
})
export class LocationIconComponent {
  @Input() size: number = 24;
  @Input() strokeWidth: number = 2;
}

