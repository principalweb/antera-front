import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, forkJoin } from 'rxjs';
import { ApiService } from 'app/core/services/api.service';
import { SelectionService } from 'app/core/services/selection.service';
import { Uom, UomDetails } from 'app/models/uom';
import { map, switchMap } from 'rxjs/operators';

@Injectable()
export class UomService {

  onUomChanged: BehaviorSubject<any[]> = new BehaviorSubject([]);
  onUomCountChanged: BehaviorSubject<number> = new BehaviorSubject(0);

  params = {
    offset: 0,
    limit: 50,
    order:"name",
    orient:"asc",
    term: {
      name: '',
      type: '',
      uomGroupId: '',
      abbreviation:'',
      conversionRatio:'',
    }
  };

  constructor(
    private api: ApiService,
    private selection: SelectionService
  ) { 

  }

  getUomAndCount()
  {
    return forkJoin([
      this.getUom(),
      this.getUomCount()
    ]);
  }

  getUomGroupsListOnly()
  {
    return this.api.getUomGroupsListOnly().pipe(
      map((response: any) => {
        return response;
      })
    );
  }
  getUomAll()
  {
    return this.api.getUomListOnly().pipe(
      map((response: any) => {
        this.onUomChanged.next(
          response.map(uom =>
            new Uom(uom)
          )
        );
        return response;
      })
    );
  }
  getUom()
  {
    return this.api.getUomList(this.params).pipe(
      map((response: any) => {
        this.onUomChanged.next(
          response.map(uom =>
            new Uom(uom)
          )
        );
        return response;
      })
    );
  }

  getUomCount()
  {
    return this.api.getUomCount(this.params).pipe(
      map((response: any) => {
        this.onUomCountChanged.next(response.count);
        return response;
      })
    );
  }

  updateUomDetails(uomDetails: UomDetails)
  {
      return this.api.updateUom(uomDetails.toObject()).pipe(
          switchMap(() => this.getUom())
      );
  }

  createUomDetails(uomDetails: UomDetails)
  {
      return this.api.createUom(uomDetails.toObject()).pipe(
          switchMap(() => this.getUomAndCount())
      );
  }

  filter(term) {
    this.params.term = term;
    return this.getUomAndCount();
  }

  setPagination(pe) {
    this.params.offset = pe.pageIndex;
    this.params.limit = pe.pageSize;

    return this.getUom();
  }

  sort(se) {
    this.params.order = se.status;
    this.params.orient = se.direction;

    return this.getUom();
  }

  getFinancialAccounts() {
    return this.api.getFinancialAccountList();
  }
}
