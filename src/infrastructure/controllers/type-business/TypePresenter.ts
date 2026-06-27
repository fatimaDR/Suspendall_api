import { TypeBusiness } from "src/infrastructure/entities/type-business.entity";

export class TypePresenter {
  id: number;
  name: string;

  createdAt: Date
  
  constructor(type: TypeBusiness) {
    this.id = type.id;
    this.name = type.name;
    this.createdAt = type.createdAt
  }
  }