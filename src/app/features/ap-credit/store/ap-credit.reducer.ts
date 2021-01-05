import { createFeatureSelector, createSelector } from '@ngrx/store';

import { ApCreditActionTypes, ApCreditActions } from './ap-credit.actions';
import { ApCredit, AnteraMeta, ApCreditFilter, AnteraSort, ApCreditData } from 'app/models';

export interface State {
  list: ApCredit[];
  meta: AnteraMeta;
  filter: ApCreditFilter;
  sort: AnteraSort;
  action: string;
  id: string;
  data: ApCreditData;
  loading: boolean;
  saving: boolean;
  reloadData: boolean;
  errorInfo: any;
}

export const initialState: State = {
  list: [],
  meta: {
    totalCount: 0,
    pageCount: 0,
    currentPage: 0,
    perPage: 50
  },
  filter: {
    terms: {
      reference: '',
      notes: '',
    },
  },
  sort: {
    'order': '',
    'orient': '',
  },
  action: 'list',
  id: '',
  data: {
    id: '',
    advanceReasonId: '',
    amount: 0.00,
    accountId: '',
    accountingId: '',
    creditedDate: '',
    externalRef: '',
    reference: '',
    notes: '',
    userId: '',
    currency: 'USD',
    account: {
      id: '',
      name: '',
    },
    apCreditLines: [],
  },
  loading: true,
  saving: false,
  reloadData: false,
  errorInfo: {
  },
};

export function reducer(state = initialState, action: ApCreditActions): State {
  switch (action.type) {

    case ApCreditActionTypes.LoadList: {
      return {
        ...state,
        errorInfo: '',
        loading: true,
        reloadData: false,
        filter: action.payload.filter,
        sort: action.payload.sort
      };
    }
    case ApCreditActionTypes.LoadListSuccess: {
      return {
        ...state,
        errorInfo: '',
        list: action.payload.data,
        meta: action.payload._meta,
        reloadData: false,
        loading: false
      };
    }
    case ApCreditActionTypes.LoadListError: {
      return {
        ...state,
        errorInfo: action.payload,
        reloadData: false,
        loading: false
      };
    }
    case ApCreditActionTypes.EditStart: {
      return {
        ...state,
        errorInfo: '',
        action: 'edit',
        loading: action.payload !== '',
        id: action.payload,
        reloadData: false,
        data: initialState.data,
      };
    }
    case ApCreditActionTypes.EditEnd: {
      return {
        ...state,
        action: 'list',
        id: '',
        reloadData: false,
        loading: true,
      };
    }
    case ApCreditActionTypes.LoadDataSuccess: {
      return {
        ...state,
        loading: false,
        errorInfo: '',
        reloadData: false,
        data: action.payload,
      };
    }
    case ApCreditActionTypes.LoadDataError: {
      return {
        ...state,
        errorInfo: action.payload,
        reloadData: false,
        loading: false
      };
    }
    case ApCreditActionTypes.Create: {
      return {
        ...state,
        errorInfo: '',
        loading: true,
        reloadData: false,
        saving: true,
      };
    }
    case ApCreditActionTypes.CreateSuccess: {
      return {
        ...state,
        loading: false,
        errorInfo: '',
        data: action.payload,
        reloadData: true,
        saving: false,
      };
    }
    case ApCreditActionTypes.CreateError: {
      return {
        ...state,
        errorInfo: action.payload,
        saving: false,
        reloadData: false,
        loading: false
      };
    }
    case ApCreditActionTypes.Update: {
      return {
        ...state,
        errorInfo: '',
        saving: true,
        reloadData: false,
        loading: true,
      };
    }
    case ApCreditActionTypes.UpdateSuccess: {
      return {
        ...state,
        loading: false,
        saving: false,
        reloadData: true,
        errorInfo: '',
        data: action.payload,
      };
    }
    case ApCreditActionTypes.UpdateError: {
      return {
        ...state,
        errorInfo: action.payload,
        saving: false,
        reloadData: false,
        loading: false
      };
    }
    case ApCreditActionTypes.DeleteData: {
      return {
        ...state,
        errorInfo: '',
        reloadData: false,
        loading: true,
      };
    }
    case ApCreditActionTypes.DeleteDataSuccess: {
      return {
        ...state,
        loading: false,
        reloadData: false,
        errorInfo: '',
      };
    }
    case ApCreditActionTypes.DeleteDataError: {
      return {
        ...state,
        errorInfo: action.payload,
        reloadData: false,
        loading: false
      };
    }
    default:
      return state;
  }
}
