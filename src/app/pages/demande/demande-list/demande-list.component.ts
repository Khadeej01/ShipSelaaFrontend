import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { DemandeService } from '../../../services/demande.service';
import { LivreurService } from '../../../services/livreur.service';
import { Demande, StatusDemande, Livreur } from '../../../models';

@Component({
  selector: 'app-demande-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './demande-list.component.html',
  styleUrl: './demande-list.component.css'
})
export class DemandeListComponent implements OnInit {
  demandes: Demande[] = [];
  livreurs: Livreur[] = [];
  loading = false;
  error: string | null = null;
  assigningDemandeIds: Set<number> = new Set();

  // For demo purposes, assuming current user is manager with ID 1
  // In a real app, this would come from authentication service
  currentManagerId = 1;

  constructor(
    private demandeService: DemandeService,
    private livreurService: LivreurService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadDemandes();
    this.loadLivreurs();
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

  loadLivreurs(): void {
    this.livreurService.getAllLivreurs().subscribe({
      next: (livreurs) => {
        this.livreurs = livreurs;
      },
      error: (error) => {
        console.error('Error loading livreurs:', error);
      }
    });
  }

  onAssignLivreur(demande: Demande): void {
    if (!demande.id) return;
    
    // Simple prompt for now - in a real app, you'd use a modal with dropdown
    const availableLivreurs = this.livreurs.filter(l => l.disponible);
    
    if (availableLivreurs.length === 0) {
      alert('No available livreurs found. Please check the livreurs management page.');
      return;
    }
    
    const livreurList = availableLivreurs.map((l, index) => 
      `${index + 1}. ${l.nom} (${l.email})`
    ).join('\n');
    
    const selection = prompt(
      `Select a livreur by number:\n${livreurList}\n\nEnter the number (1-${availableLivreurs.length}):`
    );
    
    if (selection) {
      const selectedIndex = parseInt(selection) - 1;
      if (selectedIndex >= 0 && selectedIndex < availableLivreurs.length) {
        const selectedLivreur = availableLivreurs[selectedIndex];
        this.assignLivreurToDemande(demande.id, selectedLivreur.id!);
      } else {
        alert('Invalid selection. Please try again.');
      }
    }
  }

  private assignLivreurToDemande(demandeId: number, livreurId: number): void {
    this.assigningDemandeIds.add(demandeId);
    
    this.demandeService.assignLivreurToDemande(demandeId, livreurId, this.currentManagerId).subscribe({
      next: () => {
        this.assigningDemandeIds.delete(demandeId);
        this.loadDemandes(); // Reload to show updated data
      },
      error: (error) => {
        this.assigningDemandeIds.delete(demandeId);
        this.error = 'Failed to assign livreur. Please try again.';
        console.error('Error assigning livreur:', error);
      }
    });
  }

  isAssigning(demandeId: number): boolean {
    return this.assigningDemandeIds.has(demandeId);
  }
}