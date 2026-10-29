import { Routes } from '@angular/router';
import { Login } from './components/login/login';
import { Orders } from './components/orders/orders';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: Login },
  { path: 'orders', component: Orders, canActivate: [authGuard] },
  { path: '**', redirectTo: 'login' }
];
