import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LivreurService } from '../../../services/livreur.service';
import { Livreur } from '../../../models/livreur';

@Component({
  selector: 'app-livreur-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './livreur-list.component.html',
  styleUrls: ['./livreur-list.component.css']})

export class LivreurListComponent implements OnInit {
  livreurs: Livreur[] = [];
  loading = false;
  error: string | null = null;
  showForm = false;
  editingLivreur: Livreur | null = null;
  livreurForm: FormGroup;

  constructor(
    private livreurService: LivreurService,
    private fb: FormBuilder
  ) {
    this.livreurForm = this.fb.group({
      nom: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      disponible: [true]
    });
  }

  ngOnInit(): void {
    this.loadLivreurs();
  }

  loadLivreurs(): void {
    this.loading = true;
    this.error = null;

    this.livreurService.getAllLivreurs().subscribe({
      next: (livreurs) => {
        this.livreurs = livreurs;
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Failed to load livreurs. Please try again.';
        this.loading = false;
        console.error('Error loading livreurs:', error);
      }
    });
  }

  onAddNew(): void {
    this.editingLivreur = null;
    this.showForm = true;
    this.livreurForm.reset({
      nom: '',
      email: '',
      disponible: true
    });
  }

  onEdit(livreur: Livreur): void {
    this.editingLivreur = livreur;
    this.showForm = true;
    this.livreurForm.patchValue({
      nom: livreur.nom,
      email: livreur.email,
      disponible: livreur.disponible
    });
  }

  onSubmit(): void {
    if (this.livreurForm.valid) {
      this.loading = true;
      const formValue = this.livreurForm.value;

      const livreurData: Livreur = {
        nom: formValue.nom,
        email: formValue.email,
        disponible: formValue.disponible,
        password: 'defaultPassword123'
      };

      if (this.editingLivreur) {

        livreurData.id = this.editingLivreur.id;
        this.livreurService.updateLivreur(this.editingLivreur.id!, livreurData).subscribe({
          next: () => {
            this.showForm = false;
            this.loadLivreurs();
          },
          error: (error) => {
            this.error = 'Failed to update livreur. Please try again.';
            this.loading = false;
            console.error('Error updating livreur:', error);
          }
        });
      } else {

        this.livreurService.createLivreur(livreurData).subscribe({
          next: () => {
            this.showForm = false;
            this.loadLivreurs();
          },
          error: (error) => {
            this.error = 'Failed to create livreur. Please try again.';
            this.loading = false;
            console.error('Error creating livreur:', error);
          }
        });
      }
    } else {

      Object.keys(this.livreurForm.controls).forEach(key => {
        this.livreurForm.get(key)?.markAsTouched();
      });
    }
  }

  cancelForm(): void {
    this.showForm = false;
    this.editingLivreur = null;
    this.livreurForm.reset();
  }

  toggleAvailability(livreur: Livreur): void {
    const updatedLivreur = { ...livreur, disponible: !livreur.disponible };

    this.livreurService.updateLivreur(livreur.id!, updatedLivreur).subscribe({
      next: () => {
        this.loadLivreurs();
      },
      error: (error) => {
        this.error = 'Failed to update livreur availability.';
        console.error('Error updating livreur:', error);
      }
    });
  }

  onDelete(livreur: Livreur): void {
    if (confirm(`Are you sure you want to delete ${livreur.nom}?`)) {
      this.livreurService.deleteLivreur(livreur.id!).subscribe({
        next: () => {
          this.loadLivreurs();
        },
        error: (error) => {
          this.error = 'Failed to delete livreur. Please try again.';
          console.error('Error deleting livreur:', error);
        }
      });
    }
  }

  getFieldError(fieldName: string): string | null {
    const field = this.livreurForm.get(fieldName);
    if (field?.errors && field?.touched) {
      if (field.errors['required']) {
        return `${this.getFieldDisplayName(fieldName)} is required`;
      }
      if (field.errors['email']) {
        return 'Please enter a valid email address';
      }
      if (field.errors['minlength']) {
        return `${this.getFieldDisplayName(fieldName)} must be at least ${field.errors['minlength'].requiredLength} characters`;
      }
    }
    return null;
  }

  private getFieldDisplayName(fieldName: string): string {
    const displayNames: { [key: string]: string } = {
      nom: 'Name',
      email: 'Email'
    };
    return displayNames[fieldName] || fieldName;
  }
}
