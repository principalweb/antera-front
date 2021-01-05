import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { fuseAnimations } from '@fuse/animations';

@Component({
  selector: 'app-admin-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
  animations: fuseAnimations,
  encapsulation: ViewEncapsulation.None
})
export class SettingsComponent implements OnInit {
  
  showTabContent: boolean = false;
  constructor() { }

  ngOnInit() {
  }

  reloadTabs() {
    this.showTabContent = false;
    setTimeout(() => this.showTabContent = true, 500);
  }

}
