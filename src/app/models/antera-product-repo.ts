export class AnteraProductRepo
{
  'id': string;
  'name': string;
  'url': string;
  'enabled': boolean;
}

export class AnteraProductRepoData
{
  'id': string;
  'name': string;
  'url': string;
  'enabled': boolean;
  'apikey': string;
}

export class AnteraProductRepoFilter
{
  terms: {
    name: string;
    url: string;
  };
}
