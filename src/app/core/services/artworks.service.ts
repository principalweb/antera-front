import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { Observable, BehaviorSubject, Subject, of, forkJoin } from 'rxjs';
import * as moment from 'moment';
import { findIndex } from 'lodash';

import { Artwork } from '../../models';
import { ApiService } from './api.service';
import { MessageService } from './message.service';
import { SelectionService } from './selection.service';
import { AuthService } from './auth.service';
import { switchMap, map } from 'rxjs/operators';


@Injectable()
export class ArtworksService implements Resolve<any>
{
    onArtworksChanged: BehaviorSubject<Artwork[]>;
    onTotalCountChanged: BehaviorSubject<number>;
    onSelectionChanged: BehaviorSubject<string[]>;
    onSearchTextChanged: Subject<any> = new Subject();
    onStatusListChanged: BehaviorSubject<any> = new BehaviorSubject([]);
    onViewChanged: BehaviorSubject<any> = new BehaviorSubject('kanban-condensed');
    onFolderReady = new BehaviorSubject<any>(null);
    onArtworkChanged: BehaviorSubject<Artwork>;
    onClearFilters = new Subject();
    onProductDecoListChanged: BehaviorSubject<any> = new BehaviorSubject([]);
    onProductDecoListCountChanged: BehaviorSubject<any> = new BehaviorSubject(0);
    onProductDecoDataRemoved: Subject<any> = new Subject();

    artworks: Artwork[];
    designTypes = [];
    designTypesDetailsOptions = [];
    decoTypes = [];
    designLocations = [];
    due = 'Show All';
    assigneeFilter = [];
    projectFilter = [];
    orderFilter = [];
    isViewUserArtworks = false;
    searchText = '';
    rangeOptions = [
        { id: 'past', name: 'Today/Past Due', bg: { 'color': 'red' } },
        { id: 'today', name: 'Today', bg: { 'color': '#FFD700' } },
        { id: 'tomorrow', name: 'Tomorrow', bg: { 'color': '#FFD700' } },
        { id: 'twothree', name: '2-3 Days', bg: { 'color': '#FFA500' } },
        { id: 'fourseven', name: '4-7 Days', bg: { 'color': 'green' } },
        { id: 'thisweek', name: 'This Week', bg: { 'color': '#FFD700' } },
        { id: 'nextweek', name: 'Next Week', bg: { 'color': '#FFD700' } },
        { id: 'all', name: 'All', bg: { 'color': '' } }
    ];

    selectedRange = { id: 'all', name: 'All', bg: { 'color': '' } };

    onFilteredAssigneesChanged: BehaviorSubject<any[]> = new BehaviorSubject([]);
    onFilteredCustomersChanged: BehaviorSubject<any[]> = new BehaviorSubject([]);
    onFilteredOrdersChanged: BehaviorSubject<any[]> = new BehaviorSubject([]);
    onFilteredDesignTypesChanged: BehaviorSubject<any[]> = new BehaviorSubject([]);

    payload = {
        offset: 0,
        limit: 50,
        order: 'createdDate',
        orient: 'desc',
        term: {
            identity: '',
            designNo: '',
            customerName: '',
            orderNum: '',
            designTypeName: '',
            category: '',
            color: '',
            statusName: '',
            assignee: '',
            projectName: '',
            relatedOrders: '',
            duefilter:''
        }
    }

    constructor(
        private api: ApiService,
        private msg: MessageService,
        public selection: SelectionService,
        private authService: AuthService
    ) {
        this.onArtworksChanged = new BehaviorSubject([]);
        this.onTotalCountChanged = new BehaviorSubject(0);
        this.onSelectionChanged = new BehaviorSubject([]);
        this.onSearchTextChanged.subscribe(searchText => {
            this.searchText = searchText;
        });
        // Remove default assignee filter
        // const signedUser = this.authService.getCurrentUser();
        // this.assigneeFilter.push({
        //     id: signedUser.userId,
        //     name: `${signedUser.firstName} ${signedUser.lastName}`
        // });
    }

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> {

        if (route.queryParams.refType && route.queryParams.refType == 'User') {
            this.payload.term.assignee = route.queryParams.userName;
            this.payload.term.statusName = route.queryParams.status;
            this.payload.term.duefilter = route.queryParams.duefilter;
            if(route.queryParams.duefilter && route.queryParams.duefilter!=''){
                if(route.queryParams.duefilter=="today"){
                    this.selectedRange = {id: 'today', name: 'Today', bg:{'color': ''}};
                }else if(route.queryParams.duefilter=="tomorrow"){
                    this.selectedRange = {id: 'tomorrow', name: 'Tomorrow', bg:{'color': ''}};
                }else if(route.queryParams.duefilter=="nextweek"){
                    this.selectedRange = {id: 'nextweek', name: 'Next Week', bg:{'color': ''}};
                }else if(route.queryParams.duefilter=="thisweek"){
                    this.selectedRange = {id: 'thisweek', name: 'This Week', bg:{'color': ''}};
                }else if(route.queryParams.duefilter=="all"){
                    this.selectedRange = {id: 'all', name: 'All', bg:{'color': ''}};
                }                        
            }
            this.onViewChanged.next('list');
            return;
        }

        return this.getStatusList();
    }

