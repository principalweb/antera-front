import { Injectable } from '@angular/core';

import { ApiService } from './api.service';

@Injectable()
export class MediaService {

  constructor(private api: ApiService) { }

  getImages() {
    return this.api.get('/media-images');
  }

}
