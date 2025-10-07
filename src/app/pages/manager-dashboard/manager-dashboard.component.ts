import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DemandeListComponent } from '../demande/demande-list/demande-list.component';
import { LivreurListComponent } from '../livreur/livreur-list/livreur-list.component';

@Component({
  selector: 'app-manager-dashboard',
  standalone: true,
  imports: [CommonModule, DemandeListComponent, LivreurListComponent],
  templateUrl: './manager-dashboard.component.html',
  styleUrl: './manager-dashboard.component.css'
})
export class ManagerDashboardComponent {}


