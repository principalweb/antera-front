import { Component, OnInit } from '@angular/core';
import { SavedSearchService } from 'app/core/services/saved-search.service';

@Component({
  selector: 'saved-search-button',
  templateUrl: './saved-search-button.component.html',
  styleUrls: ['./saved-search-button.component.scss']
})
export class SavedSearchButtonComponent implements OnInit {

  constructor(private service: SavedSearchService) { }

  ngOnInit() {
  }

  toggleFilter() {
    const visible = this.service.filterVisible.value;
    this.service.filterVisible.next(!visible);
  }

}
