export class IPostCode {
  value: string;
  displayName: string;
  townName?: string;
  cityName?: string;
  countryName?: string;
}

export class ITown {
  name: string;
  postcodes: IPostCode[];
}

export class ICity {
  name: string;
  towns: ITown[];
}

export class ICountry {
  name: string;
  cities: ICity[];
}
