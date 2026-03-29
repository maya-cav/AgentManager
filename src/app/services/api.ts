import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  baseURL: string;

  constructor(private http: HttpClient, private router: Router) {
    const webApp = window.location.pathname.split('/')[1];
    this.baseURL = window.origin + '/' + webApp;
  }



  mcall(params: { routine: string; label: string }): string {
    const { routine, label } = params;
    const namespace = sessionStorage.getItem('namespace') || 'SVK';
    const username = sessionStorage.getItem('username') || '';
    const password = sessionStorage.getItem('password') || '';

    const url =
      this.baseURL
      + '/mcall?_ROUTINE=' + routine
      + '&_LABEL=' + label
      + '&_NS=' + namespace
      + '&_USERNAME=' + username
      + '&_PASSWORD=' + password;
    return url;
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
        : this.http.get(url, { responseType: 'arraybuffer' });

      const buffer = await firstValueFrom(source);
      const decoder = new TextDecoder('windows-1255');
      const data = decoder.decode(buffer);

      if (data) {
        if (data.includes('ERR>') || data.includes('Error occurred')) {
          console.error('Server error in response:', data);
          throw new Error(data);
        } else {
          const parsed = JSON.parse(data);
          return parsed;
        }
      }
    } catch (error: any) {
      if (error?.status === 401) {
        this.router.navigateByUrl('/login');
        return {};
      }
      console.error('API request failed:', error);
      throw error;
    }
    return {};
  }
}
