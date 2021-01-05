import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable, BehaviorSubject, forkJoin } from 'rxjs';
import { ApiService } from 'app/core/services/api.service';
import { DecorationCharge, DecorationChargeDetails } from 'app/models/decoration-charge';
import { SelectionService } from 'app/core/services/selection.service';
import { EmailTemplate } from 'app/models/email-template';
import { switchMap, map } from 'rxjs/operators';

@Injectable()
export class EmailTemplatesService {

  onListChanged: BehaviorSubject<DecorationCharge[]> = new BehaviorSubject([]);
  onCountChanged: BehaviorSubject<number> = new BehaviorSubject(0);

  params = {
    offset: 0,
    limit: 50,
    order:'name',
    orient:'asc',
    term: {
      name: '',
      description: '',
      dateEntered: '',
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
      return this.getListAndCount();
    }

    getListAndCount()
    {
      return forkJoin([
        this.getList(),
        this.getCount()
      ]);
    }

    getList()
    {
      return this.api.getEmailTemplatesList(this.params).pipe(
        map((response: any) => {
          this.onListChanged.next(response);
          return response;
        }),
      );
    }

    getCount()
    {
      return this.api.getEmailTemplatesCount(this.params).pipe(
        map((response: any) => {
          this.onCountChanged.next(response.count);
          return response;
        }),
      );
    }

    create(emailTemplate: EmailTemplate)
    {
        return this.api.createEmailTemplate(emailTemplate.toObject()).pipe(
            switchMap(() => this.getListAndCount()),
        );
    }

    update(emailTemplate: EmailTemplate)
    {
        return this.api.updateEmailTemplate(emailTemplate.toObject()).pipe(
            switchMap(() => this.getList()),
        );
    }

    delete(id)
    {
        return this.api.deleteEmailTemplates([id]).pipe(
            switchMap(() => this.getListAndCount()),
        );
    }
    deleteSelected() {
        return this.api.deleteEmailTemplates(this.selection.selectedIds).pipe(
            switchMap(() => this.getListAndCount()),
        );
    }

    search(text) {

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
    filter(term) {
      this.params.term = term;
      return this.getListAndCount();
    }
}
