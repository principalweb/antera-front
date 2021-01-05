import { Injectable } from '@angular/core';
import { Commission } from 'app/models/commission';
import { BehaviorSubject, Observable, forkJoin } from 'rxjs';
import { ApiService } from 'app/core/services/api.service';
import { SelectionService } from 'app/core/services/selection.service';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { tap, map } from 'rxjs/operators';

@Injectable()
export class CommissionAdjustmentService {

  onEntitiesChanged: BehaviorSubject<Commission[]> = new BehaviorSubject([]);
  onEntitiesCountChanged: BehaviorSubject<number> = new BehaviorSubject(0);
  onDropdownOptionsChangedSubscription: BehaviorSubject<any[]> = new BehaviorSubject([]);

  params = {
    offset: 0,
    limit: 50,
    order: "created",
    orient: "asc",
    term: {
      adjustmentType: '',
      adjustmentValue: '',
      salesRep: ''
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
    return this.api.getCommissionAdjustmentsList(this.params).pipe(
      map((response: any) => {
        this.onEntitiesChanged.next(response);
        return response;
      }),
    );
  }

  getCount() {
    return this.api.getCommissionAdjustmentsCount(this.params).pipe(
      map((response: any) => {
        this.onEntitiesCountChanged.next(response.count);
        return response;
      }),
    );
  }

  create(adjustment: any) {
    return this.api.createCommissionAdjustment(adjustment)
      .pipe( tap(() => {
          return this.getListAndCount().subscribe();
      }));
  }

  update(group: any) {
    return this.api.updateCommissionAdjusmtent(group)
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
    return this.api.deleteCommissionAdjustments(this.selection.selectedIds)
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

  autocompleteUsers(name){
    return this.api.getUserAutocomplete(name);
  }

  getDropdownOptions(options) {
    console.log("hello hi 1 5")
   /*  return new Promise((resolve, reject) => {
        
        this.api.getDropdownOptions({dropdown: [
          'commission_adjustment__type_list',
        ]})
            .subscribe((response: any[]) => {
              console.log("hello hi")
                this.onDropdownOptionsChangedSubscription.next(response);
                resolve(response);
            }, err => reject(err));
    }); */
    return this.api.getDropdownOptions({dropdown: [
      'commission_adjustment__type_list',
    ]})
  }
}
