import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { AuthSession } from '../../../../core/auth/auth-session';

@Component({
  selector: 'app-dashboard',
  imports: [RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard {
  protected readonly authSession = inject(AuthSession);
}
