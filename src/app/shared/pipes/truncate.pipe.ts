import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'truncate', standalone: true })
export class TruncatePipe implements PipeTransform {
  transform(value: string, length = 50) {
    if (!value) return value;
    return value.length > length ? value.slice(0, length) + '…' : value;
  }
}
