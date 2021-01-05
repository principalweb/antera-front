import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, forkJoin } from 'rxjs';
import { ApiService } from 'app/core/services/api.service';
import { SelectionService } from 'app/core/services/selection.service';
import { DecoTypeGroups, DecoTypeGroupsDetails } from 'app/models/deco-type-groups';
import { map, switchMap } from 'rxjs/operators';

@Injectable()
export class DecoTypeGroupsService {

  onDecoTypeGroupsChanged: BehaviorSubject<any[]> = new BehaviorSubject([]);
  onDecoTypeGroupsCountChanged: BehaviorSubject<number> = new BehaviorSubject(0);

  params = {
    offset: 0,
    limit: 50,
    order:"name",
    orient:"asc",
    term: {
      name: '',
      status: '',
      modifiedByName: '',
      createdByName: '',
      dateModified: '',
      dateEntered: ''
    }
  };

  constructor(
    private api: ApiService,
    private selection: SelectionService
  ) { 

  }

  getDecoTypeGroupsAndCount()
  {
    return forkJoin([
      this.getDecoTypeGroups(),
      this.getDecoTypeGroupsCount()
    ]);
  }

  getDecoTypeGroupsAll()
  {
    return this.api.getAllDesignTypes().pipe(
      map((response: any) => {
        this.onDecoTypeGroupsChanged.next(
          response.map(decoType =>
            new DecoTypeGroups(decoType)
          )
        );
        return response;
      })
    );
  }
  getDecoTypeGroups()
  {
    return this.api.getDecoTypeGroupsList(this.params).pipe(
      map((response: any) => {
        this.onDecoTypeGroupsChanged.next(
          response.map(decoType =>
            new DecoTypeGroups(decoType)
          )
        );
        return response;
      })
    );
  }

  getDecoTypeGroupsCount()
  {
    return this.api.getDecoTypeGroupsCount(this.params).pipe(
      map((response: any) => {
        this.onDecoTypeGroupsCountChanged.next(response.count);
        return response;
      })
    );
  }

  updateDecoTypeGroupsDetails(decoTypeDetails: DecoTypeGroupsDetails)
  {
      return this.api.updateDecoTypeGroups(decoTypeDetails.toObject()).pipe(
          switchMap(() => this.getDecoTypeGroups())
      );
  }

  createDecoTypeGroupsDetails(decoTypeDetails: DecoTypeGroupsDetails)
  {
      return this.api.createDecoTypeGroups(decoTypeDetails.toObject()).pipe(
          switchMap(() => this.getDecoTypeGroupsAndCount())
      );
  }

  filter(term) {
    this.params.term = term;
    return this.getDecoTypeGroupsAndCount();
  }

  setPagination(pe) {
    this.params.offset = pe.pageIndex;
    this.params.limit = pe.pageSize;

    return this.getDecoTypeGroups();
  }

  sort(se) {
    this.params.order = se.status;
    this.params.orient = se.direction;

    return this.getDecoTypeGroups();
  }

  getFinancialAccounts() {
    return this.api.getFinancialAccountList();
  }
}
