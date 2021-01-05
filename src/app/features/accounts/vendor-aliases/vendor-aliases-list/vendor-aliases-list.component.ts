import { AfterViewInit, Component, OnDestroy, OnInit, TemplateRef, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { IVendorAlias } from '../vendor-aliases-resources/vendor-alias-interface';
import { VendorsService } from '../vendor-aliases-resources/vendors.service';
import { AuthService } from 'app/core/services/auth.service';
import { fuseAnimations } from '@fuse/animations';
import { SelectionService } from 'app/core/services/selection.service';
import { Observable, Subscription, forkJoin } from 'rxjs';
import { Selectable } from '../../../../models/selectable';
import { DataSource } from '@angular/cdk/table';
var sortJsonArray = require('sort-json-array');

@Component({
  selector: 'vendor-aliases-list',
  templateUrl: './vendor-aliases-list.component.html',
    styleUrls: ['./vendor-aliases-list.component.scss'],
    animations: fuseAnimations
})

export class VendorAliasesListComponent implements OnInit, AfterViewInit {
    vendors: any;
    displayedColumns: string[] = ['checkbox', 'name', 'aliaesString','buttons'];
    dataSource: IVendorAlias[] = [];
    filteredDataSource: IVendorAlias[] = [];
    loading: boolean = true;
    vendorForm: FormGroup;
    checkboxes: any = {};
    checkboxSelectedList: Selectable[] = [];
    onSelectionChangedSubscription: Subscription;
    constructor(
        private vendorsService: VendorsService,
        private router: Router,
        private formBuilder: FormBuilder,
        public selection: SelectionService,
        private auth: AuthService) { }


    ngOnInit() {
        this.getData();

        this.vendorForm = this.formBuilder.group({
            'name': [''],
            'aliases': ['']
        });
        this.vendorForm.controls.name.valueChanges.subscribe(val => {
            this.filterSource();
        });
        this.vendorForm.controls.aliases.valueChanges.subscribe(val => {
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
        this.dataSource = await this.vendorsService.get();
        this.checkboxSelectedList = [];
        for (let i = 0; i < this.dataSource.length; i++) {
            let localSelectable: Selectable = { id: this.dataSource[i].name}
            this.checkboxSelectedList.push(localSelectable);
        }
        this.selection.init(this.checkboxSelectedList);
        
        this.filterSource();
        this.loading = false;

    }
    sortChange = function ($event) {
        if ($event.direction === "desc") $event.direction = "des";
        if ($event.direction === "") $event.direction = "asc";
        this.dataSource = sortJsonArray(this.dataSource, $event.active, $event.direction);
        this.filterSource();
    }
    filterSource = function() {
        this.filteredDataSource = this.dataSource.filter(function (el) {
            return el.name.toLowerCase().includes(this.vendorForm.controls.name.value.toLowerCase()) &&
                el.aliaesString.toLowerCase().includes(this.vendorForm.controls.aliases.value.toLowerCase());
        }.bind(this));
    }
    deleteSelectedVendors = async function () {
        this.loading = true;
        await this.vendorsService.deleteAliasesVendor({ names: this.selection.selectedIds });
        await this.getData();

    }
    deleteAlias = async function (alias) {
        this.loading = true;
        await this.vendorsService.deleteAliasesVendor({ names: [alias.name] });
        await this.getData();

    }
    editAlias = function (alias) {
        this.router.navigate([`/accounts/vendor/aliases/edit/`+alias.name]);

    }
    newVendor = function () {
        this.router.navigate([`/accounts/vendor/aliases/add`]);
    }

}