    getArtworks(listType = 'kanban'): Observable<any> {
        let data: any = this.payload;
         if (this.onViewChanged.value !== 'list') {
             data = {
                 offset: 0,
                 limit: 500,
                 term: {}
             };
         }
        if(this.searchText != '' && this.searchText != null) {
            //this.payload.term.customerName:searchText
            Object.assign(this.payload.term,{customerName:this.searchText})
        }
        Object.assign(data,{permUserId:this.authService.getCurrentUser().userId})
        data.listType = listType;       

        return this.api.getArtworkList(data).pipe(
            map((response: any[]) => {
                this.artworks = response.map(data => {
                    const artwork = new Artwork(data);
                    return artwork;
                });

                const filtered = this.filterArtworks();
                this.onArtworksChanged.next(filtered);

                return response;
            })
        );
    }

    getArtworkCount(listType = 'kanban'): Observable<any> {
        let data: any = this.payload;

         if (this.onViewChanged.value !== 'list') {
             data = {
                 offset: 0,
                 limit: 500,
                 term: {}
             };
         }

        data.listType = listType;
        return this.api.getArtworkCount(data).pipe(
            map((response: number) => {
                this.onTotalCountChanged.next(response);
                return response;
            })
        )
    }

    filterArtworks() {
        let filtered = this.artworks;
        if (this.isViewUserArtworks) {
            const signedUser = this.authService.getCurrentUser();
            filtered = filtered.filter(
                (item: any) => !findIndex([{
                    id: signedUser.userId,
                    name: `${signedUser.firstName} ${signedUser.lastName}`
                }],
                    {
                        id: item.assignedId
                    })
            )
        }
        else {

            if (this.assigneeFilter.length > 0 && this.assigneeFilter[0] !== undefined) {
                filtered = filtered.filter(
                    (item: any) => !findIndex(this.assigneeFilter, {
                        id: item.assignedId
                    })
                )
            }

        }
        filtered = filtered.filter(
            (item: any) => {
                return this.inDateRange(item, this.selectedRange)
            }
        );

        if (this.projectFilter.length > 0 && this.projectFilter[0] !== undefined) {
            filtered = filtered.filter(
                (item: any) => !findIndex(this.projectFilter, {
                    id: item.projectId
                })
            )
        }


        if (this.orderFilter.length > 0 && this.orderFilter[0] !== undefined) {
            filtered = filtered.filter((item) => item.relatedOrders.some((related) => this.orderFilter.some((filtered) => filtered.id === related.orderId)));
        }

        this.paginate({
            // Reset pagination
            pageIndex: 0,
            pageSize: this.payload.limit
        });

        return filtered;
    }

    inDateRange(item, range): boolean {
        let cardDate = moment(item.dueDate).endOf('day');
        let curDate = moment().endOf('day');
        let endofweek = moment().endOf('week');
        let diff = cardDate.diff(curDate, 'hours');
        let diffendofweek = endofweek.diff(curDate, 'hours');

        if (range.id == 'past') { 
            return diff < 24;
        } else if (range.id == 'today') {
            return diff < 24  && diff >= 0;
        } else if (range.id == 'tomorrow') {
            return diff >= 24 && diff < 24 * 2;
        } else if (range.id == 'thisweek') {            
            return diff >= (0 - (24*7-diffendofweek)) && diff <= (diffendofweek);
        } else if (range.id == 'nextweek') {
            return diff > (diffendofweek) && diff <= (24 * 7 + diffendofweek);
        } else if (range.id == 'twothree') {
            return diff >= 24 * 2 && diff <= 24 * 3;
        } else if (range.id == 'fourseven') {
            return diff > 24 * 3 && diff <= 24 * 7;
        }

        return true;
    }

