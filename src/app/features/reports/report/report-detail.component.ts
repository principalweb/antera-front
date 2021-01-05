import { Component, OnDestroy, OnInit, ViewEncapsulation, ChangeDetectorRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { PipeTransform, Pipe } from '@angular/core';
import { Subscription, Subject, combineLatest, forkJoin } from 'rxjs';

import { fuseAnimations } from '@fuse/animations';
import { Report } from '../report.model';
import { FuseReportDetailService } from './report-detail.service';
import { FuseConfirmDialogComponent } from '@fuse/components/confirm-dialog/confirm-dialog.component';
import { FuseReportFilterFormComponent } from '../filter-form/filter-form.component';
import { MatDialogRef, MatDialog } from '@angular/material/dialog';

import * as html2pdf from 'html2pdf.js';
import { MessageService } from 'app/core/services/message.service';
import { find } from 'lodash';
import { ApiService } from 'app/core/services/api.service';
import { exportImageUrlForPDF } from 'app/utils/utils';
import { Angular5Csv } from 'angular5-csv/dist/Angular5-csv';
import pdfMake from 'pdfmake/build/pdfmake';

import { Router, ActivatedRoute } from '@angular/router';

import * as moment from 'moment';
import { DocumentHelpersService } from 'app/features/documents/document-helpers.service';
import { GenericReportDocument } from '../documents/generic-report.document';
import { tableLayouts } from 'app/features/documents/templates';
import { ProductDetails } from 'app/models';
import { map, debounceTime, distinctUntilChanged, takeUntil, take, filter } from 'rxjs/operators';

@Component({
    selector: 'fuse-report-detail',
    templateUrl: './report-detail.component.html',
    styleUrls: ['./report-detail.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: fuseAnimations
})
export class FuseReportDetailComponent implements OnInit, OnDestroy {
    report: Report;
    onReportChanged: Subscription;

    confirmDialogRef: MatDialogRef<FuseConfirmDialogComponent>;
    dialogRef: MatDialogRef<FuseReportFilterFormComponent>;

    loading = false;
    logoUrl = '';
    fromDate = '';
    toDate = '';
    customerId = '';
    contactsId = '';
    representiveId = '';
    vendorId = '';
    paidStatus = '';
    orderStatusId = '';
    document: GenericReportDocument;
    documentDefinition: any;
    isArray: boolean;
    filteredProducts: Partial<ProductDetails>[];
    productCategories: Object;
    filterForm: FormGroup;
    filters: any;
    existingRouteReuseStrategy: any;

    destroyed$: Subject<boolean> = new Subject();

    isNaN: Function = Number.isNaN;

    constructor(
        private formBuilder: FormBuilder,
        public reportDetailService: FuseReportDetailService,
        public dialog: MatDialog,
        private router: Router,
        private msg: MessageService,
        private api: ApiService,
        private documentHelper: DocumentHelpersService,
        private fb: FormBuilder,
        private route: ActivatedRoute
    ) {

    }

    ngOnInit() {

        this.filters = { ...this.route.snapshot.queryParams };
        this.reportDetailService.setFilters(this.filters);

        // Prevent reusing this route.
        // this.existingRouteReuseStrategy = this.router.routeReuseStrategy.shouldReuseRoute;
        // this.router.routeReuseStrategy.shouldReuseRoute = () => false;

        // Subscribe to update report on changes
        this.onReportChanged =
            this.reportDetailService.onReportChanged
                .pipe(
                    filter((report) => report && report.header)
                ).subscribe(report => {
                    report.dateCreated = new Date().toISOString();
                    this.report = new Report(report);
                    if (this.report.data && Array.isArray(this.report.data[0])) {
                        this.isArray = true;
                    } else {
                        this.isArray = false;
                    }
                });

        this.loading = true;
        combineLatest(this.route.paramMap, this.route.queryParamMap).pipe(
            takeUntil(this.destroyed$)
        ).subscribe(([params, queryParams]) => {
            this.loading = true;
            const filters = queryParams.keys.reduce((acc, filter, index) => {
                acc[filter] = queryParams.get(filter);
                return acc;
            }, {});
            this.reportDetailService.mergeFilters({ ...filters });
            this.reportDetailService.getReportDetail(params.get('code'), params.get('report_id')).subscribe((res) => {
                this.loading = false;
            });
        });

        this.api.getAddonLogo().subscribe((res: any) => {
            this.logoUrl = exportImageUrlForPDF(res.url);
        }, () => { });

        this.filterForm = this.createFilterForm();
        this.getProductCategories();

    }

    ngOnDestroy() {
        this.onReportChanged.unsubscribe();
        // this.router.routeReuseStrategy.shouldReuseRoute = this.existingRouteReuseStrategy;
    }

    updateStatus() {

    }

    isCurrentMonth(fromDate): boolean {
        return moment().isSame(fromDate, 'month');
    }

    canMoveNextMonth(fromDate): boolean {
        let diff = moment().diff(fromDate, 'months');
        return diff > 0;
    }

    showReport(daterange, report) {
        this.fromDate = moment().startOf('month').toISOString();
        this.fromDate = moment(this.fromDate).format("YYYY-DD-MM");
        this.toDate = moment().endOf('month').toISOString();
        this.toDate = moment(this.toDate).format("YYYY-DD-MM");

        /*      moment().startOf('quarter') // moment, first date, current quarter
              moment().endOf('quarter') // moment, last date, current quarter
              moment().subtract(1, 'quarter').startOf('quarter') // moment, first date, last quarter
              moment().subtract(1, 'quarter').endOf('quarter') // moment, last date, last quarter
               moment().startOf('quarter').toISOString() // first date of this year
                moment().endOf('year').toISOString() // last date of this year
              */


        this.reportDetailService.filters$.pipe(
            take(1),
        ).subscribe((filters) => {
            let startFromDate: any = moment(filters.fromDate);
            let fromDate: string;
            let toDate: string;

            switch (daterange) {
                case 'previousMonth':
                    fromDate = moment(startFromDate).subtract(1, 'months').startOf('month').toISOString();
                    toDate = moment(fromDate).endOf('month').toISOString();
                    break;
                case 'currentMonth':
                    fromDate = moment().startOf('month').toISOString();
                    toDate = moment().endOf('month').toISOString();
                    break;
                case 'nextMonth':
                    fromDate = moment(startFromDate).add(1, 'months').startOf('month').toISOString();
                    toDate = moment(fromDate).endOf('month').toISOString();
                    break;
                case 'quarterly':
                    fromDate = moment().startOf('quarter').toISOString();
                    toDate = moment().endOf('quarter').toISOString();
                    break;
                case 'yearly':
                    fromDate = moment().startOf('year').toISOString();
                    toDate = moment().endOf('year').toISOString();
                    break;
                default:
                    fromDate = moment(startFromDate).toISOString();
                    toDate = moment(startFromDate).toISOString();
                    break;
            }
            fromDate = moment(fromDate).format('YYYY-MM-DD');
            toDate = moment(toDate).format('YYYY-MM-DD');
            this.reportDetailService.mergeFilters({
                fromDate: fromDate,
                toDate: toDate
            });

            this.reportDetailService.filters$.pipe(
                take(1),
            ).subscribe((filters) => {
                this.router.navigate(['/reports', this.report.id, this.report.value], {
                    queryParams: { ...filters }
                });
            });
        });


    }

    filterDialog() {
        const report = this.report;

        this.reportDetailService.filters$.pipe(
            take(1),
        ).subscribe((filters) => {

            this.dialogRef = this.dialog.open(FuseReportFilterFormComponent, {
                panelClass: 'antera-details-dialog',
                width: '50%',
                height: '85%',
                data: {
                    action: 'filter',
                    report: report,
                    filters: filters,
                }
            });

            this.dialogRef.afterClosed()
                .subscribe(response => {
                    if (!response) {
                        return;
                    }

                    const [action, payload] = response;

                    switch (action) {
                        case 'apply':

                            this.reportDetailService.mergeFilters({ ...payload });
                            this.reportDetailService.filters$.pipe(
                                take(1)
                            ).subscribe((filters) => {
                                this.router.navigate(['/reports',
                                    report.id,
                                    report.value], {
                                        queryParams: {
                                            ...filters
                                        }
                                    }
                                );
                            });

                            break;

                        case 'clear':
                            break;
                    }
                });
        });
    }

    downloadCSV() {

        if (this.report.data.length === 0) {
            this.msg.show('No Data Found', 'error');
            return;
        }

        const options = {
            fieldSeparator: ',',
            quoteStrings: '"',
            decimalseparator: '.',
            showLabels: true,
            showTitle: true,
            title: `${this.report.reportName}`,
            useBom: true,
            noDownload: false,
            headers: Object.keys(this.report.data[0]),
            nullToEmptyString: true,
        };
        if(this.report.value === "dhltemplate") {
            options.showTitle = false;
            console.log(this.report.value, options.showTitle);
        }
        
        const data = this.isArray ? this.report.data.flatMap((data) => data) : this.report.data;

        new Angular5Csv(data, this.report.reportName, options);
    }

    getDownloadFilename() {
        return `report.${this.report.header.reportName}.pdf`;
    }

    makePdf(config: { orientation: string, } = { orientation: 'portrait' }) {
        this.reportDetailService.filters$.pipe(
            take(1)
        ).subscribe((filters) => {


            // TODO: After backend sends reportName remove this
            this.report.reportName = filters.reportName;
            this.report.filters = filters;

            this.document = new GenericReportDocument({
                logoUrl: this.logoUrl,
                // TEMPORARY
                report: this.report
            });
            this.document.setFormatter(this.documentHelper);
            this.document.getDocumentDefinition().subscribe((definition) => {
                if(config.orientation === 'landscape') {
                    //definition.pageSize = 'LEGAL';
                    definition.defaultStyle.fontSize = 6;
                }
                if(this.report.value == "basicsales"){
                    if(config.orientation === 'landscape') {
                        definition.defaultStyle.fontSize = 6;
                    }else{
                        definition.defaultStyle.fontSize = 3;
                    }
                }
                if(this.report.value == "leadsnotconverted"){
                    if(config.orientation === 'portrait') {
                        definition.defaultStyle.fontSize = 6;
                    }
                }
                if(this.report.value == "openBookedOrder"){
                    if(config.orientation === 'portrait') {
                        definition.defaultStyle.fontSize = 6;
                    }
                }
                if(this.report.value == "importcomm"){
                    if(config.orientation === 'portrait') {
                        definition.defaultStyle.fontSize = 3;
                    }
                }
                if(this.report.value == "salesByProductDetail"){
                    if(config.orientation === 'portrait') {
                        definition.defaultStyle.fontSize = 3;
                    }
                }
                if(this.report.value == "inventoryHistoryReportByProduct"){
                    if(config.orientation === 'portrait') {
                        definition.defaultStyle.fontSize = 3;
                    }
                }
                definition.pageOrientation = config.orientation;
                pdfMake.createPdf(definition, tableLayouts).download(
                    this.getDownloadFilename()
                );
                this.loading = false;
            });
        });


    }


    downloadPDF(exportMode) {
        var element = document.getElementById('report-table');
        this.report.dateCreated = new Date().toISOString();
        const filename = this.getDownloadFilename();
        var opt = {
            margin: [20, 5, 10, 5],
            filename: filename,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: {
                scale: 1,
                useCORS: true
            },
            jsPDF: { unit: 'mm', format: 'letter', orientation: exportMode },
            pagebreak: { avoid: 'tr' }
        };

        this.loading = true;
        html2pdf(element, opt).output('datauristring').then((val) => {
            this.loading = false;
            this.msg.show(`Exported ${filename} successfully`, 'success');
        }).catch(err => {
            this.loading = false;
            this.msg.show(`Failed xxporting ${filename}`, 'error');
        });

    }

    insertBreakValid(data) {
        const keys = Object.keys(data);
        const salesRep = keys[0];
        if (data[salesRep] != '') return true;
        return false;
    }

    createFilterForm() {
        const form = this.fb.group({
            product: [],
            category: []
        });

        form.get('product').valueChanges.pipe(
            // map(val => displayName(val).trim().toLowerCase()),
            debounceTime(400),
            distinctUntilChanged(),
        ).subscribe(keyword => {
            this.api.productSearch(keyword)
                .subscribe((res: any[]) => {
                    this.filteredProducts = res;
                });
        });
        return form;
    }

    selectProduct(product) {
        this.filterForm.patchValue({
            product: product.id
        });
    }
    selectCategory(category) {
        this.filterForm.patchValue({
            product: category.id
        });
    }
    autoCompleteProducts(term) {
        this.api.productSearch(term).subscribe((products: Partial<ProductDetails>[]) => {
            this.filteredProducts = products;
        });
    }

    getProductCategories() {
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

    myIsNaN(input): boolean {
        if ((typeof input == 'string') && (typeof input.replace === "function")) {
            return isNaN(Number(input.replace(/,|\%/g, '')));
	    }
        return false;
    }
}
