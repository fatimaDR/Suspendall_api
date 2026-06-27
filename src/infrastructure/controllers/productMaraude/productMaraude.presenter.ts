import { ProductMaraude } from "src/infrastructure/entities/productMaraude.entity";
import { ProductPresenter } from "../product/products.presenter";
import { MaraudePresenter } from "../maraude/maraudes.presenter";

export class ProductMaraudePresenter {
    id: number;
    quantity:number;
    product:Object
    maraude: Object;

  
    constructor(productMaraude: ProductMaraude) {
      this.id = productMaraude.id;
      if(productMaraude.quantity) this.quantity = productMaraude.quantity;

      if(productMaraude.product) {
        this.product = new ProductPresenter(productMaraude.product);
      }

      if(productMaraude.maraude) {
        this.maraude = new MaraudePresenter(productMaraude.maraude);
      }
      
    }
}