    inRelatedOrders(item, orders): boolean {
        return !findIndex(item, orders);
    }

    getArtwork(id: string) {
        return this.api.getArtworkDetails(id);
    }

    updateArtwork(artwork: Artwork) {
        return this.api.updateArtwork(artwork.toObject()).pipe(
            switchMap(() => this.getArtworks())
        )
    }

    deleteArtwork(artwork) {
        return this.api.deleteArtwork([artwork.id]).pipe(
            switchMap((response: any) => {
                if (response.status === "Success") {
                    this.msg.show("This item has been moved to the Recycle Bin", "info");
                    return this.getArtworks();
                }

                this.msg.show(response[0].msg, "error");
                return of(response);
            })
        );
    }

    deleteSelectedArtworks() {
        return this.api.deleteArtwork(this.selection.selectedIds).pipe(
            switchMap((response: any) => {
                if (response.status === "success") {
                    this.msg.show("The selected items have been moved to the Recycle Bin", "info");
                    return this.getArtworks();
                }

                this.msg.show(response[0].msg, "error");
                return of(response);
            })
        );
    }

    cloneSelectedArtworks() {
        return this.api.cloneArtwork(this.selection.selectedIds).pipe(
            switchMap((response: any) => {
                if (response.status === "success") {
                    this.msg.show("The selected items have been clone successfully", "info");
                    return this.getArtworks();
                }

                this.msg.show(response[0].msg, "error");
                return of(response);
            })
        );
    }

    assignSelectedArtworks(assignee) {
        let selectedArtworks = [];
      
        
        for (let id of this.selection.selectedIds) {
            let arr = this.artworks.find(x => x.id === id);
            Object.assign(arr,{estimated: assignee.estimated, assignedId: assignee.assignedId,assignee: assignee.assignee,statusId: 2, statusName: 'Assigned'});
            selectedArtworks.push(arr);
        }
       
        return this.api.assignSelectedArtworks(selectedArtworks).pipe(
            switchMap((response: any) => {
                if (response.status === "success") {
                    
                    this.msg.show("The selected artworks have been assigned successfully", "info");
                    this.selection.reset(false);
                    return this.getArtworks();
                }

                this.msg.show(response[0].msg, "error");
                return of(response);
            })
        );
    }

    getStatusList() {
        return this.api.getArtworkStatusList().pipe(
            map((list: any) => {
                this.onStatusListChanged.next(list);
            })
        );
    }

    addStatus(newStatus) {
        this.api.upsertArtworkStatus(newStatus)
            .subscribe((res: any) => {
                this.msg.show(res.msg, res.status);
                this.getStatusList().subscribe(() => { });
            });
    }

    updateStatus(status) {
        this.api.upsertArtworkStatus(status.label, status.id)
            .subscribe((res: any) => {
                this.msg.show(res.msg, res.status);
                this.getStatusList().subscribe(() => { });
            });
    }

    removeStatus(id) {
        this.api.deleteArtworkStatus(id)
            .subscribe((res: any) => {
                this.msg.show(res.msg, res.status);
                this.getStatusList().subscribe(() => { });
            });
    }

    filterByDueDate(due) {
        this.due = due;
        this.onArtworksChanged.next(
            this.filterArtworks()
        );
    }

    filterByAssignees(assignees) {
        this.assigneeFilter = assignees;
        this.onArtworksChanged.next(
            this.filterArtworks()
        );
    }

    filterByProjects(projects) {
        this.projectFilter = projects;
        this.onArtworksChanged.next(
            this.filterArtworks()
        );
    }
    filterByOrders(orders) {
        this.orderFilter = orders;
        this.onArtworksChanged.next(
            this.filterArtworks()
        );
    }


    viewUserArtworks(isViewUserArtworks) {
        this.isViewUserArtworks = isViewUserArtworks;
        this.onArtworksChanged.next(
            this.filterArtworks()
        );
    }

    getUserAutoCompleteRequest(term) {
        return this.api.post('/content/user-auto', {
            search: term
        });
    }

    getProjectsAutoCompleteRequest(term) {
        return this.api.post('/content/projects-auto', {
            search: term
        });
    }

