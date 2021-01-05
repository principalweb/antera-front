import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, forkJoin } from 'rxjs';
import { ApiService } from 'app/core/services/api.service';
import { SelectionService } from 'app/core/services/selection.service';
import { AdditionalCharge } from 'app/models/additional-charge-extend';
import { map, switchMap } from 'rxjs/operators';

@Injectable()
export class AdditionalChargesService {

  onAdditionalChargesChanged: BehaviorSubject<any[]> = new BehaviorSubject([]);
  onAdditionalChargesCountChanged: BehaviorSubject<number> = new BehaviorSubject(0);
  
  params = {
    offset: 0,
    limit: 50,
    order:"name",
    orient:"asc",
    term: {
      name: '',
      description: '',
      cost: '',
      price: '',
      item: '',
      itemCode: '',
      dateModified: '',
      modifiedByName: '',
      status: ''
    }
  };

  constructor(
    private api: ApiService,
    private selection: SelectionService
  )
  {

  }

  getAdditionalChargesAndCount()
  {
    return forkJoin([
      this.getAdditionalCharges(),
      this.getAdditionalChargesCount()
    ]);
  }

  getAdditionalCharges()
  {
    return this.api.getAdditionalChargesList(this.params).pipe(
      map((response: any) => {
        this.onAdditionalChargesChanged.next(
          response.map(addCharge =>
            new AdditionalCharge(addCharge)
          )
        );
        return response;
      })
    );
  }

  getAdditionalChargesCount()
  {
    return this.api.getAdditionalChargesCount(this.params).pipe(
      map((response: any) => {
        this.onAdditionalChargesCountChanged.next(response.count);
        return response;
      })
    );
  }

  deleteAdditionalCharges()
  {
    return this.api.deleteAdditionalCharges({ids:this.selection.selectedIds}).pipe(
      switchMap(() => this.getAdditionalChargesAndCount())
    );
  }

  getAdditionalChargeDetail(id)
  {
    return this.api.getAdditionalChargeDetail(id);
  }

  createAdditionalCharge(addChargeDetail: AdditionalCharge)
  {
    return this.api.createAdditionalChargeDetail(addChargeDetail.toObject()).pipe(
      switchMap(() => this.getAdditionalChargesAndCount())
    );
  }

  updateAdditionalCharge(addChargeDetail: AdditionalCharge)
  {
    return this.api.updateAdditionalChargeDetail(addChargeDetail.toObject()).pipe(
      switchMap(() => this.getAdditionalCharges())
    );
  }

  filter(term) {
    this.params.term = term;
    return this.getAdditionalChargesAndCount();
  }

  setPagination(pe) {
    this.params.offset = pe.pageIndex;
    this.params.limit = pe.pageSize;

    return this.getAdditionalCharges();
  }

  sort(se) {
    this.params.order = se.active;
    this.params.orient = se.direction;

    return this.getAdditionalCharges();
  }
}
