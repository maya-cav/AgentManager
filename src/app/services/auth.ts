import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from './api';

@Injectable({
  providedIn: 'root',
})
export class AuthService {

  constructor(private apiService: ApiService, private router: Router) { }

  async login(username: string, password: string, company: string): Promise<{ ok: boolean; error?: string }> {
    sessionStorage.setItem('username', username);
    if (company) sessionStorage.setItem('mr', company);
    const url = this.apiService.mcall({ routine: 'DECORD', label: 'LOGIN' });
    const res = await this.apiService.post(url, { USER: username, PASS: password, MR: company });
    if (res.ok === true || res.ok === 'true') {
      localStorage.setItem('username', username);
      localStorage.setItem('token', res['ôïëåî'] || res.token);
      if (res['MR']) sessionStorage.setItem('mr', res['MR']);
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
