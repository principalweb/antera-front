import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Selectable } from '../../models/selectable';
import { each, isEmpty } from 'lodash-es';

@Injectable()
export class SelectionService {
  checkedAll = new BehaviorSubject(false);
  checkedAny = new BehaviorSubject(false);
  onSelectionChanged = new BehaviorSubject<any>({});

  constructor() { }

  get selectedCount() {
    const selection = this.onSelectionChanged.value;
    let count = 0;
    each(selection, v => {
      if (v) {
        count ++;
      }
    });

    return count;
  }

  get selectedIds() {
    const ids = [];
    const selection = this.onSelectionChanged.value;
    each(selection, (v, k) => {
      if (v) {
        ids.push(k);
      }
    });

    return ids;
  }

  init(items: Selectable[]) {
    const oldSelection = this.onSelectionChanged.value;
    const selection = {};
    each(items, item => {
      selection[item.id] = oldSelection[item.id] || false;
    });

    this.onSelectionChanged.next(selection);
    this.checkAllAny();
  }

  toggle(id) {
    const selection = this.onSelectionChanged.value;
    if (selection[id] !== undefined) {
      selection[id] = !selection[id];
      this.onSelectionChanged.next(selection);
      this.checkAllAny();
    }
  }

  reset(checked) {
    const selection = this.onSelectionChanged.value;
    each(selection, (v, k) => {
      selection[k] = checked;
    });
    this.onSelectionChanged.next(selection);

    this.checkedAll.next(checked);
    this.checkedAny.next(false);
  }

  private checkAllAny() {
    const selection = this.onSelectionChanged.value;

    let all = !isEmpty(selection);
    let any = false;
    each(selection, v => {
      if (v) {
        any = true;
      } else {
        all = false;
      }
    });

    this.checkedAll.next(all);
    this.checkedAny.next(any);
  }
}
