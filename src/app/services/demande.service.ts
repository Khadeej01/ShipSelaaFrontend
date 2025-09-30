import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Demande, CreateDemandeRequest, StatusDemande } from '../models';

@Injectable({
  providedIn: 'root'
})
export class DemandeService {
  private readonly baseUrl = 'http://localhost:8080/api/demandes';

  constructor(private http: HttpClient) {}


  getAllDemandes(): Observable<Demande[]> {
    return this.http.get<Demande[]>(this.baseUrl);
  }


  getDemandeById(id: number): Observable<Demande> {
    return this.http.get<Demande>(`${this.baseUrl}/${id}`);
  }


  createDemande(demande: CreateDemandeRequest): Observable<Demande> {
    const params = new HttpParams().set('managerId', demande.managerId.toString());
    return this.http.post<Demande>(this.baseUrl, {
      lieuDepart: demande.lieuDepart,
      lieuArrivee: demande.lieuArrivee
    }, { params });
  }


  updateDemande(id: number, demande: Partial<Demande>): Observable<Demande> {
    return this.http.put<Demande>(`${this.baseUrl}/${id}`, demande);
  }


  deleteDemande(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }


  getDemandesByManagerId(managerId: number): Observable<Demande[]> {
    return this.http.get<Demande[]>(`${this.baseUrl}/manager/${managerId}`);
  }


  getDemandesByLivreurId(livreurId: number): Observable<Demande[]> {
    return this.http.get<Demande[]>(`${this.baseUrl}/livreur/${livreurId}`);
  }


  assignLivreurToDemande(demandeId: number, livreurId: number, managerId: number): Observable<Demande> {
    const params = new HttpParams()
      .set('livreurId', livreurId.toString())
      .set('managerId', managerId.toString());
    return this.http.post<Demande>(`${this.baseUrl}/${demandeId}/assign-livreur`, {}, { params });
  }


  getUnassignedDemandes(): Observable<Demande[]> {
    return this.http.get<Demande[]>(`${this.baseUrl}/unassigned`);
  }


  getStatusDisplayText(status: StatusDemande): string {
    const statusMap = {
      [StatusDemande.CREATED]: 'Created',
      [StatusDemande.ASSIGNED]: 'Assigned',
      [StatusDemande.EN_COURS]: 'In Progress',
      [StatusDemande.LIVRE]: 'Delivered',
      [StatusDemande.CANCELLED]: 'Cancelled'
    };
    return statusMap[status] || status;
  }

  getStatusClass(status: StatusDemande): string {
    const statusClassMap = {
      [StatusDemande.CREATED]: 'bg-blue-100 text-blue-800',
      [StatusDemande.ASSIGNED]: 'bg-yellow-100 text-yellow-800',
      [StatusDemande.EN_COURS]: 'bg-orange-100 text-orange-800',
      [StatusDemande.LIVRE]: 'bg-green-100 text-green-800',
      [StatusDemande.CANCELLED]: 'bg-red-100 text-red-800'
    };
    return statusClassMap[status] || 'bg-gray-100 text-gray-800';
  }
}
