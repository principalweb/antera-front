import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class ApiMockService {

  constructor(private http: HttpClient) { }

  get(url) {
    return this.http.get('api/' + url);
  }

  post(url, data) {
    return this.http.post('api/' + url, data);
  }

}
