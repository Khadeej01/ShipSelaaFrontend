import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { DemandeService } from '../../../services/demande.service';
import { Demande, StatusDemande } from '../../../models';

@Component({
  selector: 'app-demande-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './demande-list.component.html',
  styleUrl: './demande-list.component.css'
})
export class DemandeListComponent implements OnInit {
  demandes: Demande[] = [];
  loading = false;
  error: string | null = null;

  constructor(
    private demandeService: DemandeService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadDemandes();
  }

  loadDemandes(): void {
    this.loading = true;
    this.error = null;
    
    this.demandeService.getAllDemandes().subscribe({
      next: (demandes) => {
        this.demandes = demandes;
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Failed to load demandes. Please try again.';
        this.loading = false;
        console.error('Error loading demandes:', error);
      }
    });
  }

  onAddNew(): void {
    this.router.navigate(['/demandes/new']);
  }

  onEdit(id: number): void {
    this.router.navigate(['/demandes/edit', id]);
  }

  onDelete(demande: Demande): void {
    if (demande.id && confirm(`Are you sure you want to delete the demande from ${demande.lieuDepart} to ${demande.lieuArrivee}?`)) {
      this.demandeService.deleteDemande(demande.id).subscribe({
        next: () => {
          this.loadDemandes(); // Reload the list
        },
        error: (error) => {
          this.error = 'Failed to delete demande. Please try again.';
          console.error('Error deleting demande:', error);
        }
      });
    }
  }

  getStatusText(status: StatusDemande): string {
    return this.demandeService.getStatusDisplayText(status);
  }

  getStatusClass(status: StatusDemande): string {
    return this.demandeService.getStatusClass(status);
  }

  formatDate(dateString: string | undefined): string {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}