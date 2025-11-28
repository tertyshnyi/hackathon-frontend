import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `
    <div style="padding:16px">
      <h1>Hackathon 2025</h1>
      <router-outlet></router-outlet>
    </div>
  `
})
export class AppComponent {}
