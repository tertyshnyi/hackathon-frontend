import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-modal',
  standalone: true,
  template: `<div class="modal"><ng-content></ng-content></div>`
})
export class ModalComponent {
  @Input() title = '';
}
