import { Component, ViewEncapsulation, Output, EventEmitter, Input, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormControl, FormGroup, FormBuilder, Validators, FormArray } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { fuseAnimations } from '@fuse/animations';
import { FuseConfirmDialogComponent } from '@fuse/components/confirm-dialog/confirm-dialog.component';
import { Production } from 'app/models';
import { ProductionsService } from 'app/core/services/productions.service';
import { MessageService } from 'app/core/services/message.service';
import { map } from 'rxjs/operators';
import { ENTER, COMMA } from '@angular/cdk/keycodes';

import { MatAutocomplete } from '@angular/material/autocomplete';
import * as moment from 'moment';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-production-details',
  templateUrl: './production-details.component.html',
  styleUrls: ['./production-details.component.scss'],
  animations: fuseAnimations,
  encapsulation: ViewEncapsulation.None
})
export class ProductionDetailsComponent implements OnInit, OnDestroy {
    @Input() embedded = false;
    @Input() embeddedData = {};
    @Output() afterCreate = new EventEmitter();

    // possible actions: new, view, edit
    action = 'new';
    edit = false;
    job = new Production({});
    form: FormGroup;
    routeChanged: Subscription;
    equipmentList: any;
    statusList: any;
    priorityList: any;
    separatorKeyCodes = [ENTER, COMMA];
    addOnBlur: boolean = false;
    selectable: boolean = true;
    removable: boolean = true;
    artworkId: Number;
    isBatchMaster: boolean;

    testInfo = [
        {
            'site': '1',
            'bin' : 1,
            'quantity': 500,
            'color': 'Red',
            'size': 'M'
        }
    ]


    productInfoColumns = [
        'site',
        'bin',
        'quantity',
        'color',
        'size'
    ];

    batchJobsColumns = [
        'orderName',
        'decoTypeName',
        'detailName',
        'detailCount',
        'position',
        'quantity'
    ];

    historyColumns = [
        'timerState',
        'jobStatus',
        'time',
        'reason',
        'elapsed'
    ];

    constructor(
        private route: ActivatedRoute,
        private fb: FormBuilder,
        private prodService: ProductionsService,
        private messenger: MessageService,
        private router: Router
    ) {
    }

    createForm() {
      let due = this.job.due ? moment(this.job.due).toDate() : null;
      this.form = this.fb.group({
          id:                   [this.job.id],
          orderId:              [this.job.orderId],
          orderName:            [this.job.orderName],
          lineItemId:           [this.job.lineItemId],
          vendorId:             [this.job.vendorId],
          vendorName:           [this.job.vendorName],
          customerId:           [this.job.customerId],
          customerName:         [this.job.customerName],
          batch:                [this.job.batch],
          action:               [this.job.action],
          name:                 [this.job.name],
          description:          [this.job.description],
          due:                  [due],
          decoTypeId:           [this.job.decoTypeId],
          decoTypeName:         [this.job.decoTypeName],
          detailName:           [this.job.detailName],
          detailCount:          [this.job.detailCount],
          qty:                  [this.job.qty],
          position:             [this.job.position],
          detailDescription:    [this.job.detailDescription],
          machineId:            [this.job.machineId],
          machineName:          [this.job.machineName],
          hours:                [this.job.hours],
          productId:            [this.job.productId],
          productName:          [this.job.productName],
          statusId:             [this.job.statusId],
          statusName:           [this.job.statusName],
          priorityId:           [this.job.priorityId],
          priorityName:         [this.job.priorityName],
          decoRecordId:         [this.job.decoRecordId],
          productionRate:       [this.job.productionRate, [Validators.pattern("^[0-9]*$"), Validators.min(0), Validators.max(100)]],
          selEquipment:         [{id: this.job.machineId, name: this.job.machineName}],
          selDeco:              [{id: this.job.decoTypeId, name: this.job.decoTypeName}],
          selPriority:          [{id: this.job.priorityId, name: this.job.priorityName}],
          selStatus:            [{id: this.job.statusId, name: this.job.statusName}],
          processes:            [this.job.processes],
          displayedProcesses:   [''],
          variationName:        [this.job.variationName],
          variationId:          [this.job.variationId],
          designId:             [this.job.designId],
          designNum:            [this.job.designNum],
          artworkId:            [this.job.artworkId],
          batchMaster:          [this.job.batchMaster],
          batchJob:             [this.job.batchJob],
          size:                 [this.job.size],
          color:                [this.job.color]
      });
    };

    ngOnInit() {
        if (this.embedded) {
          this.action = this.embeddedData[0];
          this.job = new Production(this.embeddedData[1]);
        } else {
          this.routeChanged = this.route.data
            .subscribe(({ data }) => {
                this.action = data[0];
                this.job = new Production(data[1]);
                this.createForm();
                this.processesToString();
                this.artworkId = this.form.get('artworkId').value;
                this.isBatchMaster = this.job.batchMaster;
                this.getEquipmentList();
            })
        }

        this.getStatusList();
        this.getPriorityList();
    }

    ngOnDestroy() {
        if (!this.embedded) {
            this.routeChanged.unsubscribe();
        }
    }

    getEquipmentList() {
        this.prodService.getEquipment().subscribe(
            (res) => {
                this.equipmentList = res.filter(item => item.decoTypes.filter(d => d.id == this.job.decoTypeId).length > 0);
            });
    }

    getStatusList() {
        this.prodService.getStatusList().subscribe((res) => {
                this.statusList = res;
                });
    }

    getPriorityList() {
        this.prodService.getPriorityList().subscribe((res) => {
                this.priorityList = res;
                });
    }

    update() {
        this.job.setData(this.form.value);
        this.job.due = moment(this.form.get('due').value).format('YYYY-MM-DD');
        this.prodService.updateProductionDetails(this.job).subscribe((res: any) => {
                this.job.setData(res.data);
                res.data.due = moment(res.data.due).toDate();
                this.form.patchValue(res.data);
                this.messenger.show('Job updated!', 'success');
                });
    }

    updateMachine(ev) {
        this.form.patchValue({machineId: ev.value.id, machineName: ev.value.name});
    }

    updateStatus(ev) {
        this.form.patchValue({statusId: ev.value.id, statusName: ev.value.name});
    }

    updatePriority(ev) {
        this.form.patchValue({priorityId: ev.value.id, priorityName: ev.value.name});
    }

    compareFn(obj1, obj2): boolean {
        return obj1 && obj2 ? obj1.id === obj2.id : obj1 === obj2;
    }

    toggleEdit() {
        this.edit = !this.edit;
    }

    updateProductionRate(ev) {
    }

    processesToString(): void {
        this.form.patchValue({displayedProcesses: this.form.get('processes').value.map(proc => {
            return proc.name;
        }).join(', ')});
    }

    navigateToArtwork() {
        this.router.navigate(['/artworks', this.artworkId]); 
    }

    delete() {
        this.prodService.deleteBatch(this.job.id).subscribe((res: any) => {
            console.log(res);
        });
    }
}
