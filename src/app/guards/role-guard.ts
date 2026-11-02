import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { map, catchError, of } from 'rxjs';
import { Auth } from '../services/auth';
import { User } from '../services/user';

export const roleGuard: CanActivateFn = (route, state) => {
  const auth = inject(Auth);
  const userService = inject(User);
  const router = inject(Router);

  const username = auth.getUsernameFromToken();

  if (!username) {
    router.navigate(['/login']);
    return false;
  }

  return userService.getUserRole(username).pipe(
    map((res: any) => {
      if (route.data['roles'].includes(res.ruolo)) {
        return true;
      }

      router.navigate(['/home']);
      return false;
    }),
    catchError(() => {
      router.navigate(['/home']);
      return of(false);
    })
  );
};
