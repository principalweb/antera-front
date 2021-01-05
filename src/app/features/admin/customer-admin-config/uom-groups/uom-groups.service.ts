import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, forkJoin } from 'rxjs';
import { ApiService } from 'app/core/services/api.service';
import { SelectionService } from 'app/core/services/selection.service';
import { UomGroups, UomGroupsDetails } from 'app/models/uom-groups';
import { map, switchMap } from 'rxjs/operators';

@Injectable()
export class UomGroupsService {

  onUomGroupsChanged: BehaviorSubject<any[]> = new BehaviorSubject([]);
  onUomGroupsCountChanged: BehaviorSubject<number> = new BehaviorSubject(0);

  params = {
    offset: 0,
    limit: 50,
    order:"name",
    orient:"asc",
    term: {
      name: '',
      type: '',
    }
  };

  constructor(
    private api: ApiService,
    private selection: SelectionService
  ) { 

  }

  getUomGroupsAndCount()
  {
    return forkJoin([
      this.getUomGroups(),
      this.getUomGroupsCount()
    ]);
  }

  getUomGroupsAll()
  {
    return this.api.getUomGroupsListOnly().pipe(
      map((response: any) => {
        this.onUomGroupsChanged.next(
          response.map(uomGroups =>
            new UomGroups(uomGroups)
          )
        );
        return response;
      })
    );
  }
  getUomGroups()
  {
    return this.api.getUomGroupsList(this.params).pipe(
      map((response: any) => {
        this.onUomGroupsChanged.next(
          response.map(uomGroups =>
            new UomGroups(uomGroups)
          )
        );
        return response;
      })
    );
  }

  getUomGroupsCount()
  {
    return this.api.getUomGroupsCount(this.params).pipe(
      map((response: any) => {
        this.onUomGroupsCountChanged.next(response.count);
        return response;
      })
    );
  }

  updateUomGroupsDetails(uomGroupsDetails: UomGroupsDetails)
  {
      return this.api.updateUomGroups(uomGroupsDetails.toObject()).pipe(
          switchMap(() => this.getUomGroups())
      );
  }

  createUomGroupsDetails(uomGroupsDetails: UomGroupsDetails)
  {
      return this.api.createUomGroups(uomGroupsDetails.toObject()).pipe(
          switchMap(() => this.getUomGroupsAndCount())
      );
  }

  filter(term) {
    this.params.term = term;
    return this.getUomGroupsAndCount();
  }

  setPagination(pe) {
    this.params.offset = pe.pageIndex;
    this.params.limit = pe.pageSize;

    return this.getUomGroups();
  }

  sort(se) {
    this.params.order = se.status;
    this.params.orient = se.direction;

    return this.getUomGroups();
  }

  getFinancialAccounts() {
    return this.api.getFinancialAccountList();
  }
}
