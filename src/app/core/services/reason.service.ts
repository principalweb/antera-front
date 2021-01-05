import { ApiService } from './api.service';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ReasonService {

  constructor(
    private api: ApiService
  ) { }

  getFullList() {
    return this.api.get('/api/v1/reasons?per-page=200&filter[module][like]=APCredit');
  }
}
