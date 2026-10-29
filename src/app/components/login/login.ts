import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login implements OnInit {
  username = '';
  password = '';
  company = '';
  canLogin = false;
  loggingIn = false;
  errorMessage = '';

  constructor(private authService: AuthService) { }

  ngOnInit() {
    this.username = this.authService.getStoredUsername();
    this.company = this.authService.getStoredCompany();
    this.errorMessage = this.authService.takeLoginMessage();
    this.checkFields();
  }

  checkFields() {
    this.canLogin = this.username.length > 0 && this.password.length > 0 && this.company.length > 0;
  }

  async onLogin() {
    if (!this.canLogin || this.loggingIn) return;
    this.errorMessage = '';
    this.loggingIn = true;
    try {
      const result = await this.authService.login(this.username, this.password, this.company);
      if (!result.ok) {
        this.errorMessage = result.error || 'אימות משתמש נכשל';
      }
    } catch {
      this.errorMessage = 'שגיאת תקשורת עם השרת';
    } finally {
      this.loggingIn = false;
    }
  }
}
