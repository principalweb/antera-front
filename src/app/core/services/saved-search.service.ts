import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class SavedSearchService {
  savedSearches = new BehaviorSubject<any>({});
  filterVisible = new BehaviorSubject(false);

  saveSearch(module, name, data) {
    const moduleSearches = this.savedSearches.value[module];
    if (!moduleSearches) {
      const newSavedSearches = {
        ...this.savedSearches.value,
        [module]: {
          [name]: data
        }
      };

      this.savedSearches.next(newSavedSearches);
    } else {
      const newSavedSearches = {
        ...this.savedSearches.value,
        [module]: {
          ...moduleSearches,
          [name]: data
        }
      };

      this.savedSearches.next(newSavedSearches);
    }
  }

  loadSearch(module, name) {
    if (this.savedSearches.value[module]) {
      return this.savedSearches.value[module][name];
    }

    return null;
  }

  setSearchesForModule(module, searches) {
    const newSearches = {
      ...this.savedSearches.value,
      [module]: searches
    };

    this.savedSearches.next(newSearches);
  }

  setVisibility(visible) {
    this.filterVisible.next(visible);
  }
}
