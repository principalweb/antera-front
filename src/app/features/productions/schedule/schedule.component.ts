import { Component, OnInit, OnDestroy } from '@angular/core';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { ProductionsService } from 'app/core/services/productions.service';
import { MessageService } from 'app/core/services/message.service';
import { Subscription } from 'rxjs';

import { Equipment } from 'app/models/equipment';
import { Production } from 'app/models/production';

@Component({
  selector: 'schedule',
  templateUrl: './schedule.component.html',
  styleUrls: ['./schedule.component.css']
})

export class ScheduleComponent implements OnInit {

    equipment: Equipment[];
    jobs: Production[];
    onEquipmentChanged: Subscription;
    onProductionChanged: Subscription;

	constructor(
        private prodService: ProductionsService,
        private msgService: MessageService
    ) { }

	ngOnInit() {
        this.onEquipmentChanged = this.prodService.onEquipmentChanged.subscribe((res: Equipment[]) => {
            this.equipment = res;
        });

        this.onProductionChanged = this.prodService.onProductionsChanged.subscribe((res: Production[]) => {
            this.jobs = res.filter(item => item.machineId > 0 && item.statusName != 'Done');
        });

        this.prodService.getEquipment().subscribe((res: Equipment[]) => {
            this.equipment = res;
        });

        this.jobs = this.prodService.productions.filter(
            item => ( item.machineId == 0 || item.machineId == null) && item.statusName != 'Done' && item.batchJob == false
        );

	}

    ngOnDestroy() {
        this.onEquipmentChanged.unsubscribe();
        this.onProductionChanged.unsubscribe();
    }

	drop(event: CdkDragDrop<any>) {
        if (event.previousContainer === event.container) {
          moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
        } else {
          transferArrayItem(event.previousContainer.data,
                            event.container.data,
                            event.previousIndex,
                            event.currentIndex);

          this.prodService.updateJobEquipment(null, event.item.data.id).subscribe((res: any) => {
              this.prodService.getEquipment().subscribe();
          });
        }
	}
}
