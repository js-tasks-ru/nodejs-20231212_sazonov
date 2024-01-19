const mongoose = require('mongoose');
const Product = require('../models/Product');
const productMapper = require('../mappers/product');

module.exports.productsBySubcategory = async function productsBySubcategory(ctx, next) {
  const {subcategory} = ctx.query;
  if (!subcategory) return next();
  const isValid = mongoose.Types.ObjectId.isValid(subcategory);
  if (!isValid) return next();
  const products = await Product.find({subcategory: subcategory});
  ctx.body = {products: products.map(productMapper)};
};

module.exports.productList = async function productList(ctx, next) {
  const products = await Product.find();
  ctx.body = {products: products.map(productMapper)};
};

module.exports.productById = async function productById(ctx, next) {
  const id = ctx.params.id;
  const isValid = mongoose.Types.ObjectId.isValid(id);
  if (!isValid) {
    ctx.status = 400;
    ctx.body = {};
    return;
  }
  const product = await Product.findOne({_id: id});
  if (!product) {
    ctx.status = 404;
    ctx.body = {};
    return;
  }
  ctx.body = {product: productMapper(product)};
};

