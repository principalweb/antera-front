import { createFeatureSelector, createSelector } from '@ngrx/store';

import { AnteraProductRepoActionTypes, AnteraProductRepoActions } from './antera-product-repo.actions';
import { AnteraProductRepo, AnteraMeta, AnteraProductRepoFilter, AnteraSort, AnteraProductRepoData } from 'app/models';

export interface State {
  list: AnteraProductRepo[];
  meta: AnteraMeta;
  filter: AnteraProductRepoFilter;
  sort: AnteraSort;
  action: string;
  id: string;
  data: AnteraProductRepoData;
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
      name: '',
      url: '',
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
    name: '',
    url: '',
    enabled: false,
    apikey: '',
  },
  loading: true,
  saving: false,
  errorInfo: {
  },
};

export function reducer(state = initialState, action: AnteraProductRepoActions): State {
  switch (action.type) {

    case AnteraProductRepoActionTypes.LoadList: {
      return {
        ...state,
        errorInfo: '',
        loading: true,
        filter: action.payload.filter,
        sort: action.payload.sort
      };
    }
    case AnteraProductRepoActionTypes.LoadListSuccess: {
      return {
        ...state,
        errorInfo: '',
        list: action.payload.data,
        meta: action.payload._meta,
        loading: false
      };
    }
    case AnteraProductRepoActionTypes.LoadListError: {
      return {
        ...state,
        errorInfo: action.payload,
        loading: false
      };
    }
    case AnteraProductRepoActionTypes.EditStart: {
      return {
        ...state,
        errorInfo: '',
        action: 'edit',
        loading: action.payload !== '',
        id: action.payload,
        data: initialState.data,
      };
    }
    case AnteraProductRepoActionTypes.EditEnd: {
      return {
        ...state,
        action: 'list',
        id: '',
        loading: true,
      };
    }
    case AnteraProductRepoActionTypes.LoadDataSuccess: {
      return {
        ...state,
        loading: false,
        errorInfo: '',
        data: action.payload,
      };
    }
    case AnteraProductRepoActionTypes.LoadDataError: {
      return {
        ...state,
        errorInfo: action.payload,
        loading: false
      };
    }
    default:
      return state;
  }
}
