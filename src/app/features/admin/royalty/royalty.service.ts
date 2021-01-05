import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { Observable ,  BehaviorSubject, forkJoin } from 'rxjs';
import { ApiService } from 'app/core/services/api.service';
import { SelectionService } from 'app/core/services/selection.service';


import { Franchise, FranchiseDetails, CapDetails } from 'app/models';
import { map, switchMap } from 'rxjs/operators';


@Injectable()

export class RoyaltyService  implements Resolve<any>
{
    onFranchiseChanged: BehaviorSubject<Franchise[]> = new BehaviorSubject([]);
    onFranchiseCountChanged: BehaviorSubject<number> = new BehaviorSubject(0);
    onCapChanged: BehaviorSubject<CapDetails[]> = new BehaviorSubject([]);
    onCapCountChanged: BehaviorSubject<number> = new BehaviorSubject(0);


    params = {
        offset: 0,
        limit: 50,
        order:"franchiseName",
        orient:"asc",
        term: {
            franchiseName: '',
            franchiseNumber: '',
            url: '',
            dateCreated: '',
            createdBy: ''
        }
    };

   // viewMyItems = false;
    capParams = {
        offset: 0,
        limit: 50,
        order:"capCode",
        orient:"asc",
        term: {
            capCode: '',
            capCycle: '',
            capPercent: '',
            capMin: '',
            capMax: '',
            adPercent: '',
            adMin: ''
        }
    };



  constructor(private api: ApiService, private selection: SelectionService)
  { }

    /**
     * The Franchise App Main Resolver
     * @param {ActivatedRouteSnapshot} route
     * @param {RouterStateSnapshot} state
     * @returns {Observable<any> | Promise<any> | any}
     */
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any>
    {
        return this.getFranchiseAndCount();
    }

    getFranchise()
    {
        return this.api.getFrachiseList(this.params).pipe(
            map((response: any) => {
                this.onFranchiseChanged.next(response);
                return response;
            })
        )
    }

    getFranchiseCount()
    {
        return this.api.getFranchiseCount(this.params).pipe(
            map((response: any) => {
                this.onFranchiseCountChanged.next(response.count);
                return response;
            })
        );
    }



    getFranchiseAndCount()
    {
        return forkJoin([
            this.getFranchise(),
            this.getFranchiseCount()
        ]);
    }

    createFranchise(franchise: FranchiseDetails)
    {
        return this.api.createFranchise(franchise.toObject()).pipe(
            switchMap(() => this.getFranchise())
        );
    }

    updateFranchise(franchise: FranchiseDetails)
    {
        return this.api.updateFranchise(franchise.toObject()).pipe(
            switchMap(() => this.getFranchise())
        );
    }

    deleteFranchise(id)
    {
        return this.api.deleteFranchise(id).pipe(
            switchMap(() => this.getFranchiseAndCount())
        );
    }

/*    deleteSelectedFranchise() {
        return this.api.deleteFranchise(this.selection.selectedIds)
            .switchMap(() => this.getFranchiseAndCount());
    }*/



    setPagination(pe) {
        this.params.offset = pe.pageIndex;
        this.params.limit = pe.pageSize;

        return this.getFranchise();
    }

    sort(se) {
        this.params.order = se.active;
        this.params.orient = se.direction;

        return this.getFranchise();
    }

    filter(term) {
        this.params.term = term;

        return this.getFranchiseAndCount();
    }

    createCap(cap: CapDetails)
    {
        return this.api.createCap(cap.toObject()).pipe(
            switchMap(() => this.getCap())
        );
    }

    updateCap(franchise: CapDetails)
    {
        return this.api.updateCap(franchise.toObject()).pipe(
            switchMap(() => this.getFranchise())
        );
    }


    getCap()
    {
        return this.api.getCapList(this.capParams).pipe(
            map((response: any) => {
                this.onCapChanged.next(response);
                return response;
            })
        );
    }

    getCapCount()
    {
        return this.api.getCapCount(this.capParams).pipe(
            map((response: any) => {
                this.onCapCountChanged.next(response.count);
                return response;
            })
        );
    }



    getCapAndCount()
    {
        return forkJoin([
            this.getCap(),
            this.getCapCount()
        ]);
    }


    setPaginationCap(pe) {
        this.capParams.offset = pe.pageIndex;
        this.capParams.limit = pe.pageSize;

        return this.getCapAndCount();
    }

    filterCap(term) {
        this.capParams.term = term;

        return this.getCapAndCount();
    }

    sortCap(se) {
        this.capParams.order = se.active;
        this.capParams.orient = se.direction;

        return this.getCap();
    }


/*    filterViewMyItem(userId) {
        if (this.viewMyItems)
            this.params.term.salesRepId = userId;
        else 
            this.params.term.salesRepId = '';
        return this.getFranchiseAndCount();
    }*/

    search(text) {

    }
}
