import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, forkJoin } from 'rxjs';
import { ApiService } from 'app/core/services/api.service';
import { SelectionService } from 'app/core/services/selection.service';
import { DecorationType, DecorationTypeDetails } from 'app/models/decoration-type';
import { map, switchMap } from 'rxjs/operators';

@Injectable()
export class DecorationTypesService {

  onDecorationTypesChanged: BehaviorSubject<any[]> = new BehaviorSubject([]);
  onDecorationTypesCountChanged: BehaviorSubject<number> = new BehaviorSubject(0);

  params = {
    offset: 0,
    limit: 50,
    order:"name",
    orient:"asc",
    term: {
      name: '',
      detailName: '',
      active: '',
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

  getDecorationTypesAndCount()
  {
    return forkJoin([
      this.getDecorationTypes(),
      this.getDecorationTypesCount()
    ]);
  }

  getDecorationTypesAll()
  {
    return this.api.getDecoTypeGroupsListOnly(this.params).pipe(
      map((response: any) => {
        return response;
      })
    );
  }
  getDecorationTypes()
  {
    return this.api.getDecorationTypesList(this.params).pipe(
      map((response: any) => {
        this.onDecorationTypesChanged.next(
          response.map(decoType =>
            new DecorationType(decoType)
          )
        );
        return response;
      })
    );
  }

  getDecorationTypesCount()
  {
    return this.api.getDecorationTypesCount(this.params).pipe(
      map((response: any) => {
        this.onDecorationTypesCountChanged.next(response.count);
        return response;
      })
    );
  }

  updateDecorationTypeDetails(decoTypeDetails: DecorationTypeDetails)
  {
      return this.api.updateDecorationType(decoTypeDetails.toObject()).pipe(
          switchMap(() => this.getDecorationTypes())
      );
  }

  createDecorationTypeDetails(decoTypeDetails: DecorationTypeDetails)
  {
      return this.api.createDecorationType(decoTypeDetails.toObject()).pipe(
          switchMap(() => this.getDecorationTypesAndCount())
      );
  }

  filter(term) {
    this.params.term = term;
    return this.getDecorationTypesAndCount();
  }

  setPagination(pe) {
    this.params.offset = pe.pageIndex;
    this.params.limit = pe.pageSize;

    return this.getDecorationTypes();
  }

  sort(se) {
    this.params.order = se.active;
    this.params.orient = se.direction;

    return this.getDecorationTypes();
  }

  getFinancialAccounts() {
    return this.api.getFinancialAccountList();
  }
}
