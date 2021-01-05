import { Component, OnDestroy, OnInit, ViewEncapsulation, ViewChild, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { unionBy } from 'lodash';
import { fuseAnimations } from '@fuse/animations';
import { FuseConfirmDialogComponent } from '@fuse/components/confirm-dialog/confirm-dialog.component';
import { ArtworksService } from 'app/core/services/artworks.service';
import { ActivatedRoute } from '@angular/router';
import { FuseArtworksListComponent } from '../artworks-list/artworks-list.component';
import { debounceTime, distinctUntilChanged, switchMap, map  } from 'rxjs/operators';
import { ArtistDialogComponent } from 'app/features/artworks/board/list/artist-dialog/artist-dialog.component';
import { MessageService } from 'app/core/services/message.service';
import { ModuleTagDialogComponent } from 'app/shared/module-tag-dialog/module-tag-dialog.component'; 
import { ApiService } from 'app/core/services/api.service';
import { sortBy } from 'lodash';

@Component({
    selector     : 'fuse-artworks',
    templateUrl  : './artworks.component.html',
    styleUrls    : ['./artworks.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations   : fuseAnimations,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FuseArtworksComponent implements OnInit, OnDestroy
{
    @ViewChild('listComponent') listComponent: FuseArtworksListComponent;

    selectedCount: number;
    searchInput: FormControl;
    onSelectionSubscription: Subscription;
    onViewChangedSubscription: Subscription;

    confirmDialogRef: MatDialogRef<FuseConfirmDialogComponent>;

    mode = 'kanban-condensed';
    assignees = [];
    projects = [];
    orders = [];
    selectedAssignees = [];
    selectedProjects = [];
    selectedOrders = [];
    selectedDue = 'Show All';
    isUserArtworks = false; 
    assigneeSearch = new FormControl('');
    projectSearch = new FormControl('');
    orderSearch = new FormControl('');
    onAssigneeSearch: Subscription;
    onProjectSearch: Subscription;
    onOrderSearch: Subscription;
    rangeOptions: any[];
    dialogRef: MatDialogRef<ArtistDialogComponent>;
    selectedRange = {id: 'all', name: 'All', bg:{'color': ''}};
    selectedArtworks = [];

    isLoading = false;

    constructor(
        public dialog: MatDialog,
        private artworksService: ArtworksService,
        private router: Router,
        private route: ActivatedRoute,
        private cd: ChangeDetectorRef,
        private api: ApiService,
        private msg: MessageService,
    )
    {
        this.searchInput = new FormControl('');
        this.route.queryParamMap.subscribe(paramMap => {
            const searchText = paramMap.get('search');
            this.searchInput.setValue(searchText);
            this.artworksService.onSearchTextChanged.next(searchText);
            if(paramMap.get('duefilter') && paramMap.get('duefilter')!=''){
                if(paramMap.get('duefilter')=="today"){
                    this.selectedRange = {id: 'today', name: 'Today', bg:{'color': ''}};
                }else if(paramMap.get('duefilter')=="tomorrow"){
                    this.selectedRange = {id: 'tomorrow', name: 'Tomorrow', bg:{'color': ''}};
                }else if(paramMap.get('duefilter')=="nextweek"){
                    this.selectedRange = {id: 'nextweek', name: 'Next Week', bg:{'color': ''}};
                }else if(paramMap.get('duefilter')=="thisweek"){
                    this.selectedRange = {id: 'thisweek', name: 'This Week', bg:{'color': ''}};
                }else if(paramMap.get('duefilter')=="all"){
                    this.selectedRange = {id: 'all', name: 'All', bg:{'color': ''}};
                }
            }
        });
    }

    ngOnInit()
    {
        this.selectedAssignees = this.artworksService.assigneeFilter;
        this.selectedProjects = this.artworksService.projectFilter;
        this.selectedOrders = this.artworksService.orderFilter;
        this.assignees = this.selectedAssignees;
        this.projects = this.selectedProjects;
        this.orders = this.selectedOrders;
        this.onSelectionSubscription =
            this.artworksService.onSelectionChanged
                .subscribe(selection => {
                    this.selectedCount = selection.length;
                    this.cd.markForCheck();
                });

        this.searchInput.valueChanges.pipe(
                debounceTime(300),
                distinctUntilChanged(),
            ).subscribe(searchText => {
                this.artworksService.onSearchTextChanged.next(searchText);
            });


        this.onAssigneeSearch =
            this.assigneeSearch.valueChanges.pipe(
                debounceTime(300),
                distinctUntilChanged(),
                switchMap(searchText => {
                    this.isLoading = true;
                    this.cd.markForCheck();
                    return this.artworksService.getUserAutoCompleteRequest(searchText);
                })
            ).subscribe((users: any[]) => {
                    this.isLoading = false;
                    this.assignees = unionBy([
                        ...this.selectedAssignees,
                        ...users
                    ]);
                    this.cd.markForCheck();
                });

        this.onProjectSearch =
            this.projectSearch.valueChanges.pipe(
                debounceTime(300),
                distinctUntilChanged(),
                switchMap(searchText => {
                    this.isLoading = true;
                    this.cd.markForCheck();
                    return this.artworksService.getProjectsAutoCompleteRequest(searchText);
                })
            ).subscribe((projects: any[]) => {
                    this.isLoading = false;
                    this.projects = unionBy([
                        ...this.selectedProjects,
                        ...projects
                    ]);
                    this.cd.markForCheck();
                });

        this.onOrderSearch =
            this.orderSearch.valueChanges.pipe(
                debounceTime(300),
                distinctUntilChanged(),
                switchMap(searchText => {
                    this.isLoading = true;
                    this.cd.markForCheck();
                    return this.artworksService.getOrdersAutoCompleteRequest(searchText);
                })
            ).subscribe((orders: any[]) => {
                    this.isLoading = false;
                    this.orders = unionBy([
                        ...this.selectedOrders,
                        ...orders
                    ]);
                    this.cd.markForCheck();
                });


        this.onViewChangedSubscription =
            this.artworksService.onViewChanged
                .subscribe(view => {
                    this.mode = view;
                    this.cd.markForCheck();
                });
        this.rangeOptions = this.artworksService.rangeOptions;
        this.cd.markForCheck();
    }

    ngOnDestroy()
    {
        this.onSelectionSubscription.unsubscribe();
    }

    newArtwork()
    {
        this.router.navigate(['/artworks/new']);
    }

    assignArtist(dialogTitle, artwork, artist = 'both') 
    {
      this.dialogRef = this.dialog.open(ArtistDialogComponent, {
          panelClass: 'antera-details-dialog',
          width: '50%',
          data      : {
            dialogTitle: dialogTitle,
            artwork: artwork,
            artist: artist
          }
      });

      this.dialogRef.afterClosed()
          .subscribe((data) => {
      });

    }

    deleteSelectedArtworks()
    {
        this.confirmDialogRef = this.dialog.open(FuseConfirmDialogComponent, {
            disableClose: false
        });

        this.confirmDialogRef.componentInstance.confirmMessage = 'Are you sure you want to delete all selected artwork?';

        this.confirmDialogRef.afterClosed().subscribe(result => {
            if ( result ) {
                this.listComponent.loading = true;
                this.artworksService.deleteSelectedArtworks()
                    .subscribe(
                        () => {
                            this.listComponent.loading = false;
                            this.cd.detectChanges();
                        },
                        () => {
                            this.listComponent.loading = false;
                            this.cd.detectChanges();
                        }
                    );
            }
            this.confirmDialogRef = null;
        });
    }

    cloneSelectedArtworks() {
        this.listComponent.loading = true;
        this.artworksService.cloneSelectedArtworks()
        .subscribe(
            () => {
                this.listComponent.loading = false;
                this.cd.detectChanges();
            },
            () => {
                this.listComponent.loading = false;
                this.cd.detectChanges();
            }
        );
    }

    assignSelectedArtworks() {
        if(this.artworksService.selection.selectedIds.length === 0) {
            this.msg.show("Please select artwork", "error");
            return;
        }
        this.assignArtist('Assign Artist and Estimate', {}, 'both');
        
    }
 
    changeView(ev) {
        this.artworksService.changeView(ev.value);
    }

    changeDue(ev) {
        this.selectedDue = ev.value;
        this.artworksService.filterByDueDate(this.selectedDue);
    }

    viewUserArtworks() {
        this.artworksService.viewUserArtworks(this.isUserArtworks);
    }

    changeAssignees() {
        this.artworksService.filterByAssignees(this.selectedAssignees);
    }

    changeProjects() {
        this.artworksService.filterByProjects(this.selectedProjects);
    }

    changeOrders() {
        this.artworksService.filterByOrders(this.selectedOrders);
    }

    clearSearch(){
      this.searchInput.setValue('');
    }

    clearFilters() {
        this.artworksService.assigneeFilter = [];
        this.artworksService.projectFilter = [];
        this.artworksService.orderFilter = [];
        this.artworksService.due = "Show All";
        this.artworksService.selectedRange = {id: 'all', name: 'All', bg: {'color' : ''}};
        this.selectedAssignees = [];
        this.assignees = [];
        this.selectedProjects = [];
        this.selectedOrders = [];
        this.projects = [];
        this.orders = [];
        this.selectedDue = "Show All";
        this.selectedRange = {id: 'all', name: 'All', bg: {'color' : ''}};

        if (this.mode === 'list') {
            this.artworksService.onClearFilters.next();
        } else {
            this.artworksService.filterByAssignees(this.selectedAssignees);
        }
        this.cd.markForCheck();
    }

    emailSelected(){

    }

    massUpdateSelected(){

    }

    mergeSelected(){

    }

    generateLetterSelected(){

    }

    addToTargetListSelected(){

    }
    
    changeRange(range) {
        this.selectedRange = range;
        this.artworksService.filterRange(range);
        this.cd.markForCheck();
    }

    openTagDialog() {
         if (this.artworksService.selection.selectedCount > 0) {
            
            let payload = {
                "term": {
                    "tagType": "Module Tag",
                    "moduleType": "Artworks"
                  }
              };
            this.api.getTagList(payload).pipe(
                map((res: any) => res && res.TagArray ? sortBy(res.TagArray, 'tag' ) : [])
            ).subscribe((tagList: any[]) => {
                  
                    let dialogRef = this.dialog.open(ModuleTagDialogComponent, {
                        panelClass: 'artworks-tags-dialog',
                        data: tagList
                    });
                    dialogRef.afterClosed()
                        .subscribe(data => {
                            console.log("data",data);
                            if (data && data.selectedTagList && data.selectedTagList.length > 0){
                                
                                let selectedArtworkList = this.artworksService.selection.selectedIds;
                                this.api.addModuleTags({
                                    TagArray: data.selectedTagList,
                                    ModuleArray: selectedArtworkList,
                                    module: 'Artworks'
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
                                this.msg.show('You have not selected any tag to tag artworks.', 'error');
                            }
                        });

                },(err) => {
                    this.msg.show(err.message, 'error');
                });
        } else {
            this.msg.show('Please select artworks.', 'error');
        }      
    } 
}
