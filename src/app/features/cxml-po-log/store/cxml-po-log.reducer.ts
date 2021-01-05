import { createFeatureSelector, createSelector } from '@ngrx/store';

import { CxmlPoLogActionTypes, CxmlPoLogActions } from './cxml-po-log.actions';
import { AnteraMeta, AnteraSort } from 'app/models';
import { CxmlPoLog, CxmlPoLogFilter, CxmlPoLogData } from '../models/cxml-po-log';

export interface State {
  list: CxmlPoLog[];
  meta: AnteraMeta;
  filter: CxmlPoLogFilter;
  sort: AnteraSort;
  action: string;
  id: string;
  data: CxmlPoLogData;
  loading: boolean;
  saving: boolean;
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
      poNo: '',
      errors: '',
      processed: false,
    },
    operator: {
      processed: '='
    },
  },
  sort: {
    'order': 'createdDate',
    'orient': 'desc',
  },
  action: 'list',
  id: '',
  data: {
    id: '',
    poNo: '',
    processed: false,
    request: '',
    errors: '',
    createdDate: '',
    modifiedDate: '',
    processedDate: '',
  },
  loading: true,
  saving: false,
  errorInfo: {
  },
};

export function reducer(state = initialState, action: CxmlPoLogActions): State {
  switch (action.type) {

    case CxmlPoLogActionTypes.LoadList: {
      return {
        ...state,
        errorInfo: '',
        loading: true,
        filter: action.payload.filter,
        sort: action.payload.sort
      };
    }
    case CxmlPoLogActionTypes.LoadListSuccess: {
      return {
        ...state,
        errorInfo: '',
        list: action.payload.data,
        meta: action.payload._meta,
        loading: false
      };
    }
    case CxmlPoLogActionTypes.LoadListError: {
      return {
        ...state,
        errorInfo: action.payload,
        loading: false
      };
    }
    case CxmlPoLogActionTypes.EditStart: {
      return {
        ...state,
        errorInfo: '',
        action: 'edit',
        loading: action.payload !== '',
        id: action.payload,
        data: initialState.data,
      };
    }
    case CxmlPoLogActionTypes.EditEnd: {
      return {
        ...state,
        action: 'list',
        id: '',
        loading: true,
      };
    }
    case CxmlPoLogActionTypes.LoadDataSuccess: {
      return {
        ...state,
        loading: false,
        errorInfo: '',
        data: action.payload,
      };
    }
    case CxmlPoLogActionTypes.LoadDataError: {
      return {
        ...state,
        errorInfo: action.payload,
        loading: false
      };
    }
    case CxmlPoLogActionTypes.Create: {
      return {
        ...state,
        errorInfo: '',
        loading: true,
      };
    }
    case CxmlPoLogActionTypes.CreateSuccess: {
      return {
        ...state,
        loading: false,
        errorInfo: '',
        data: action.payload,
      };
    }
    case CxmlPoLogActionTypes.CreateError: {
      return {
        ...state,
        errorInfo: action.payload,
        loading: false
      };
    }
    case CxmlPoLogActionTypes.Update: {
      return {
        ...state,
        errorInfo: '',
        loading: true,
      };
    }
    case CxmlPoLogActionTypes.UpdateSuccess: {
      return {
        ...state,
        loading: false,
        errorInfo: '',
        data: action.payload,
      };
    }
    case CxmlPoLogActionTypes.UpdateError: {
      return {
        ...state,
        errorInfo: action.payload,
        loading: false
      };
    }
    case CxmlPoLogActionTypes.Process: {
      return {
        ...state,
        errorInfo: '',
        loading: action.payload !== '',
        id: action.payload,
      };
    }
    case CxmlPoLogActionTypes.ProcessSuccess: {
      return {
        ...state,
        loading: false,
        errorInfo: '',
      };
    }
    case CxmlPoLogActionTypes.ProcessError: {
      return {
        ...state,
        errorInfo: action.payload.error.errors,
        loading: false
      };
    }
    default:
      return state;
  }
}
