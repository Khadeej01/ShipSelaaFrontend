import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { DemandeService } from '../../../services/demande.service';
import { LivreurService } from '../../../services/livreur.service';
import { ManagerService } from '../../../services/manager.service';
import { Demande, CreateDemandeRequest, StatusDemande, Livreur } from '../../../models';

@Component({
  selector: 'app-demande-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './demande-form.component.html',
  styleUrl: './demande-form.component.css'
})
export class DemandeFormComponent implements OnInit {
  demandeForm: FormGroup;
  isEditMode = false;
  demandeId: number | null = null;
  loading = false;
  error: string | null = null;
  submitError: string | null = null;
  livreurs: Livreur[] = [];
  loadingLivreurs = false;
  loadingManagers = false;

  // Current manager ID - update this to match an existing manager in your database
  // You can find the correct ID by checking the response when you create a manager
  currentManagerId = 1; // Fallback; will be replaced if a manager exists

  constructor(
    private fb: FormBuilder,
    private demandeService: DemandeService,
    private livreurService: LivreurService,
    private managerService: ManagerService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.demandeForm = this.fb.group({
      lieuDepart: ['', [Validators.required, Validators.minLength(2)]],
      lieuArrivee: ['', [Validators.required, Validators.minLength(2)]],
      livreurId: [''], // Optional livreur assignment
      statut: [StatusDemande.CREATED]
    });
  }

  ngOnInit(): void {
    this.loadManagersAndLivreurs();
    
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.demandeId = +params['id'];
        this.loadDemande();
      }
    });
  }

  loadLivreurs(): void {
    this.loadingLivreurs = true;
    this.livreurService.getAllLivreurs().subscribe({
      next: (livreurs) => {
        this.livreurs = livreurs;
        this.loadingLivreurs = false;
      },
      error: (error) => {
        console.error('Error loading livreurs:', error);
        this.loadingLivreurs = false;
      }
    });
  }

  loadManagersAndLivreurs(): void {
    this.loadingManagers = true;
    this.managerService.getAllManagers().subscribe({
      next: (managers) => {
        if (managers && managers.length > 0) {
          this.currentManagerId = managers[0].id!;
        } else {
          this.submitError = 'No manager found. Please create a manager first.';
        }
        this.loadingManagers = false;
        this.loadLivreurs();
      },
      error: (error) => {
        console.error('Error loading managers:', error);
        this.submitError = 'Unable to load managers. Please ensure the backend is running and a manager exists.';
        this.loadingManagers = false;
        this.loadLivreurs();
      }
    });
  }

  loadDemande(): void {
    if (!this.demandeId) return;

    this.loading = true;
    this.error = null;

    this.demandeService.getDemandeById(this.demandeId).subscribe({
      next: (demande) => {
        this.demandeForm.patchValue({
          lieuDepart: demande.lieuDepart,
          lieuArrivee: demande.lieuArrivee,
          livreurId: demande.livreur?.id || '',
          statut: demande.statut
        });
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Failed to load demande. Please try again.';
        this.loading = false;
        console.error('Error loading demande:', error);
      }
    });
  }

  onSubmit(): void {
    if (this.demandeForm.valid) {
      this.loading = true;
      this.submitError = null;

      const formValue = this.demandeForm.value;

      if (this.isEditMode && this.demandeId) {
        // Update existing demande
        const updateData: Partial<Demande> = {
          lieuDepart: formValue.lieuDepart,
          lieuArrivee: formValue.lieuArrivee,
          statut: formValue.statut
        };
        
        // Add livreur if selected
        if (formValue.livreurId) {
          const selectedLivreur = this.livreurs.find(l => l.id === +formValue.livreurId);
          if (selectedLivreur) {
            updateData.livreur = selectedLivreur;
          }
        }

        this.demandeService.updateDemande(this.demandeId, updateData).subscribe({
          next: () => {
            this.router.navigate(['/demandes']);
          },
          error: (error) => {
            this.submitError = 'Failed to update demande. Please try again.';
            this.loading = false;
            console.error('Error updating demande:', error);
          }
        });
      } else {
        // Create new demande
        const createData: CreateDemandeRequest = {
          lieuDepart: formValue.lieuDepart,
          lieuArrivee: formValue.lieuArrivee,
          managerId: this.currentManagerId
        };

        this.demandeService.createDemande(createData).subscribe({
          next: (createdDemande) => {
            // If a livreur was selected, assign them to the demande
            if (formValue.livreurId) {
              this.demandeService.assignLivreurToDemande(
                createdDemande.id!,
                +formValue.livreurId,
                this.currentManagerId
              ).subscribe({
                next: () => {
                  this.router.navigate(['/demandes']);
                },
                error: (error) => {
                  console.error('Error assigning livreur:', error);
                  // Navigate anyway since demande was created
                  this.router.navigate(['/demandes']);
                }
              });
            } else {
              this.router.navigate(['/demandes']);
            }
          },
          error: (error) => {
            this.submitError = `Failed to create demande. This may be because the manager with ID ${this.currentManagerId} does not exist. Please create a manager first and update the currentManagerId value in this component.`;
            this.loading = false;
            console.error('Error creating demande:', error);
          }
        });
      }
    } else {
      // Mark all fields as touched to show validation errors
      Object.keys(this.demandeForm.controls).forEach(key => {
        this.demandeForm.get(key)?.markAsTouched();
      });
    }
  }

  onCancel(): void {
    this.router.navigate(['/demandes']);
  }

  getFieldError(fieldName: string): string | null {
    const field = this.demandeForm.get(fieldName);
    if (field?.errors && field?.touched) {
      if (field.errors['required']) {
        return `${this.getFieldDisplayName(fieldName)} is required`;
      }
      if (field.errors['minlength']) {
        return `${this.getFieldDisplayName(fieldName)} must be at least ${field.errors['minlength'].requiredLength} characters`;
      }
    }
    return null;
  }

  private getFieldDisplayName(fieldName: string): string {
    const displayNames: { [key: string]: string } = {
      lieuDepart: 'Departure location',
      lieuArrivee: 'Arrival location'
    };
    return displayNames[fieldName] || fieldName;
  }

  get StatusDemande() {
    return StatusDemande;
  }

  getStatusOptions() {
    return Object.values(StatusDemande);
  }

  getStatusDisplayText(status: StatusDemande): string {
    return this.demandeService.getStatusDisplayText(status);
  }
}