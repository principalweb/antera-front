import { Component, OnInit, ViewEncapsulation, Input } from '@angular/core';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { MatProgressBarModule }  from '@angular/material/progress-bar';
import { ProductionsService } from 'app/core/services/productions.service';
import { Equipment } from 'app/models/equipment';
import { Production } from 'app/models/production';

@Component({
  selector: 'machine-card',
  templateUrl: './machine-card.component.html',
  styleUrls: ['./machine-card.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class MachineCardComponent implements OnInit {

    showJobs: boolean = false;
    capColor: string = 'primary';
    @Input() equipment: Equipment;

    constructor(
        private prodService: ProductionsService
    ) { }

    ngOnInit() {
    }

    toggle() {
      this.showJobs = !this.showJobs;
    }

    dropMachine(event: CdkDragDrop<any>) {
        if (event.previousContainer === event.container) {
            moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
        } else {
            transferArrayItem(event.previousContainer.data,
                            event.container.data,
                            event.previousIndex,
                            event.currentIndex);

            this.prodService.updateJobEquipment(this.equipment.id, event.item.data.id).subscribe((res: any) => {
                this.prodService.getEquipment().subscribe();
            });
        }
    }

    calcHours(equipment) {
        if (equipment.reservedHours == null || equipment.capacity == null || equipment.capacity == 0) {
            return 0;
        }
        let hours = (equipment.reservedHours/equipment.capacity)*100;
        if (typeof hours !== 'number') {
            return 0;
        }
        return hours;
    }

}
