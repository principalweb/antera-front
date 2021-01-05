import { ApiService } from 'app/core/services/api.service';
import { Injectable } from '@angular/core';
import { AnteraSort, AnteraMeta, AnteraProductRepoFilter } from 'app/models';

@Injectable({
  providedIn: 'root'
})
export class AnteraProductRepoService {

  constructor(
    private api: ApiService,
  ) { }

  getList(filter: AnteraProductRepoFilter, pagination: AnteraMeta, sort: AnteraSort) {
    return this.api.get('/api/v1/client-antera-repos', this.api.createListParams(filter, pagination, sort));
  }

  getData(id) {
    return this.api.get('/api/v1/client-antera-repos/' + id);
  }
}
