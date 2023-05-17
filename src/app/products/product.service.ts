import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { Product } from './models/product.model';
import { ProductCategory } from './models/product-category.model';

export interface GetResponseProducts {
  _embedded: {
    products: Product[];
  };
  page: {
    size: number;
    totalElements: number;
    totalPages: number;
    number: number;
  };
}

interface GetResponseProductCategories {
  _embedded: {
    product_categories: ProductCategory[]
  };
}

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private readonly PRODUCTS_FILE_URL = 'assets/products.json';
  private readonly PRODUCT_CATEGORIES_FILE_URL = 'assets/categories.json';

  constructor(private http: HttpClient) {
  }

  getProduct(productId: number): Observable<Product> {
    return this.getProductsFromFile().pipe(
      map(products => products.find(product => product.id === productId))
    );
  }

  getProductList(page: number, pageSize: number): Observable<GetResponseProducts> {
    return this.getProductsFromFile().pipe(
      map(products => this.paginateProducts(products, page, pageSize))
    );
  }

  getProductListByCategory(categoryId: number, page: number, pageSize: number)
    : Observable<GetResponseProducts> {
    return this.getProductsFromFile().pipe(
      map(products => {
        const filteredProducts = products.filter(product => product.categoryId === categoryId);
        return this.paginateProducts(filteredProducts, page, pageSize);
      })
    );
  }

  getProductCategories(): Observable<ProductCategory[]> {
    return this.getProductCategoriesFromFile();
  }

  getProductCategoryById(id: number): Observable<ProductCategory> {
    return this.getProductCategoriesFromFile().pipe(
      map(categories => categories.find(category => category.id === id))
    );
  }

  getProductsByKeyword(keyword: string, page: number, pageSize: number)
    : Observable<GetResponseProducts> {
    return this.getProductsFromFile().pipe(
      map(products => {
        const filteredProducts = products.filter(product =>
          product.name.toLowerCase().includes(keyword.toLowerCase())
        );
        return this.paginateProducts(filteredProducts, page, pageSize);
      })
    );
  }

  private getProductsFromFile(): Observable<Product[]> {
    return this.http.get<Product[]>(this.PRODUCTS_FILE_URL);
  }

  private getProductCategoriesFromFile(): Observable<ProductCategory[]> {
    return this.http.get<ProductCategory[]>(this.PRODUCT_CATEGORIES_FILE_URL);
  }

  private paginateProducts(products: Product[], page: number, pageSize: number): GetResponseProducts {
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedProducts = products.slice(startIndex, endIndex);

    return {
      _embedded: {
        products: paginatedProducts
      },
      page: {
        size: pageSize,
        totalElements: products.length,
        totalPages: Math.ceil(products.length / pageSize),
        number: page
      }
    };
  }
}