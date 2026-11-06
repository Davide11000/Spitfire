import { Routes } from '@angular/router';
import { authGuard } from './guards/auth-guard';
import { roleGuard } from './guards/role-guard';

export const routes: Routes = [
  {
    path: 'home',
    loadComponent: () => import('./pages/home/home.page').then((m) => m.HomePage),
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    path: 'register',
    loadComponent: () => import('./pages/register/register.page').then( m => m.RegisterPage)
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.page').then( m => m.LoginPage)
  },
  {
    path: 'profile',
    loadComponent: () => import('./pages/profile/profile.page').then( m => m.ProfilePage),
    canActivate: [authGuard]
  },
  {
    path: 'profile/:username',
    loadComponent: () => import('./pages/profile/profile.page').then(m => m.ProfilePage)
  },
  {
    path: 'playlist/:playlistId',
    loadComponent: () => import('./pages/playlist/playlist.page').then( m => m.PlaylistPage)
  },
  {
    path: 'add-content',
    loadComponent: () => import('./pages/add-content/add-content.page').then( m => m.AddContentPage),
    canActivate: [authGuard]
  },
  {
    path: 'discover',
    loadComponent: () => import('./pages/discover/discover.page').then(m => m.DiscoverPage)
  },
  {
    path: 'settings',
    loadComponent: () => import('./pages/settings/settings.page').then(m => m.SettingsPage),
    canActivate: [authGuard]
  },
  {
    path: 'lists',
    loadComponent: () => import('./pages/lists/lists.page').then(m => m.ListsPage)
  },
  {
    path: 'reports',
    loadComponent: () => import('./pages/reports/reports.page').then(m => m.ReportsPage),
    canActivate: [roleGuard],
    data: { roles: ['admin', 'moderatore'] }
  },
  {
    path: 'requests',
    loadComponent: () => import('./pages/requests/requests.page').then(m => m.RequestsPage),
    canActivate: [roleGuard],
    data: { roles: ['admin'] }
  },
  {
    path: 'records/:id',
    loadComponent: () => import('./pages/albumtemplate/albumtemplate.page').then(m => m.AlbumtemplatePage),
  },
  {
    path: 'artists/:id',
    loadComponent: () => import('./pages/artisttemplate/artisttemplate.page').then(m => m.ArtisttemplatePage),
  }
];
