import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { DemandeListComponent } from './pages/demande/demande-list/demande-list.component';
import { DemandeFormComponent } from './pages/demande/demande-form/demande-form.component';
import { LivreurListComponent } from './pages/livreur/livreur-list/livreur-list.component';
import { ManagerDashboardComponent } from './pages/manager-dashboard/manager-dashboard.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'home', redirectTo: '', pathMatch: 'full' },
  { path: 'demandes', component: DemandeListComponent },
  { path: 'demandes/new', component: DemandeFormComponent },
  { path: 'demandes/edit/:id', component: DemandeFormComponent },
  { path: 'livreurs', component: LivreurListComponent },
  { path: 'manager', component: ManagerDashboardComponent },
  // Additional routes will be added here
  { path: '**', redirectTo: '' } // Wildcard route for 404 page
];
