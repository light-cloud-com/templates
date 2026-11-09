import { TestBed } from '@angular/core/testing';
import { Counter } from './counter';

describe('Counter', () => {
  it('counts clicks', async () => {
    const fixture = TestBed.createComponent(Counter);
    await fixture.whenStable();
    const button = (fixture.nativeElement as HTMLElement).querySelector('button')!;
    expect(button.textContent).toContain('Count is 0');

    button.click();
    await fixture.whenStable();
    expect(button.textContent).toContain('Count is 1');
  });
});
