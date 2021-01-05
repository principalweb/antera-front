import { Injectable } from '@angular/core';
import { Commission } from 'app/models/commission';
import { BehaviorSubject, Observable, forkJoin } from 'rxjs';
import { ApiService } from 'app/core/services/api.service';
import { SelectionService } from 'app/core/services/selection.service';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { map, switchMap } from 'rxjs/operators';

@Injectable()
export class CommissionsService {

  onCommissionsChanged: BehaviorSubject<Commission[]> = new BehaviorSubject([]);
  onCommissionsCountChanged: BehaviorSubject<number> = new BehaviorSubject(0);

  params = {
    offset: 0,
    limit: 100,
    order:"name",
    orient:"asc",
    term: {
        name: '',
        description: '',
        assignedSalesRep: '',
        orderGP: '',
        profitTarget: '',
        profitPercent: '',
        netProfitPercent: '',
        revenue: '',
        cap: '',
        calulationType: '',
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
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> | Promise<any> | any
    {
      return this.getCommissionsAndCount();
    }

    getCommissionsAndCount()
    {
      return forkJoin([
        this.getCommissions(),
        this.getCommissionsCount()
      ]);
    }

    getCommissions()
    {
      return this.api.getCommissionsList(this.params).pipe(
        map((response: any) => {
          this.onCommissionsChanged.next(response);
          return response;
        })
      );
    }

    getCommissionsCount()
    {
      return this.api.getCommissionsCount(this.params).pipe(
         map((response: any) => {
          this.onCommissionsCountChanged.next(response.count);
          return response;
        })
      );
    }

    createCommission(commission: Commission)
    {
        return this.api.createCommission(commission.toObject()).pipe(
            switchMap(() => this.getCommissionsAndCount())
        );
    }

    updateCommission(commission: Commission)
    {
        return this.api.updateCommission(commission.toObject()).pipe(
            switchMap(() => this.getCommissions())
        );
    }

    deleteCommission(id)
    {
        return this.api.deleteCommissions([id]).pipe(
            switchMap(() => this.getCommissionsAndCount())
        );
    }

    deleteSelectedCommissions() {
        return this.api.deleteCommissions(this.selection.selectedIds).pipe(
            switchMap(() => this.getCommissionsAndCount())
        );
    }

    cloneSelectedCommissions() {
      
      return this.api.cloneCommissions(this.selection.selectedIds).pipe(
          switchMap(() => this.getCommissionsAndCount())
      );
    }

    filter(term) {
      this.params.term = term;
      return this.getCommissionsAndCount();
    }

    setPagination(pe) {
      this.params.offset = pe.pageIndex;
      this.params.limit = pe.pageSize;

      return this.getCommissions();
    }

    sort(se) {
      this.params.order = se.active;
      this.params.orient = se.direction;

      return this.getCommissions();
    }

    search(text) {

    }

}
