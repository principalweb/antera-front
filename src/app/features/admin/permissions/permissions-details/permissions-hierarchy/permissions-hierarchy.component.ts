import { Component, Input, ViewEncapsulation } from '@angular/core';
import { PermissionService } from 'app/core/services/permission.service';
import { MessageService } from 'app/core/services/message.service';
import { fuseAnimations } from '@fuse/animations';
import { PermissionHierarchy } from 'app/models/permission-hierarchy';
import { PermissionGroup } from 'app/models/permission-group';
import { Subscription } from 'rxjs';

@Component({
  selector: 'permissions-hierarchy',
  templateUrl: './permissions-hierarchy.component.html',
  styleUrls: ['./permissions-hierarchy.component.scss'],
  animations: fuseAnimations,
  encapsulation: ViewEncapsulation.None

})
export class PermissionsHierarchyComponent {

  @Input() hierarchy: PermissionHierarchy[];
  @Input() groupId;
  @Input() unrelated;

  constructor(
    private permService: PermissionService,
    private msgService: MessageService
  ) { }

  // look weird, but passing groupId twice to return the details after the relation update
  addAsParent(parentId) {
      this.permService.addRelation(parentId, this.groupId, this.groupId).subscribe((res: any) => {
          this.msgService.show(res.msg, 'info');
      });
  }

  // look weird, but passing groupId twice to return the details after the relation update
  addAsChild(childId) {
      this.permService.addRelation(this.groupId, childId, this.groupId).subscribe((res: any) => {
          this.msgService.show(res.msg, 'info');
      });
  }

  unrelate(hId) {
      this.permService.delRelation(hId, this.groupId).subscribe((res: any) => {
          this.msgService.show(res.msg, 'info');
      });
  }
}
