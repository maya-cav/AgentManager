import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from './api';
import { ConfigService } from './config';

@Injectable({
  providedIn: 'root',
})
export class AuthService {

  constructor(private apiService: ApiService, private configService: ConfigService, private router: Router) { }

  async login(username: string, password: string, company: string): Promise<{ ok: boolean; error?: string }> {
    const url = this.apiService.mcall({ routine: 'DECORD', label: 'LOGIN' });
    const res = await this.apiService.post(url, { USER: username, PASS: password, MR: company });
    if ((res.ok === true || res.ok === 'true') && res.token) {
      localStorage.setItem('username', username);
      localStorage.setItem('company', company);
      localStorage.setItem('token', res.token);
      const pageRouteMap: Record<string, string> = {
        'orders_grid.html': '/orders',
      };
      const route = pageRouteMap[res.nextPage] ?? res.nextPage;
      this.router.navigateByUrl(route);
      return { ok: true };
    }
    return { ok: false, error: res.error || 'אימות משתמש נכשל' };
  }

  async logout() {
    try {
      const url = this.apiService.mcall({ routine: 'DECORD', label: 'LOGOUT' });
      await this.apiService.post(url, {});
    } catch {
      // Clear the local session even if the server is unreachable.
    }
    localStorage.removeItem('token');
    this.router.navigateByUrl('/login');
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  getStoredUsername(): string {
    return localStorage.getItem('username') || '';
  }

  getStoredCompany(): string {
    return localStorage.getItem('company') || this.configService.defaultCompany;
  }

  // One-time message for the login screen (e.g. "session ended").
  takeLoginMessage(): string {
    const message = sessionStorage.getItem('loginMessage') || '';
    sessionStorage.removeItem('loginMessage');
    return message;
  }
}
