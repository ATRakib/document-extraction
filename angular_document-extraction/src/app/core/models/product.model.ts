export interface ProductMaster {
  Id?: number;
  ModelName: string;
  Description?: string;
  CountryOfOrigin?: string;
  SupplierId?: number;
  ProductPrice?: number;
}

export interface ProductSpecification {
  Id?: number;
  ProductId?: number;
  SpecificationName?: string;
  Size?: string;
  OtherTerms?: string;
  ProductSpecificationPrice?: number;
}

export interface ProductInsertRequest {
  master: ProductMaster;
  specifications: ProductSpecification[];
}

export interface ExtractedData {
  extracted_text: string;
  product_data: ProductInsertRequest;
}