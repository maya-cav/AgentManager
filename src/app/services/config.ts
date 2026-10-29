import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

// Per-customer settings, loaded at startup from config.json next to index.html.
// Edit that file on the customer's server - no rebuild needed.
export interface AppConfig {
  namespace: string;
  defaultCompany: string;
  customerName: string;
  requireHttps: boolean;
}

const DEFAULTS: AppConfig = {
  namespace: 'SVK',
  defaultCompany: '',
  customerName: '',
  requireHttps: true,
};

const LOCAL_HOSTS = ['localhost', '127.0.0.1'];

@Injectable({
  providedIn: 'root',
})
export class ConfigService {
  private config: AppConfig = { ...DEFAULTS };

  constructor(private http: HttpClient) { }

  async load(): Promise<void> {
    try {
      const loaded = await firstValueFrom(this.http.get<Partial<AppConfig>>('config.json'));
      this.config = { ...DEFAULTS, ...loaded };
    } catch {
      console.warn('config.json not found, using defaults');
    }
    this.enforceHttps();
  }

  // Never let the password/token travel over plain HTTP at a customer site.
  private enforceHttps() {
    const { protocol, hostname, href } = window.location;
    if (this.config.requireHttps && protocol === 'http:' && !LOCAL_HOSTS.includes(hostname)) {
      window.location.replace('https:' + href.substring('http:'.length));
    }
  }

  get namespace(): string {
    return this.config.namespace;
  }

  get defaultCompany(): string {
    return this.config.defaultCompany;
  }

  get customerName(): string {
    return this.config.customerName;
  }
}
