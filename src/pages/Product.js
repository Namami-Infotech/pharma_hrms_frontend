import React from 'react';
import PageWrapper from '../components/layout/PageWrapper';
import ProductList from '../components/product/ProductList';

function Product() {
  return (
    <PageWrapper title="Product Master">
      <ProductList />
    </PageWrapper>
  );
}

export default Product;
