import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    title: 'Home',
    loadComponent: () => import('./pages/home/home').then((m) => m.Home),
  },
  {
    path: 'about',
    title: 'About',
    loadComponent: () => import('./pages/about/about').then((m) => m.About),
  },
  {
    path: '**',
    title: 'Page not found',
    loadComponent: () => import('./pages/not-found/not-found').then((m) => m.NotFound),
  },
];
