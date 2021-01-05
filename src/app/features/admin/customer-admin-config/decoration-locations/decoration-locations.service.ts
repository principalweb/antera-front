import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, forkJoin } from 'rxjs';
import { ApiService } from 'app/core/services/api.service';
import { SelectionService } from 'app/core/services/selection.service';
import { DecorationLocation, DecorationLocationDetails } from 'app/models/decoration-location';
import { map, switchMap } from 'rxjs/operators';

@Injectable()
export class DecorationLocationsService {

  onDecorationLocationsChanged: BehaviorSubject<any[]> = new BehaviorSubject([]);
  onDecorationLocationsCountChanged: BehaviorSubject<number> = new BehaviorSubject(0);
  
  params = {
    offset: 0,
    limit: 50,
    order:"locationName",
    orient:"asc",
    term: {
      locationName: '',
      locationHexColor: '',
      description: '',
      modifiedByName: '',
      createdByName: '',
      dateModified: '',
      dateEntered: ''
    }
  };

  constructor(
    private api: ApiService,
    private selection: SelectionService
  )
  {

  }

  getDecorationLocationsAndCount()
  {
    return forkJoin([
      this.getDecorationLocations(),
      this.getDecorationLocationsCount()
    ]);
  }

  getDecorationLocations()
  {
    return this.api.getDecorationLocationsList(this.params).pipe(
      map((response: any) => {
        this.onDecorationLocationsChanged.next(
          response.map(decoLocation =>
            new DecorationLocation(decoLocation)
          )
        );
        return response;
      })
    );
  }

  getDecorationLocationsCount()
  {
    return this.api.getDecorationLocationsCount(this.params).pipe(
      map((response: any) => {
        this.onDecorationLocationsCountChanged.next(response.count);
        return response;
      })
    );
  }

  deleteDecorationLocations()
  {
    return this.api.deleteDecorationLocations({ids:this.selection.selectedIds}).pipe(
      switchMap(() => this.getDecorationLocationsAndCount())
    );
  }

  getDecorationLocationDetail(id)
  {
    return this.api.getDecorationLocationDetail(id);
  }

  createDecorationLocation(decoLocationDetail: DecorationLocationDetails)
  {
    return this.api.createDecorationLocationDetail(decoLocationDetail.toObject()).pipe(
      switchMap(() => this.getDecorationLocationsAndCount())
    );
  }

  updateDecorationLocation(decoLocationDetail: DecorationLocationDetails)
  {
    return this.api.updateDecorationLocationDetail(decoLocationDetail.toObject()).pipe(
      switchMap(() => this.getDecorationLocations())
    );
  }

  filter(term) {
    this.params.term = term;
    return this.getDecorationLocationsAndCount();
  }

  setPagination(pe) {
    this.params.offset = pe.pageIndex;
    this.params.limit = pe.pageSize;

    return this.getDecorationLocations();
  }

  sort(se) {
    this.params.order = se.active;
    this.params.orient = se.direction;

    return this.getDecorationLocations();
  }
}
