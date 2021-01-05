import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { AuthService } from 'app/core/services/auth.service';

@Injectable()
export class ContactApiService {

  constructor(
    private api: ApiService,
    private authService: AuthService
  ) { }

  list(offset=0, limit=10) {
    return this.api.post('/content/get-contact-list', {
      offset,
      limit
    });
  }

  getCount() {
    return this.api.post('/content/get-contact-count', {});
  }

  create(data) {
    let req = {
        data: data,
        permUserId: this.authService.getCurrentUser().userId
    }
    return this.api.post('/content/create-contact', req);
  }

  update(data) {
    return this.api.post('/content/update-contact-details', data);
  }

  delete(id) {
    return this.api.post('/content/delete-contact', { id });
  }
}
