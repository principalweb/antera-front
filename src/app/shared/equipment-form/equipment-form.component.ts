import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { Equipment } from '../../models/equipment';
import { ApiService } from '../../core/services/api.service';
import { ProductionsService } from '../../core/services/productions.service';
import { MessageService } from 'app/core/services/message.service';
import { Subscription } from 'rxjs';
import { EquipmentDecoType } from 'app/models/equipment-deco-type';

@Component({
    selector: 'app-equipment-form',
    templateUrl: './equipment-form.component.html',
    styleUrls: ['./equipment-form.component.scss']
})


export class EquipmentFormComponent implements OnInit, OnDestroy {

    dialogTitle: string;
    newEquipment = new Equipment();
    decoTypes: any;
    equipmentList: Equipment[] = [];
    dataSource = new MatTableDataSource(this.equipmentList);
    displayedColumns: string[] = ['save', 'name', 'decoTypeName', 'heads', 'prodHour', 'spm', 'capacity', 'delete'];
    loading: false;
    decoTypeSelect: {id: '', name: ''}[] = [];

    onEquipmentChanged: Subscription;

    constructor(
        private api: ApiService,
        private prodService: ProductionsService,
        public dialogRef: MatDialogRef<EquipmentFormComponent>,
        public msg: MessageService,
    ) { }

    close() {
        this.dialogRef.close();
    }

    ngOnInit() {
        this.prodService.getAllDesignTypes()
            .subscribe((res) => {
                this.decoTypes = res;
                this.decoTypeSelect = this.decoTypes.map(item => {return new EquipmentDecoType({id: item.id, name: item.name})});
            });
        this.onEquipmentChanged = this.prodService.onEquipmentChanged.subscribe((res) => {
            this.dataSource.data = res;
        });

        this.getEquipment();
    }

    ngOnDestroy() {
        this.onEquipmentChanged.unsubscribe();
    }

    clearNewEquipment() {
        this.newEquipment = new Equipment();
    }

    add() {
        this.prodService.createEquipment(this.newEquipment).subscribe(
            res => {
                
                this.getEquipment();
                this.msg.show('Equipment created!', 'success');
            },
            err => {
                this.getEquipment();
                this.msg.show('Unable to create equipment', 'error');
            }
        );
    }

    update(eq) {
        this.prodService.updateEquipment(eq).subscribe(
            res => {
                this.getEquipment();
                this.msg.show('Equipment updated!', 'success');
            },
            err => {
                console.log(err);
                this.getEquipment();
                this.msg.show('Unable to update equipment', 'error');
            }
        );
    }

    getEquipment() {
        this.prodService.getEquipment().subscribe();
    }

    delete(eq) {
        this.prodService.deleteEquipment(eq.id).subscribe(
            (res) => {
                this.getEquipment();
                this.msg.show('Equipment removed!', 'success');
            }
        );
    }

    compareFn(obj1: EquipmentDecoType, obj2: EquipmentDecoType): boolean {
        return obj1 && obj2 ? obj1.id === obj2.id : obj1 === obj2;
    }
}
