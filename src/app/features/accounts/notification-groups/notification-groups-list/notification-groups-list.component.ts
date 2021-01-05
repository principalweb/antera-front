import { AfterViewInit, Component, OnDestroy, OnInit, TemplateRef, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { INotificationGroup } from '../notification-groups-resources/notification-group-interface';
import { NotificationGroupsService } from '../notification-groups-resources/notification-groups.service';
import { AuthService } from 'app/core/services/auth.service';
import { fuseAnimations } from '@fuse/animations';
import { SelectionService } from 'app/core/services/selection.service';
import { Observable, Subscription, forkJoin } from 'rxjs';
import { Selectable } from '../../../../models/selectable';
import { DataSource } from '@angular/cdk/table';
var sortJsonArray = require('sort-json-array');
import { MessageService } from 'app/core/services/message.service';


@Component({
  selector: 'notification-groups-list',
    templateUrl: './notification-groups-list.component.html',
    styleUrls: ['./notification-groups-list.component.scss'],
    animations: fuseAnimations
})

export class NotificationGroupsListComponent implements OnInit, AfterViewInit {
    vendors: any;
    displayedColumns: string[] = ['checkbox', 'groupName', 'accounts', 'buttons'];
    dataSource: INotificationGroup[] = [];
    filteredDataSource: INotificationGroup[] = [];
    loading: boolean = true;
    aForm: FormGroup;
    checkboxes: any = {};
    checkboxSelectedList: Selectable[] = [];
    onSelectionChangedSubscription: Subscription;
    constructor(
        private notificationGroupsService: NotificationGroupsService,
        private router: Router,
        private formBuilder: FormBuilder,
        public selection: SelectionService,
        private msg: MessageService,
        private auth: AuthService) { }


    ngOnInit() {
        this.getData();

        this.aForm = this.formBuilder.group({
            'groupName': [''],
            'accounts': ['']
        });
        this.aForm.controls.groupName.valueChanges.subscribe(val => {
            this.filterSource();
        });
        this.aForm.controls.accounts.valueChanges.subscribe(val => {
            this.filterSource();
        });

        this.onSelectionChangedSubscription =
            this.selection.onSelectionChanged
            .subscribe(selection => {
                    this.checkboxes = selection;
                });
    }

    onSelectedChange(leadId) {
        this.selection.toggle(leadId);
    }

    toggleAll(ev) {
        this.selection.reset(ev.checked);
    }
    ngAfterViewInit() {
    }
    getData = async function () {
        this.loading = true;
        let data = await this.notificationGroupsService.get(this.msg);
        this.loading = false;
        if (data.status !== undefined && !(data.status > 199 && data.status < 300)) {
            return;
        }
        this.dataSource = data;
        this.checkboxSelectedList = [];
        for (let i = 0; i < this.dataSource.length; i++) {
            let localSelectable: Selectable = { id: this.dataSource[i].notificationGroupID}
            this.checkboxSelectedList.push(localSelectable);
        }
        this.selection.init(this.checkboxSelectedList);
        
        this.filterSource();

    }
    sortChange = function ($event) {
        if ($event.direction === "desc") $event.direction = "des";
        if ($event.direction === "") $event.direction = "asc";
        this.dataSource = sortJsonArray(this.dataSource, $event.active, $event.direction);
        this.filterSource();
    }
    filterSource = function() {
        this.filteredDataSource = this.dataSource.filter(function (el) {
            return el.groupName.toLowerCase().includes(this.aForm.controls.groupName.value.toLowerCase()) &&
                el.accounts.toLowerCase().includes(this.aForm.controls.accounts.value.toLowerCase());
        }.bind(this));
    }
    deleteSelected = async function () {
        this.loading = true;
        let data = await this.notificationGroupsService.delete({ ids: this.selection.selectedIds }, this.msg);
        
        if (data.status !== undefined && !(data.status > 199 && data.status < 300)) {
            this.loading = false;
            return;
        }
        await this.getData();

    }
    delete = async function (data) {
        this.loading = true;
        data = await this.notificationGroupsService.delete({ ids: [data.notificationGroupID] }, this.msg);
        console.log(data);
        //if (data !== undefined && data.status !== undefined && !(data.status > 199 && data.status < 300)) {
          //  this.loading = false;
          //  return;
       // }
        await this.getData();

    }
    edit = function (data) {
        this.router.navigate([`/accounts/notification/groups/edit/`+data.notificationGroupID]);

    }

}
