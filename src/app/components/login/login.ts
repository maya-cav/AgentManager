import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
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
  errorMessage = '';

  constructor(private authService: AuthService, private route: ActivatedRoute) { }

  ngOnInit() {
    const uci = "SVK";
    this.username = this.authService.getStoredUsername();
    this.company = this.authService.getStoredCompany();
    this.checkFields();
  }

  checkFields() {
    this.canLogin = this.username.length > 0 && this.password.length > 0 && this.company.length > 0;
  }

  async onLogin() {
    if (!this.canLogin) return;
    this.errorMessage = '';
    if (this.company) {
      this.authService.setCompany(this.company);
    }
    const result = await this.authService.login(this.username, this.password);
    if (!result.ok) {
      this.errorMessage = result.error || 'אימות משתמש נכשל';
    }
  }
}
