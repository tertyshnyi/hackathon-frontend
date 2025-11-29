import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HistoryService } from '../../core/services/history.service';
import { AuthService } from '../../core/services/auth.service';
import { HistoryItem } from '../../core/models/history.model';
import { LocationIconComponent } from '../../shared/components/icons/location-icon.component';

@Component({
  standalone: true,
  selector: 'app-home',
  imports: [
    CommonModule, 
    FormsModule, 
    LocationIconComponent
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  userInput = '';
  selectedItem: HistoryItem | null = null;
  isSidebarOpen = false;
  isUserMenuOpen = false;
  isLoading = true;
  isSending = false;
  historyItems: HistoryItem[] = [];

  constructor(
    private historyService: HistoryService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadHistory();
  }

  private getUserId(): string {
    const user = this.authService.getCurrentUser();
    return user?.id?.toString() || '';
  }

  get username(): string {
    return this.authService.getCurrentUser()?.name || '';
  }

  loadHistory(): void {
    const userId = this.getUserId();
    if (!userId) {
      this.isLoading = false;
      return;
    }

    this.isLoading = true;
    this.historyService.getHistory(userId).subscribe({
      next: (items) => {
        this.historyItems = items;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Failed to load history:', error);
        this.historyItems = [];
        this.isLoading = false;
      }
    });
  }

  selectItem(item: HistoryItem): void {
    this.selectedItem = item;
  }

  clearSelection(): void {
    this.selectedItem = null;
    this.userInput = '';
  }

  toggleSidebar(): void {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  closeSidebar(): void {
    this.isSidebarOpen = false;
  }

  toggleUserMenu(): void {
    this.isUserMenuOpen = !this.isUserMenuOpen;
  }

  closeUserMenu(): void {
    this.isUserMenuOpen = false;
  }

  sendMessage(): void {
    const query = this.userInput.trim();
    if (!query || this.isSending) return;

    const userId = this.getUserId();
    if (!userId) return;

    this.isSending = true;

    this.historyService.createSearch(userId, query).subscribe({
      next: (newItem) => {
        this.historyItems.unshift(newItem);
        this.selectedItem = newItem;
        this.userInput = '';
        this.isSending = false;
      },
      error: (error) => {
        console.error('Failed to create search:', error);
        this.isSending = false;
      }
    });
  }

  onEnter(event: Event): void {
    const keyEvent = event as KeyboardEvent;
    if (!keyEvent.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  autoResize(event: Event): void {
    const textarea = event.target as HTMLTextAreaElement;
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 200) + 'px';
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  getItemTitle(item: HistoryItem): string {
    return item.query.length > 40 
      ? item.query.substring(0, 40) + '...' 
      : item.query;
  }
}
