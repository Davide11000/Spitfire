import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { Auth } from '../services/auth';

export const authGuard: CanActivateFn = (route, state) => {
  const auth = inject(Auth);
  const router = inject(Router);

  // Controlla anche che il token non sia scaduto
  const username = auth.getUsernameFromToken();

  if (!username) {
    router.navigate(['/login']);
    return false;
  }

  return true;
};
