import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Manager } from '../models/manager';

@Injectable({
  providedIn: 'root'
})
export class ManagerService {
  private readonly baseUrl = 'http://localhost:8083/api/managers';

  constructor(private http: HttpClient) {}

  getAllManagers(): Observable<Manager[]> {
    return this.http.get<Manager[]>(this.baseUrl);
  }

  getManagerById(id: number): Observable<Manager> {
    return this.http.get<Manager>(`${this.baseUrl}/${id}`);
  }
}


