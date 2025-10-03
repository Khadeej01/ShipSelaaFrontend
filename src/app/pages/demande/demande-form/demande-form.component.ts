import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { DemandeService } from '../../../services/demande.service';
import { Demande, CreateDemandeRequest, StatusDemande } from '../../../models';

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

  // For demo purposes, assuming current user is manager with ID 1
  // In a real app, this would come from authentication service
  currentManagerId = 1;

  constructor(
    private fb: FormBuilder,
    private demandeService: DemandeService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.demandeForm = this.fb.group({
      lieuDepart: ['', [Validators.required, Validators.minLength(2)]],
      lieuArrivee: ['', [Validators.required, Validators.minLength(2)]],
      statut: [StatusDemande.CREATED]
    });
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.demandeId = +params['id'];
        this.loadDemande();
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
          next: () => {
            this.router.navigate(['/demandes']);
          },
          error: (error) => {
            this.submitError = 'Failed to create demande. Please try again.';
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