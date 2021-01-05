import { Injectable } from '@angular/core';
import { Commission } from 'app/models/commission';
import { BehaviorSubject, Observable, forkJoin } from 'rxjs';
import { ApiService } from 'app/core/services/api.service';
import { SelectionService } from 'app/core/services/selection.service';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { tap, map } from 'rxjs/operators';

@Injectable()
export class CommissionGroupsService {

  onEntitiesChanged: BehaviorSubject<Commission[]> = new BehaviorSubject([]);
  onEntitiesCountChanged: BehaviorSubject<number> = new BehaviorSubject(0);

  params = {
    offset: 0,
    limit: 50,
    order: "name",
    orient: "asc",
    term: {
      name: '',
      description: '',
      // assignedSalesRep: '',
      modifiedByName: '',
    }
  };

  constructor(
    private api: ApiService,
    private selection: SelectionService
  ) {

  }

  /**
 * The Contacts App Main Resolver
 * @param {ActivatedRouteSnapshot} route
 * @param {RouterStateSnapshot} state
 * @returns {Observable<any> | Promise<any> | any}
 */
  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> | Promise<any> | any {
    return this.getListAndCount();
  }

  getListAndCount() {
    return forkJoin([
      this.getList(),
      this.getCount()
    ]);
  }

  getList() {
    return this.api.getCommissionGroupsList(this.params).pipe(
      map((response: any) => {
        this.onEntitiesChanged.next(response);
        return response;
      }),
    );
  }

  getCount() {
    return this.api.getCommissionGroupsCount(this.params).pipe(
      map((response: any) => {
        this.onEntitiesCountChanged.next(response.count);
        return response;
      }),
    );
  }

  create(group: any) {
    return this.api.createCommissionGroup(group)
      .pipe( tap(() => {
          return this.getListAndCount().subscribe();
      }));
  }

  update(group: any) {
    return this.api.updateCommissionGroup(group)
      .pipe( tap(() => {
          return this.getListAndCount().subscribe();
      }));

  }

  delete(id) {
    return this.api.deleteCommissionGroups([id])
      .pipe( tap(() => {
          return this.getListAndCount().subscribe();
      }));
  }

  deleteSelected() {
    return this.api.deleteCommissionGroups(this.selection.selectedIds)
      .pipe( tap(() => {
          return this.getListAndCount().subscribe();
      }));
  }

  cloneSelected() {
    return this.api.cloneCommissionGroups(this.selection.selectedIds)
      .pipe( tap(() => {
          return this.getListAndCount().subscribe();
      }));
  }

  filter(term) {
    this.params.term = term;
    return this.getListAndCount();
  }

  setPagination(pe) {
    this.params.offset = pe.pageIndex;
    this.params.limit = pe.pageSize;

    return this.getList();
  }

  sort(se) {
    this.params.order = se.active;
    this.params.orient = se.direction;

    return this.getList();
  }

  search(text) {

  }

}
