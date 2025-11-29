import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  standalone: true,
  selector: 'app-login',
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  username = '';
  isLoading = false;
  error = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  login(): void {
    if (!this.username.trim()) {
      this.error = 'Please enter a username';
      return;
    }

    this.isLoading = true;
    this.error = '';

    this.authService.login(this.username.trim()).subscribe({
      next: () => {
        this.router.navigate(['/']);
      },
      error: (err) => {
        console.error('Login failed:', err);
        this.error = 'Login failed. Please try again.';
        this.isLoading = false;
      }
    });
  }

  onEnter(event: Event): void {
    event.preventDefault();
    this.login();
  }
}
