import { ApiService } from './../../core/services/api.service';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class QboService {

  constructor(
    api: ApiService
  ) {
  }
}
