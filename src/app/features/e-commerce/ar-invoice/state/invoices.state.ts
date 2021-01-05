import { IInvoice } from '../interface/interface';

export interface State {
    invoiceList: IInvoice[];
    selectedInvoice: IInvoice;
    loading: boolean;
    filters: IFilters;
    fetchError: boolean;
    meta: Meta | null;
}

export interface IFilters {
    label: string;
    status: string;
    customer: string;
}

export interface Meta {
  totalCount: number;
  pageCount: number;
  currentPage: number;
  perPage: number;
}