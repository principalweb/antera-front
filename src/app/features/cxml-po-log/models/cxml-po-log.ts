export class CxmlPoLog
{
  'id': string;
  'poNo': string;
  'processed': boolean;
  'request': string;
  'errors': string;
  'createdDate': string;
  'modifiedDate': string;
  'processedDate': string;
}

export class CxmlPoLogData
{
  'id': string;
  'poNo': string;
  'processed': boolean;
  'request': string;
  'errors': string;
  'createdDate': string;
  'modifiedDate': string;
  'processedDate': string;
}

export class CxmlPoLogFilter
{
  terms: {
    poNo: string;
    errors: string;
    processed: boolean;
  };
  operator: {
    processed: string;
  };
}

export class CxmlPoStatusList
{
  id: boolean;
  value: string;
}
