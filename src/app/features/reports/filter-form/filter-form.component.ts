import { Component, Inject, Input, ViewEncapsulation, OnInit, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Report } from '../report.model';
import { Observable, of } from 'rxjs';
import { MessageService } from 'app/core/services/message.service';
import { startWith, map, debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { ApiService } from 'app/core/services/api.service';
import * as moment from 'moment';


@Component({
    selector: 'fuse-report-form',
    templateUrl: './filter-form.component.html',
    styleUrls: ['./filter-form.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class FuseReportFilterFormComponent implements OnInit {
    action: string;
    dialogTitle: string;
    report: Report;
    reportFilterForm: FormGroup;

    filteredCustomers: Observable<any>;
    filteredContacts: Observable<any>;
    filteredOrderStatus: Observable<any>;
    filteredPaidStatus: Observable<string[]>;
    filteredVendors: Observable<any>;
    filteredRepresentives: Observable<any>;

    customers = []
    vendors = []
    orderStatus = []
    paidStatus = ['Paid', 'Partial', 'Unpaid']
    contacts = []
    representive = []
    representiveId = []
    filteredProducts: Observable<Object | any[]>;
    productCategories: any;
    filteredCategories: Observable<Object | any[]>;

    constructor(
        private formBuilder: FormBuilder,
        @Inject(MAT_DIALOG_DATA) public data: any,
        public dialogRef: MatDialogRef<FuseReportFilterFormComponent>,
        private api: ApiService,
        private msg: MessageService
    ) {
        this.action = data.action;
        if (this.action === 'filter') {
            this.data.filters.fromDate = moment(this.data.filters.fromDate).toISOString();
            this.data.filters.toDate = moment(this.data.filters.toDate).toISOString();
//           console.log(this.data.filters);
            this.report = data.report;
            this.dialogTitle = 'Filter reports';
        }
        else if (this.action === 'input') {
            this.report = data.report;
            this.dialogTitle = 'Please select ' + this.report.filters[0];
        }
    }

    ngOnInit() {

        this.loadProductCategories();
        if (this.action === 'input') {
            switch (this.report.filters[0]) {
                case 'Customer': {
                    this.reportFilterForm = this.formBuilder.group({
                        customer: ['', Validators.required],
                        customerName: [''],
                        vendor: [''],
                        vendorName: [''],
                        orderStatus: [''],
                        orderStatusId: [''],
                        paidStatus: [''],
                        contacts: [''],
                        contactsName: [''],
                        representive: [''],
                        representiveName: [''],
                        projectName: [''],
                        subTitle: [''],
                        footerNote: '',
                        fromDate: [''],
                        toDate: [''],
                        fromDatePicker: [''],
                        toDatePicker: ['']
                    });
                    break;
                }
                case 'DateRange': {
                    this.reportFilterForm = this.formBuilder.group({
                        customer: [''],
                        customerName: [''],
                        vendor: [''],
                        vendorName: [''],
                        orderStatus: [''],
                        orderStatusId: [''],
                        paidStatus: [''],
                        contacts: [''],
                        contactsName: [''],
                        representive: [''],
                        representiveId: [''],
                        projectName: [''],
                        subTitle: [''],
                        footerNote: '',
                        fromDate: ['', Validators.required],
                        toDate: ['', Validators.required],
                        fromDatePicker: [''],
                        toDatePicker: ['']
                    });
                    break;
                }
                default: {

                    break;
                }
            }

        }
        else {

            this.reportFilterForm = this.formBuilder.group({
                customer: [''],
                customerName: [''],
                vendor: [''],
                vendorName: [''],
                orderStatus: [''],
                orderStatusId: [''],
                paidStatus: [''],
                contacts: [''],
                contactsName: [''],
                representive: [''],
                representiveId: [''],
                subTitle: [''],
                footerNote: '',
                fromDate: [''],
                toDate: [''],
                fromDatePicker: [''],
                toDatePicker: [''],
                productName: [],
                product: [],
                categoryName: [],
                category: [],
                projectName: [''],
            });

            if (this.data && this.data.filters) {
  //              console.log(this.data.filters);
//                this.data.filters.fromDate = moment(this.data.filters.fromDate).toDate();
///                this.data.filters.toDate = moment(this.data.filters.toDate).toDate();
                this.reportFilterForm.patchValue(this.data.filters);
            }
        }

        //getCustomerAutocomplete
        this.filteredCustomers = this.reportFilterForm.get('customerName').valueChanges.pipe(
            debounceTime(300),
            distinctUntilChanged(),
            switchMap(val => this.api.getCustomerAutocomplete(val))
        );
        //getContactAutocomplete
        this.filteredContacts = this.reportFilterForm.get('contactsName').valueChanges.pipe(
            debounceTime(300),
            distinctUntilChanged(),
            switchMap(val => this.api.getContactAutocomplete(val)),
        )
        //getOrderStatusList        
        this.filteredOrderStatus = this.reportFilterForm.get('orderStatus').valueChanges.pipe(
            debounceTime(300),
            distinctUntilChanged(),
            switchMap(val => this.api.getOrderStatusList('Order')),
        )

        this.filteredPaidStatus = this.reportFilterForm.get('paidStatus').valueChanges.pipe(
            startWith(null),
            map(val => val ? this.filterPaidStatus(val) : this.paidStatus.slice()),
        );

        //getVendorAutocomplete
        this.filteredVendors = this.reportFilterForm.get('vendorName').valueChanges.pipe(
            debounceTime(300),
            distinctUntilChanged(),
            switchMap(val => this.api.getVendorAutocomplete(val)),
        );

        //getUserAutocomplete
        this.filteredRepresentives = this.reportFilterForm.get('representive').valueChanges.pipe(
            debounceTime(300),
            distinctUntilChanged(),
            switchMap(val => this.api.getUserAutocomplete(val)),
        );

        this.filteredCategories = this.reportFilterForm.get('categoryName').valueChanges.pipe(
            debounceTime(400),
            distinctUntilChanged(),
            switchMap(val => this.filterCategories(val)),
        );

        this.filteredProducts = this.reportFilterForm.get('productName').valueChanges.pipe(
            debounceTime(400),
            distinctUntilChanged(),
            switchMap(val => this.api.productSearch(val)),
        );
    }

    loadProductCategories() {
        return this.api.getProductCategoryList({
            'offset': 0,
            'limit': 50,
            'order': 'catName',
            'orient': 'asc',
            'id': '',
            'term': { 'categoryName': '' }
        }).subscribe((res: any) => {
            if (res && res.ProductCategoryArray) {
                this.productCategories = res.ProductCategoryArray;
            }
        });
    }

    selectSalesRep(ev) {
        const c = ev.option.value;
        this.reportFilterForm.get('representive').setValue(c.name);
        this.reportFilterForm.get('representiveId').setValue(c.id);
    }

    selectCustomers(ev) {
        const acc = ev.option.value;
        this.reportFilterForm.get('customer').setValue(acc.id);
        this.reportFilterForm.get('customerName').setValue(acc.name);
    }

    selectVendors(ev) {
        const acc = ev.option.value;
        this.reportFilterForm.get('vendor').setValue(acc.id);
        this.reportFilterForm.get('vendorName').setValue(acc.name);
    }

    selectContacts(ev) {
        const c = ev.option.value;
        this.reportFilterForm.get('contacts').setValue(c.id);
        this.reportFilterForm.get('contactsName').setValue(c.name);
    }

    selectOrderStatus(ev) {
        const c = ev.option.value;
        this.reportFilterForm.get('orderStatusId').setValue(c.id);
        this.reportFilterForm.get('orderStatus').setValue(c.name);
    }

    selectProduct(ev) {
        const v = ev.option.value;
        this.reportFilterForm.patchValue({
            productName: v.productName,
            product: v.id
        });
    }

    selectCategory(ev) {
        const v = ev.option.value;
        this.reportFilterForm.patchValue({
            categoryName: v.category,
            category: v.id
        });
    }

    apply(form) {
        //        if (this.reportFilterForm.invalid) {
        //            this.msg.show('Please complete the form first', 'error');
        //            return;
        //        }
        const value =  { ...form.getRawValue() };
        value.fromDate = moment(value.fromDate).toISOString();
        value.toDate = moment(value.toDate).toISOString();
//      console.log(value);
        this.dialogRef.close([
            'apply',
            value
        ]);
    }

    filterCustomers(val: string): string[] {
        return this.customers.filter(customer =>
            customer.toLowerCase().indexOf(val.toLowerCase()) === 0);
    }

    filterCategories(val: string) {
        if (!val) {
            return of(this.productCategories);
        }
        return of(this.productCategories.filter((cat) => {
            return cat.category.toLowerCase().indexOf(val.toLowerCase()) !== -1;
        }));
    }

    filterVendors(val: string): string[] {
        return this.vendors.filter(vendor =>
            vendor.toLowerCase().indexOf(val.toLowerCase()) === 0);
    }

    filterContacts(val: string): string[] {
        return this.contacts.filter(contact =>
            contact.toLowerCase().indexOf(val.toLowerCase()) === 0);
    }


    filterRepresentives(val: string): string[] {
        return this.representive.filter(rep =>
            rep.toLowerCase().indexOf(val.toLowerCase()) === 0);
    }

    filterOrderStatus(val: string): string[] {
        return this.orderStatus.filter(os =>
            os.toLowerCase().indexOf(val.toLowerCase()) === 0);
    }

    filterPaidStatus(val: string): string[] {
        return this.paidStatus.filter(ps =>
            ps.toLowerCase().indexOf(val.toLowerCase()) === 0);
    }

    clearProductFilter() {
        this.reportFilterForm.patchValue({
            productName: '',
            product: '',
        });
    }

    clearCategoryFilter() {
        this.reportFilterForm.patchValue({
            categoryName: '',
            category: '',
        });
    }

}
