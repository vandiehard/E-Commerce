const { Cart, CartItem, Product } = require('../models');
const { success, error } = require('../utils/response');

const getCart = async (req, res, next) => {
  try {
    let cart = await Cart.findOne({
      where: { user_id: req.user.id },
      include: [{
        model: CartItem,
        as: 'items',
        include: [{
          model: Product,
          as: 'product',
          attributes: ['id', 'name', 'slug', 'price', 'stock', 'images', 'status'],
        }],
      }],
    });

    if (!cart) {
      return success(res, { items: [], total: 0 });
    }

    // Calculate total
    const total = cart.items.reduce((sum, item) => {
      if (item.product) {
        return sum + parseFloat(item.product.price) * item.quantity;
      }
      return sum;
    }, 0);

    return success(res, { ...cart.toJSON(), total });
  } catch (err) {
    next(err);
  }
};

const addToCart = async (req, res, next) => {
  try {
    const { product_id, quantity = 1 } = req.body;

    // Validate product exists and has stock
    const product = await Product.findByPk(product_id);
    if (!product) return error(res, 'Product not found', 404);
    if (product.status !== 'active') return error(res, 'Product is not available', 400);
    if (product.stock < quantity) return error(res, 'Insufficient stock', 400);

    // Get or create cart
    let [cart] = await Cart.findOrCreate({
      where: { user_id: req.user.id },
    });

    // Check if item already in cart
    const [cartItem, created] = await CartItem.findOrCreate({
      where: { cart_id: cart.id, product_id },
      defaults: { quantity },
    });

    if (!created) {
      const newQty = cartItem.quantity + quantity;
      if (product.stock < newQty) return error(res, 'Insufficient stock', 400);
      cartItem.quantity = newQty;
      await cartItem.save();
    }

    return success(res, cartItem, 'Item added to cart');
  } catch (err) {
    next(err);
  }
};

const updateCartItem = async (req, res, next) => {
  try {
    const { quantity } = req.body;
    const cartItem = await CartItem.findByPk(req.params.id, {
      include: [{ model: Cart, as: 'cart' }],
    });

    if (!cartItem || cartItem.cart.user_id !== req.user.id) {
      return error(res, 'Cart item not found', 404);
    }

    const product = await Product.findByPk(cartItem.product_id);
    if (product.stock < quantity) {
      return error(res, 'Insufficient stock', 400);
    }

    cartItem.quantity = quantity;
    await cartItem.save();

    return success(res, cartItem, 'Cart updated');
  } catch (err) {
    next(err);
  }
};

const removeCartItem = async (req, res, next) => {
  try {
    const cartItem = await CartItem.findByPk(req.params.id, {
      include: [{ model: Cart, as: 'cart' }],
    });

    if (!cartItem || cartItem.cart.user_id !== req.user.id) {
      return error(res, 'Cart item not found', 404);
    }

    await cartItem.destroy();
    return success(res, null, 'Item removed from cart');
  } catch (err) {
    next(err);
  }
};

const clearCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ where: { user_id: req.user.id } });
    if (!cart) return success(res, null, 'Cart is already empty');

    await CartItem.destroy({ where: { cart_id: cart.id } });
    return success(res, null, 'Cart cleared');
  } catch (err) {
    next(err);
  }
};

module.exports = { getCart, addToCart, updateCartItem, removeCartItem, clearCart };
