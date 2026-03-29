import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from './api';

@Injectable({
  providedIn: 'root',
})
export class AuthService {

  constructor(private apiService: ApiService, private router: Router) { }

  async login(username: string, password: string): Promise<{ ok: boolean; error?: string }> {
    sessionStorage.setItem('username', username);
    sessionStorage.setItem('password', password);
    const mr = sessionStorage.getItem('mr') || '';
    const url = this.apiService.mcall({ routine: 'DECORD', label: 'LOGIN' });
    const res = await this.apiService.post(url, { USER: username, PASS: password, MR: mr });
    if (res.ok === true || res.ok === 'true') {
      localStorage.setItem('username', username);
      localStorage.setItem('token', res['ôïëåî'] || res.token);
      const pageRouteMap: Record<string, string> = {
        'orders_grid.html': '/orders',
      };
      const route = pageRouteMap[res.nextPage] ?? res.nextPage;
      this.router.navigateByUrl(route);
      return { ok: true };
    }
    return { ok: false, error: res.error || 'אימות משתמש נכשל' };
  }

  setCompany(mr: string) {
    sessionStorage.setItem('mr', mr);
  }

  getStoredUsername(): string {
    return localStorage.getItem('username') || '';
  }

  getStoredCompany(): string {
    return sessionStorage.getItem('mr') || '';
  }
}
