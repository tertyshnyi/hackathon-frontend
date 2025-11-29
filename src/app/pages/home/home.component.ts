import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HistoryService } from '../../core/services/history.service';
import { HistoryItem } from '../../core/models/history.model';
import { LocationIconComponent } from '../../shared/components/icons/location-icon.component';
import { InputComponent } from '../../shared/components/input/input.component';

@Component({
  standalone: true,
  selector: 'app-home',
  imports: [
    CommonModule, 
    FormsModule, 
    LocationIconComponent,
    InputComponent
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  userInput = '';
  selectedItem: HistoryItem | null = null;
  isSidebarOpen = false;
  isLoading = true;
  historyItems: HistoryItem[] = [];

  constructor(private historyService: HistoryService) {}

  ngOnInit(): void {
    this.loadHistory();
  }

  loadHistory(): void {
    this.isLoading = true;
    this.historyService.getHistory().subscribe({
      next: (items) => {
        this.historyItems = items;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Failed to load history:', error);
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

  sendMessage(): void {
    if (this.userInput.trim()) {
      const newItem: HistoryItem = {
        id: Date.now(),
        title: this.userInput.substring(0, 40) + (this.userInput.length > 40 ? '...' : ''),
        query: this.userInput,
        date: new Date()
      };
      this.historyItems.unshift(newItem);
      this.selectedItem = newItem;
      this.userInput = '';
    }
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
}
