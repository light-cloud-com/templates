import { Component } from '@angular/core';

@Component({
  selector: 'app-about',
  template: `
    <h1>About</h1>
    <p>
      An Angular 21 single-page app with standalone components. Routes live in
      <code>src/app/app.routes.ts</code>, pages in <code>src/app/pages</code> and shared pieces in
      <code>src/app/components</code>.
    </p>
  `,
})
export class About {}
