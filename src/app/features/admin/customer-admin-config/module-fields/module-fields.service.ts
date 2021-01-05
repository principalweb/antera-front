import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, forkJoin } from 'rxjs';
import { ApiService } from 'app/core/services/api.service';
import { ModuleField } from 'app/models/module-field';
import { map, switchMap } from 'rxjs/operators';

@Injectable()
export class ModuleFieldsService {

  onModuleFieldsChanged: BehaviorSubject<any[]> = new BehaviorSubject([]);
  onModuleFieldsCountChanged: BehaviorSubject<number> = new BehaviorSubject(0);

  params = {
    offset: 0,
    limit: 50,
    order:"fieldName",
    orient:"asc",
    term: {
      module: 'Orders',
      moduleSection: '',
      fieldName: '',
      defaultLabelName: '',
      labelName: '',
      isVisible: '',
      required: '',
      dateModified: '',
      modifiedByName: ''
    }
  };

  constructor(
    private api: ApiService,
  )
  {

  }

  getModuleFieldsAndCount()
  {
    return forkJoin([
      this.getModuleFields(),
      this.getModuleFieldsCount()
    ]);
  }

  getModuleFields()
  {
    return this.api.getFieldsList(this.params).pipe(
        map((response: any) => {
          this.onModuleFieldsChanged.next(
          response.map(moduleField => 
            new ModuleField(moduleField)
          )
        );
        return response;
      })
    );
      
  }

  getModuleFieldsCount()
  {
    return this.api.getFieldsCount(this.params).pipe(
      map((response: any) => {
        this.onModuleFieldsCountChanged.next(response.count);
        return response;
      })
    );
  }

  updateModuleField(field: ModuleField)
  {
      return this.api.updateModuleField(field.toObject()).pipe(
          // switchMap(() => this.getModuleFields())
      );
  }

  setPagination(pe) {
    this.params.offset = pe.pageIndex;
    this.params.limit = pe.pageSize;

    return this.getModuleFields();
  }

  sort(se) {
    this.params.order = se.active;
    this.params.orient = se.direction;

    return this.getModuleFields();
  }

  filter(term) {
    this.params.term = term;
    return this.getModuleFieldsAndCount();
  }
}
