import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable, BehaviorSubject, forkJoin } from 'rxjs';
import { ApiService } from 'app/core/services/api.service';
import { DecorationCharge, DecorationChargeDetails } from 'app/models/decoration-charge';
import { SelectionService } from 'app/core/services/selection.service';
import { map, switchMap } from 'rxjs/operators';

@Injectable()
export class DecorationFeesService {

  onDecoChargesChanged: BehaviorSubject<DecorationCharge[]> = new BehaviorSubject([]);
  onDecoChargesCountChanged: BehaviorSubject<number> = new BehaviorSubject(0);

  params = {
    offset: 0,
    limit: 50,
    order:"name",
    orient:"desc",
    term: {
        id: '',
        name: '',
        vendorId: '',
        vendorName: '',
        decoratorType: '',
        decoratorSubType: '',
        decorationIdentifier: '',
        stitchesStart: '',
        stitchesUpto: '',
        setupCharge: '',
        qunatityStart: '',
        quantityUpto: '',
        price: '',
        salePrice: '',
        setupChargeSalePrice: '',
        decorationDetail: ''
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
      return this.getDecorationChargesAndCount();
    }

    getDecorationChargesAndCount()
    {
      return forkJoin([
        this.getDecoCharges(),
        this.getDecoChargesCount()
      ]);
    }

    getDecoCharges()
    {
      return this.api.getDecoChargesList(this.params).pipe(
        map((response: any) => {
          this.onDecoChargesChanged.next(response);
          return response;
        })
      );
    }

    getDecoChargesCount()
    {
      return this.api.getDecoChargesCount(this.params).pipe(
        map((response: any) => {
          this.onDecoChargesCountChanged.next(response.count);
          return response;
        })
      );
    }

    createDecoCharge(decoCharge: DecorationChargeDetails)
    {
        return this.api.createDecoCharge(decoCharge.toObject()).pipe(
            switchMap(() => this.getDecorationChargesAndCount())
        );
    }

    updateDecoCharge(decoCharge: DecorationChargeDetails)
    {
        return this.api.updateDecoCharge(decoCharge.toObject()).pipe(
            switchMap(() => this.getDecoCharges())
        );
    }

    deleteDecoCharge(id)
    {
        return this.api.deleteDecoCharges([id]).pipe(
            switchMap(() => this.getDecorationChargesAndCount())
        );
    }

    deleteSelectedDecoCharges() {
        return this.api.deleteDecoCharges(this.selection.selectedIds).pipe(
            switchMap(() => this.getDecorationChargesAndCount())
        );
    }

    filter(term) {
      this.params.term = term;
      return this.getDecorationChargesAndCount();
    }

    search(text) {

    }

    setPagination(pe) {
      this.params.offset = pe.pageIndex;
      this.params.limit = pe.pageSize;

      return this.getDecoCharges();
    }

    sort(se) {
      this.params.order = se.active;
      this.params.orient = se.direction;

      return this.getDecoCharges();
    }

}
