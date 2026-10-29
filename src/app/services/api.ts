import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { Router } from '@angular/router';
import { ConfigService } from './config';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  baseURL: string;

  constructor(private http: HttpClient, private router: Router, private configService: ConfigService) {
    const webApp = window.location.pathname.split('/')[1];
    this.baseURL = window.origin + '/' + webApp;
  }

  // Credentials never go in the URL (it ends up in server/proxy logs) -
  // the session token is sent in the Authorization header instead.
  mcall(params: { routine: string; label: string }): string {
    const { routine, label } = params;
    return this.baseURL
      + '/mcall?_ROUTINE=' + encodeURIComponent(routine)
      + '&_LABEL=' + encodeURIComponent(label)
      + '&_NS=' + encodeURIComponent(this.configService.namespace);
  }

  async get(url: string): Promise<any> {
    return this.request(url);
  }

  async post(url: string, payload: any = {}): Promise<any> {
    return this.request(url, payload);
  }

  private async request(url: string, payload?: any): Promise<any> {
    try {
      const token = localStorage.getItem('token') || '';
      const headers = new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      });
      const source = payload !== undefined
        ? this.http.post(url, payload, { headers, responseType: 'arraybuffer' })
        : this.http.get(url, { headers, responseType: 'arraybuffer' });

      const buffer = await firstValueFrom(source);
      const decoder = new TextDecoder('windows-1255');
      const data = decoder.decode(buffer);

      if (data) {
        if (data.includes('ERR>') || data.includes('Error occurred')) {
          console.error('Server error in response');
          throw new Error(data);
        }
        return JSON.parse(data);
      }
    } catch (error: any) {
      if (error?.status === 401 || error?.status === 403) {
        this.endSession();
        return {};
      }
      console.error('API request failed:', error);
      throw error;
    }
    return {};
  }

  // Session is gone (expired, or the same user logged in on another device).
  private endSession() {
    localStorage.removeItem('token');
    sessionStorage.setItem('loginMessage', 'החיבור הסתיים, יש להתחבר מחדש');
    this.router.navigateByUrl('/login');
  }
}
