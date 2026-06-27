/* eslint-disable prettier/prettier */

import { City } from "src/infrastructure/entities/city.entity";

export class CityPresenter {
  id: number;
  name: string;
  constructor(city: City) {
    this.id = city.id;
    this.name = city.name;
  }
}
