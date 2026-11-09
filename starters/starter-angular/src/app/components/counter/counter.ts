import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-counter',
  template: `<button type="button" (click)="increment()">Count is {{ count() }}</button>`,
  styleUrl: './counter.css',
})
export class Counter {
  protected readonly count = signal(0);

  protected increment(): void {
    this.count.update((value) => value + 1);
  }
}
