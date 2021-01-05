import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable, BehaviorSubject, forkJoin } from 'rxjs';
import { ApiService } from 'app/core/services/api.service';
import { SelectionService } from 'app/core/services/selection.service';
import { map, switchMap } from 'rxjs/operators';

@Injectable()
export class DropdownsService {

  onDropdownsChanged: BehaviorSubject<any[]> = new BehaviorSubject([]);
  onDropdownsCountChanged: BehaviorSubject<number> = new BehaviorSubject(0);

  params = {
    offset: 0,
    limit: 50,
    order:"name",
    orient:"asc",
    term: {
      name: '',
      labelName: '',
      description: '',
      modules: '',
      createdByName: '',
      modifiedByName: '',
      dateModified: ''
    }
  };

    constructor(
      private api: ApiService,
      private selection: SelectionService
    ) { 

    }

    getDropdownsAndCount()
    {
      return forkJoin([
        this.getDropdowns(),
        this.getDropdownsCount()
      ]);
    }

    getDropdowns()
    {
      return this.api.getDropdownsList(this.params).pipe(
        map((response: any) => {
          this.onDropdownsChanged.next(response);
          return response;
        })
      );
    }

    getDropdownsCount()
    {
      return this.api.getDropdownsCount(this.params).pipe(
        map((response: any) => {
          this.onDropdownsCountChanged.next(response.count);
          return response;
        })
      );
    }

    deleteDropdown(id)
    {
        return this.api.deleteDropdowns({dropdowns:[id]}).pipe(
          switchMap(() => this.getDropdownsAndCount())
        );
    }

    deleteSelectedDropdowns() {
        return this.api.deleteDropdowns({dropdowns:this.selection.selectedIds}).pipe(
            switchMap(() => this.getDropdownsAndCount())
        );
    }

    filter(term) {
      this.params.term = term;
      return this.getDropdownsAndCount();
    }

    setPagination(pe) {
      this.params.offset = pe.pageIndex;
      this.params.limit = pe.pageSize;

      return this.getDropdowns();
    }

    sort(se) {
      this.params.order = se.active;
      this.params.orient = se.direction;

      return this.getDropdowns();
    }

}
