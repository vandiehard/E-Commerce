const { Op } = require('sequelize');
const sequelize = require('../config/database');
const { Product, Category, Review } = require('../models');
const { success, created, error, paginate } = require('../utils/response');
const { body } = require('express-validator');

const productValidation = [
  body('name').trim().notEmpty().withMessage('Product name is required'),
  body('category_id').isInt().withMessage('Category ID is required'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('stock').isInt({ min: 0 }).withMessage('Stock must be a non-negative number'),
];

const slugify = (text) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

const getProducts = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 12,
      search,
      category_id,
      min_price,
      max_price,
      sort = 'created_at',
      order = 'DESC',
    } = req.query;

    const where = { status: 'active' };

    if (category_id) {
      where.category_id = category_id;
    }

    if (min_price || max_price) {
      where.price = {};
      if (min_price) where.price[Op.gte] = parseFloat(min_price);
      if (max_price) where.price[Op.lte] = parseFloat(max_price);
    }

    let searchQuery = '';
    if (search) {
      searchQuery = `AND MATCH(p.name, p.description) AGAINST('${search.replace(/'/g, "''")}' IN NATURAL LANGUAGE MODE)`;
    }

    const offset = (parseInt(page) - 1) * parseInt(limit);

    // Use raw query for fulltext search support + avg rating
    const rows = await sequelize.query(`
      SELECT p.*, c.name AS category_name,
        COALESCE(AVG(r.rating), 0) AS avg_rating,
        COUNT(r.id) AS review_count
      FROM products p
      JOIN categories c ON p.category_id = c.id
      LEFT JOIN reviews r ON p.id = r.product_id
      WHERE p.status = 'active'
        ${category_id ? `AND p.category_id = ${parseInt(category_id)}` : ''}
        ${min_price ? `AND p.price >= ${parseFloat(min_price)}` : ''}
        ${max_price ? `AND p.price <= ${parseFloat(max_price)}` : ''}
        ${searchQuery}
      GROUP BY p.id
      ORDER BY p.${['created_at', 'price', 'name'].includes(sort) ? sort : 'created_at'} ${order === 'ASC' ? 'ASC' : 'DESC'}
      LIMIT ${parseInt(limit)} OFFSET ${offset}
    `, { type: sequelize.QueryTypes.SELECT });

    const [[{ total }]] = await sequelize.query(`
      SELECT COUNT(*) AS total FROM products p
      WHERE p.status = 'active'
        ${category_id ? `AND p.category_id = ${parseInt(category_id)}` : ''}
        ${min_price ? `AND p.price >= ${parseFloat(min_price)}` : ''}
        ${max_price ? `AND p.price <= ${parseFloat(max_price)}` : ''}
        ${searchQuery}
    `);

    return paginate(res, {
      rows: rows.map((r) => ({
        ...r,
        avg_rating: parseFloat(r.avg_rating),
        review_count: parseInt(r.review_count),
      })),
      count: parseInt(total),
      page: parseInt(page),
      limit: parseInt(limit),
    });
  } catch (err) {
    next(err);
  }
};

const getProductBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;

    const rows = await sequelize.query(`
      SELECT p.*, c.name AS category_name,
        COALESCE(AVG(r.rating), 0) AS avg_rating,
        COUNT(r.id) AS review_count
      FROM products p
      JOIN categories c ON p.category_id = c.id
      LEFT JOIN reviews r ON p.id = r.product_id
      WHERE p.slug = ?
      GROUP BY p.id
    `, { replacements: [slug], type: sequelize.QueryTypes.SELECT });

    if (!rows || rows.length === 0) {
      return error(res, 'Product not found', 404);
    }

    // Related products (same category, exclude current)
    const related = await Product.findAll({
      where: {
        category_id: rows[0].category_id,
        id: { [Op.ne]: rows[0].id },
        status: 'active',
      },
      include: [{ model: Category, as: 'category', attributes: ['name', 'slug'] }],
      limit: 4,
      order: sequelize.random(),
    });

    return success(res, {
      ...rows[0],
      avg_rating: parseFloat(rows[0].avg_rating),
      review_count: parseInt(rows[0].review_count),
      related,
    });
  } catch (err) {
    next(err);
  }
};

const createProduct = async (req, res, next) => {
  try {
    const { name, category_id, description, price, stock, status } = req.body;

    const slug = slugify(name);

    // Handle uploaded images
    let images = [];
    if (req.files && req.files.length > 0) {
      images = req.files.map((f) => `/uploads/${f.filename}`);
    }

    const product = await Product.create({
      name,
      slug,
      category_id,
      description,
      price,
      stock,
      images,
      status: status || 'active',
    });

    return created(res, product, 'Product created successfully');
  } catch (err) {
    next(err);
  }
};

const updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) {
      return error(res, 'Product not found', 404);
    }

    const { name, category_id, description, price, stock, status } = req.body;

    if (name) {
      product.name = name;
      product.slug = slugify(name);
    }
    if (category_id) product.category_id = category_id;
    if (description !== undefined) product.description = description;
    if (price) product.price = price;
    if (stock !== undefined) product.stock = stock;
    if (status) product.status = status;

    // Handle uploaded images
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map((f) => `/uploads/${f.filename}`);
      product.images = [...(product.images || []), ...newImages];
    }

    await product.save();
    return success(res, product, 'Product updated successfully');
  } catch (err) {
    next(err);
  }
};

const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) {
      return error(res, 'Product not found', 404);
    }

    await product.destroy();
    return success(res, null, 'Product deleted successfully');
  } catch (err) {
    next(err);
  }
};

const getCategories = async (req, res, next) => {
  try {
    const categories = await Category.findAll({ order: [['name', 'ASC']] });
    return success(res, categories);
  } catch (err) {
    next(err);
  }
};

const createCategory = async (req, res, next) => {
  try {
    const { name } = req.body;
    const slug = slugify(name);
    const category = await Category.create({ name, slug });
    return created(res, category, 'Category created');
  } catch (err) {
    next(err);
  }
};

const updateCategory = async (req, res, next) => {
  try {
    const category = await Category.findByPk(req.params.id);
    if (!category) return error(res, 'Category not found', 404);

    const { name } = req.body;
    if (name) {
      category.name = name;
      category.slug = slugify(name);
    }
    await category.save();
    return success(res, category, 'Category updated');
  } catch (err) {
    next(err);
  }
};

const deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findByPk(req.params.id);
    if (!category) return error(res, 'Category not found', 404);

    await category.destroy();
    return success(res, null, 'Category deleted');
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getProducts,
  getProductBySlug,
  createProduct,
  updateProduct,
  deleteProduct,
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  productValidation,
};
