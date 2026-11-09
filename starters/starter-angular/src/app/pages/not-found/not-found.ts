import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found',
  imports: [RouterLink],
  template: `
    <h1>Page not found</h1>
    <p><a routerLink="/">Back to the home page</a></p>
  `,
})
export class NotFound {}
