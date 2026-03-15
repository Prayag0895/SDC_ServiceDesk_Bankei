import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../../auth/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.getToken()) {
    router.navigate(['/login']);
    return false;
  }

  const requiredRole = route.data?.['role'] as string | undefined;
  if (requiredRole) {
    const userRole = authService.getRole();
    const isAdmin = authService.isAdmin();
    // Admins can access any route; others must match the required role
    if (!isAdmin && userRole !== requiredRole) {
      router.navigate(['/login']);
      return false;
    }
  }

  return true;
};