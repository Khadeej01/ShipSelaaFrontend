import { StatusDemande } from './status-demande';
import { Manager } from './manager';
import { Livreur } from './livreur';

export interface Demande {
  id?: number;
  lieuDepart: string;
  lieuArrivee: string;
  statut: StatusDemande;
  createdAt?: string;
  assignedAt?: string;
  manager?: Manager;
  livreur?: Livreur;
}

export interface DemandeDTO {
  id?: number;
  lieuDepart: string;
  lieuArrivee: string;
  statut: StatusDemande;
  managerId: number;
  managerName?: string;
  livreurId?: number;
  livreurName?: string;
}

export interface CreateDemandeRequest {
  lieuDepart: string;
  lieuArrivee: string;
  managerId: number;
}


