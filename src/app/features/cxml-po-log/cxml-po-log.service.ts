import { Injectable } from '@angular/core';

import { ApiService } from 'app/core/services/api.service';
import { AnteraSort, AnteraMeta } from 'app/models';
import { CxmlPoLogFilter } from './models/cxml-po-log';

@Injectable({
  providedIn: 'root'
})
export class CxmlPoLogService {

  url = '/api/v1/cxml-po-logs';

  constructor(
    private api: ApiService,
  ) { }

  getList(filter: CxmlPoLogFilter, pagination: AnteraMeta, sort: AnteraSort) {
    return this.api.get(this.url, this.api.createListParams(filter, pagination, sort));
  }

  getData(id) {
    return this.api.get(this.url + '/' + id);
  }

  create(data) {
    return this.api.post(this.url, data);
  }

  update(id, data) {
    return this.api.put(this.url + '/' + id, data);
  }

  process(id) {
    return this.api.get(this.url + '/' + id + '/process');
  }
}
