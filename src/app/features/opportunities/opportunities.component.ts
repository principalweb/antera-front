import { Component, OnDestroy, OnInit, ViewEncapsulation, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { FormControl } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Observable, Subscription, forkJoin } from 'rxjs';

import { fuseAnimations } from '@fuse/animations';
import { FuseConfirmDialogComponent } from '@fuse/components/confirm-dialog/confirm-dialog.component';

import { OpportunityFormDialogComponent } from './opportunity-form/opportunity-form.component';
import { OrderFormDialogComponent } from '../../shared/order-form-dialog/order-form-dialog.component';
import { ApiService } from '../../core/services/api.service';
import { SelectionService } from 'app/core/services/selection.service';
import { unionBy, sortBy } from 'lodash';
import { OpportunitiesService } from 'app/core/services/opportunities.service';
import { AuthService } from 'app/core/services/auth.service';
import { OpportunityListComponent } from './opportunity-list/opportunity-list.component';
import { SourceFormComponent } from '../e-commerce/sources/source-form/source-form.component';
import { SourceDetails } from 'app/models/source';
import { MessageService } from 'app/core/services/message.service';
import { switchMap, distinctUntilChanged, debounceTime, map  } from 'rxjs/operators';
import { navigation } from '../../navigation/navigation';
import { ModuleTagDialogComponent } from 'app/shared/module-tag-dialog/module-tag-dialog.component'; 

