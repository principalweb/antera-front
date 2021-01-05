import { Component, OnInit, Input, ViewEncapsulation } from '@angular/core';
import { fuseAnimations } from '@fuse/animations';

@Component({
  selector: 'app-permissions-entity',
  templateUrl: './permissions-entity.component.html',
  styleUrls: ['./permissions-entity.component.scss'],
  animations   : fuseAnimations,
  encapsulation: ViewEncapsulation.None

})
export class PermissionsEntityComponent implements OnInit {

    @Input() entities;
    @Input() groupId;

    constructor() { }

    ngOnInit() {
    }
}
