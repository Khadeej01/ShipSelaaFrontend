import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Livreur } from '../models/livreur';

@Injectable({
  providedIn: 'root'
})
export class LivreurService {
  private apiUrl = 'http://localhost:8083/api/livreurs';

  constructor(private http: HttpClient) { }

  getAllLivreurs(): Observable<Livreur[]> {
    return this.http.get<Livreur[]>(this.apiUrl);
  }

  getLivreurById(id: number): Observable<Livreur> {
    return this.http.get<Livreur>(`${this.apiUrl}/${id}`);
  }

  createLivreur(livreur: Livreur): Observable<Livreur> {
    return this.http.post<Livreur>(this.apiUrl, livreur);
  }

  updateLivreur(id: number, livreur: Livreur): Observable<Livreur> {
    return this.http.put<Livreur>(`${this.apiUrl}/${id}`, livreur);
  }

  deleteLivreur(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getAvailableLivreurs(): Observable<Livreur[]> {
    return this.http.get<Livreur[]>(`${this.apiUrl}?disponible=true`);
  }
}