@Component({
    selector     : 'opportunities-opportunities',
    templateUrl  : './opportunities.component.html',
    styleUrls    : ['./opportunities.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations   : fuseAnimations,
    providers: [
        SelectionService
    ]
})
export class OpportunitiesComponent implements OnInit, OnDestroy
{
    view = 'kanban-condensed';
    selectedDue = 'Show All';
    assignees = [];
    selectedAssignees = [];
    assigneeSearch = new FormControl('');
    onAssigneeSearch: Subscription;
    selectedCount: Number;
    isLoading = false;

    searchInput: FormControl;
    dialogRef: any;
    confirmDialogRef: MatDialogRef<FuseConfirmDialogComponent>;
    onViewChangedSubscription: any;
    show = false;
    viewMyItems = false;

    @ViewChild(OpportunityListComponent) opporList: OpportunityListComponent;

    loading = false;
    loaded = () => {
        this.loading = false;
    };
    tagDialogRef: MatDialogRef<ModuleTagDialogComponent>; 

    constructor(
        private opportunitiesService: OpportunitiesService,
        private router: Router,
        public dialog: MatDialog,
        private api: ApiService,
        public selection: SelectionService,
        private auth: AuthService,
        private msg: MessageService
    )
    {
        this.searchInput = new FormControl('');
    }

    ngOnInit()
    {   
        this.api.getDisplayMenu().subscribe((menuList: any[]) => {
            // for (let navItem of this.navigation){
            //     this.updateMenuByDisplayOption(navItem, menuList);
            //     if (navItem.children){
            //         let childList = navItem.children;
            //         for (let childItem of childList){
            //             this.updateMenuByDisplayOption(childItem, menuList);
            //             if (childItem.children){
            //                 let subChildList = childItem.children;
            //                 for (let subChildItem of subChildList)
            //                 {
            //                     this.updateMenuByDisplayOption(subChildItem, menuList);
            //                 }
            //             }
            //         }
            //     }
            // }
            if(this.auth.getCurrentUser().userType !== 'AnteraAdmin') {
                menuList.find((menuList) => {
                    if(menuList.name === 'order.sourcing') {
                        if(menuList.display === "0") {
                            this.show = true;
                            return true;
                        }
                    }
                })
            }
        });
         
        this.selectedAssignees = this.opportunitiesService.assigneeFilter;
        this.assignees = this.selectedAssignees;

        this.onViewChangedSubscription =
            this.opportunitiesService.onViewChanged
                .subscribe(view => this.view = view);
        this.onAssigneeSearch =
            this.assigneeSearch.valueChanges.pipe(
                debounceTime(300),
                distinctUntilChanged(),
                switchMap(searchText => {
                    this.isLoading = true;
                    return this.opportunitiesService.getUserAutoCompleteRequest(searchText)
                }),
            ).subscribe((users: any[]) => {
                this.isLoading = false;

                this.assignees = unionBy([
                    ...this.selectedAssignees,
                    ...users
                ]);
            });
    }

    ngOnDestroy()
    {
        this.onViewChangedSubscription.unsubscribe();
    }

    newOpportunity()
    {
        this.dialogRef = this.dialog.open(OpportunityFormDialogComponent, {
            panelClass: 'opportunity-form-dialog',
            data      : {
                action: 'new',
                service: this.opportunitiesService
            }
        });

        this.dialogRef.afterClosed()
            .subscribe((response: any) => {
                if ( !response )
                {
                    return;
                }

                this.opportunitiesService.createOpportunity(response)
                    .subscribe(() => {})
            });
    }

    newSource() {
        this.opportunitiesService.getOpportunity(this.selection.selectedIds[0])
            .subscribe((opportunity: any) => {
                this.dialogRef = this.dialog.open(SourceFormComponent, {
                    panelClass: 'antera-details-dialog',
                    data      : {
                        opportunity: opportunity,
                        action : 'new',
                    }
                });
        
                this.dialogRef.afterClosed()
                .subscribe((sourceDetails: SourceDetails) => {
                    if (!sourceDetails) return;
                    this.loading = true;
                    this.api.createSource(sourceDetails.toObject())
                        .subscribe((res: any) => {
                            this.loading = false;
                            this.router.navigate(['/e-commerce/sources', res.extra.id]);
                        }, ()=> {
                            this.loading = false;
                        });
                });
            });
    }

    newOrder(type)
    {
        const opportunity = this.opportunitiesService
            .getOpportunityFromList(this.selection.selectedIds[0]);

        forkJoin([
            this.api.getAccountDetails(opportunity.accountId),
            this.api.getContactDetails(opportunity.contactId)
        ]).subscribe(result => {
            const orderDlgRef = this.dialog.open(OrderFormDialogComponent, {
                panelClass: 'antera-details-dialog',
                data: {
                    action: 'new',
                    account: result[0],
                    contact: result[1],
                    opportunityNo: opportunity.opportunityNo,
                    type: type
                }
            });
          
            orderDlgRef.afterClosed()
                .subscribe(data => {
                    if (data && data.order && data.order.id) {
                        this.router.navigate([`/e-commerce/${type}s`, data.order.id]);
                    }
                });
        });
    }

    deleteOpportunities(ids) {
        if (this.confirmDialogRef) {
            return;
        }

        this.confirmDialogRef = this.dialog.open(FuseConfirmDialogComponent, {
            disableClose: false
        });

        this.confirmDialogRef.componentInstance.confirmMessage = 'Are you sure you want to delete this opportunity?';

        this.confirmDialogRef.afterClosed().subscribe(result => {
            if ( result )
            {
                this.opportunitiesService.deleteOpportunities(ids)
                    .subscribe(() => {
                        this.msg.show('Attempted to delete selected opportunities. If some leads were not deleted and permissions are enabled please confirm your access level.', 'success');
                    })
            }
            this.confirmDialogRef = null;
        });
    }

    deleteSelectedOpportunities() {
        this.deleteOpportunities(this.selection.selectedIds);
    }

    clearSearch(){
      if (this.searchInput.value.length > 0)
      this.searchInput.setValue('');
    }

    changeView(ev) {
        this.opportunitiesService.onViewChanged.next(ev.value);
    }

    changeAssignees() {
        this.opportunitiesService.filterByAssignees(this.selectedAssignees);
    }

    changeDue(ev) {
        this.selectedDue = ev.value;
        this.opportunitiesService.filterByDue(this.selectedDue);
    }

    clearAssigneeFilters() {
        this.selectedAssignees = [];
        this.assignees = [];
        this.opportunitiesService.assigneeFilter = [];
        this.selectedDue = "Show All";
        this.opportunitiesService.due = "Show All";
        this.opportunitiesService.filterByAssignees(this.selectedAssignees);
    }

    clearFilters() {
        this.searchInput.setValue('');
        this.viewMyItems = false;
        this.opportunitiesService.resetParams();
        this.opporList.loading = true;
        this.opportunitiesService.getOpportunitiesWithCount()
            .subscribe((res) => {
                this.opporList.loading = false;
            }, (err) => {
                this.opporList.loading = false;
            });
    }

    changeShowMyItems(ev) {
        if (this.viewMyItems)
            this.opportunitiesService.params.term.salesRepId = this.auth.getCurrentUser().userId;
        else 
            this.opportunitiesService.params.term.salesRepId = '';
        this.opporList.loading = true;
        this.opportunitiesService.getOpportunitiesWithCount()
            .subscribe((res) => {
                this.opporList.loading = false;
            }, (err) => {
                this.opporList.loading = false;
            });
    }

    openTagDialog() {
        console.log(this.selection.selectedCount);
        if (this.selection.selectedCount > 0) {
            
            let payload = {
                "term": {
                    "tagType": "Module Tag",
                    "moduleType": "Opportunities"
                  }
              };
            this.api.getTagList(payload).pipe(
                map((res: any) => res && res.TagArray ? sortBy(res.TagArray, 'tag' ) : [])
            ).subscribe((tagList: any[]) => {
                  
                    let dialogRef = this.dialog.open(ModuleTagDialogComponent, {
                        panelClass: 'opportunity-tags-dialog',
                        data: tagList
                    });
                    dialogRef.afterClosed()
                        .subscribe(data => {
                            console.log("data",data);
                            if (data && data.selectedTagList && data.selectedTagList.length > 0){
                                let selectedOpportunityList = this.selection.selectedIds;
                                this.api.addModuleTags({
                                    TagArray: data.selectedTagList,
                                    ModuleArray: selectedOpportunityList,
                                    module: 'Opportunities'
                                })
                                .subscribe((res: any) => {
                                    console.log(res);
                                    if (res){
                                        if (res.msg.length > 0) {
                                            this.msg.show(res.msg, 'error');
                                        } else {
                                            this.msg.show('Successfully tagged to tags selected.', 'success');
                                        }
                                    }
                                    else {
                                        this.msg.show('Unknown Error!', 'error');
                                    }
                                }, (err) => {
                                    this.msg.show(err.message, 'error');
                                });
                            }
                            else {
                                this.msg.show('You have not selected any tag to tag opportunity.', 'error');
                            }
                        });

                },(err) => {
                    this.msg.show(err.message, 'error');
                });
        } else {
            this.msg.show('Please select opportunities.', 'error');
        }        
    }
}
