import { Component } from '@angular/core';
import { Counter } from '../../components/counter/counter';

@Component({
  selector: 'app-home',
  imports: [Counter],
  template: `
    <h1>Welcome to Angular</h1>
    <p>Your app is ready to deploy on Light Cloud.</p>
    <app-counter />
    <p>Edit <code>src/app/pages/home/home.ts</code> and save to see the change.</p>
  `,
})
export class Home {}