    getOrdersAutoCompleteRequest(term) {
        return this.api.post('/content/order-auto', {
            search: term
        });
    }

    getUserAutocomplete(term) {
        this.api.post('/content/user-auto', {
            search: term
        }).subscribe((list: any[]) => {
            this.onFilteredAssigneesChanged.next(list);
        });
    }

    getCustomerAutocomplete(term) {
        return this.api.post('/content/customer-auto', {
            search: term
        }).subscribe((list: any[]) => {
            this.onFilteredCustomersChanged.next(list);
        });
    }

    getOrderAutocomplete(term) {
        return this.api.post('/content/order-auto', {
            search: term
        }).subscribe((list: any[]) => {
            this.onFilteredOrdersChanged.next(list);
        });
    }

    getDesignTypeAutocomplete(term) {
        return this.api.post('/content/design-auto', {
            search: term
        }).subscribe((list: any[]) => {
            this.onFilteredDesignTypesChanged.next(list);
        });
    }

    getAllDesignTypes() {
        if (this.designTypes.length > 0) {
            return of(this.designTypes);
        }

        return this.api.getAllDesignTypes().pipe(
            map((types: string[]) => {
                this.designTypes = types;
                return types;
            })
        );
    }

    getAllDesignTypesDetailsOptions() {
        if (this.designTypesDetailsOptions.length > 0) {
            return of(this.designTypesDetailsOptions);
        }
        return this.api.getAllDesignTypesDetailsOptions().pipe(
            map((types: string[]) => {
                this.designTypesDetailsOptions = types;
                return types;
            })
        );
    }


    getDesignLocations() {
        if (this.designLocations.length > 0) {
            return of(this.designLocations);
        }

        return this.api.getDesignLocations().pipe(
            map((locations: any) => {
                this.designLocations = locations;
                return locations;
            })
        );
    }

    changeView(view) {
        this.onViewChanged.next(view);
    }

    paginate(ev) {
        this.payload.offset = ev.pageIndex;
        this.payload.limit = ev.pageSize;
        return this.getArtworks('list');
    }

    sort(ev) {
        this.payload.order = ev.active;
        this.payload.orient = ev.direction;

        return this.getArtworks('list');
    }

    resetList() {
        this.payload.term = {
            identity: '',
            designNo: '',
            customerName: '',
            orderNum: '',
            designTypeName: '',
            category: '',
            color: '',
            statusName: '',
            assignee: '',
            projectName: '',
            relatedOrders: '',
            duefilter:''
        };

        return forkJoin([
            this.getArtworks('list'),
            this.getArtworkCount('list')
        ]);
    }

    // product-deco mapping related functions
    getProductDecoList(payload) {
        return this.api.post('/content/get-product-deco-list', payload)
            .subscribe((response: any) => {
                this.onProductDecoListChanged.next(response);
            }, err => {
                this.msg.show(err.message, 'error');
            });
    }

    getProductDecoCount(payload) {
        return this.api.post('/content/get-product-deco-count', payload)
            .subscribe((response: any) => {
                this.onProductDecoListCountChanged.next(response);
            }, err => {
                this.msg.show(err.message, 'error');
            });
    }

    getArtworkCustomers() {
        return this.api.post('/content/get-artwork-customers', {});
    }

    getDesignCustomers() {
        return this.api.post('/content/get-design-customers', {});
    }

    getDesigns() {
        return this.api.post('/content/get-designs', {});
    }

    getProductDecoData(id) {
        return this.api.post('/content/get-product-deco', { id: id });
    }

    updateProductDecoData(data) {
        return this.api.post('/content/update-product-deco', data);
    }

    removeProductDecoData(data) {
        return this.api.post('/content/remove-product-deco', data)
            .subscribe((response: any) => {
                this.onProductDecoDataRemoved.next(response);
                this.msg.show(response.msg, response.err);
            }, err => {
                this.onProductDecoDataRemoved.next(err);
                this.msg.show(err.message, 'error');
            });
    }
    // product-deco mapping related functions ends here

    filterRange(range) {
        this.selectedRange = range;
        this.onArtworksChanged.next(
            this.filterArtworks()
        );
    }

    autocompleteUsers(name) {
        return this.api.getUserAutocomplete(name);
    }

    setPinned(card) {
        return this.api.artworkSetPinned(card.id, card.pinned).pipe(
            map((res: any) => {
                return res;
            })
        )
    }
}
