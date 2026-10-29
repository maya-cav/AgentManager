import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

// Per-customer settings, loaded at startup from config.json next to index.html.
// Edit that file on the customer's server - no rebuild needed.
export interface AppConfig {
  namespace: string;
  defaultCompany: string;
  customerName: string;
}

const DEFAULTS: AppConfig = {
  namespace: 'SVK',
  defaultCompany: '',
  customerName: '',
};

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
