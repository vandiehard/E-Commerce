-- ============================================================
-- E-Commerce Database Schema
-- MySQL 5.7+ / MariaDB 10.3+
-- Import directly into phpMyAdmin
-- ============================================================

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+07:00";

-- ============================================================
-- 1. CREATE DATABASE
-- ============================================================
CREATE DATABASE IF NOT EXISTS `ecommerce`
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;

USE `ecommerce`;

-- ============================================================
-- 2. TABLE: users
-- Central user table. Stores both customers and admins.
-- role ENUM distinguishes access levels.
-- password stores bcrypt hash (never plain text).
-- ============================================================
CREATE TABLE `users` (
  `id`         INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  `name`       VARCHAR(100)    NOT NULL,
  `email`      VARCHAR(150)    NOT NULL,
  `password`   VARCHAR(255)    NOT NULL           COMMENT 'bcrypt hash',
  `role`       ENUM('customer','admin') NOT NULL DEFAULT 'customer',
  `phone`      VARCHAR(20)     DEFAULT NULL,
  `is_active`  TINYINT(1)      NOT NULL DEFAULT 1 COMMENT '0 = deactivated by admin',
  `created_at` DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_users_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 3. TABLE: addresses
-- Shipping addresses belonging to a user.
-- One user can have many addresses; each address belongs to
-- exactly one user. is_default flags the preferred address.
-- ============================================================
CREATE TABLE `addresses` (
  `id`          INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  `user_id`     INT UNSIGNED    NOT NULL,
  `label`       VARCHAR(50)     NOT NULL           COMMENT 'e.g. Home, Office',
  `street`      TEXT            NOT NULL,
  `city`        VARCHAR(100)    NOT NULL,
  `province`    VARCHAR(100)    NOT NULL,
  `postal_code` VARCHAR(10)     NOT NULL,
  `is_default`  TINYINT(1)      NOT NULL DEFAULT 0,
  `created_at`  DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`  DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  KEY `idx_addresses_user_id` (`user_id`),

  CONSTRAINT `fk_addresses_user`
    FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 4. TABLE: categories
-- Product categories. Flat hierarchy (no parent_id for v1).
-- slug is URL-friendly unique identifier.
-- ============================================================
CREATE TABLE `categories` (
  `id`         INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  `name`       VARCHAR(100)    NOT NULL,
  `slug`       VARCHAR(120)    NOT NULL,
  `created_at` DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_categories_slug` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 5. TABLE: products
-- Each product belongs to one category.
-- images stored as JSON array of file paths.
-- status: active = visible on storefront, inactive = hidden.
-- Indexed on name, category_id, price, status for fast queries.
-- ============================================================
CREATE TABLE `products` (
  `id`          INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  `category_id` INT UNSIGNED    NOT NULL,
  `name`        VARCHAR(200)    NOT NULL,
  `slug`        VARCHAR(220)    NOT NULL,
  `description` TEXT            DEFAULT NULL,
  `price`       DECIMAL(12,2)   NOT NULL,
  `stock`       INT UNSIGNED    NOT NULL DEFAULT 0,
  `images`      JSON            DEFAULT NULL       COMMENT 'Array of image paths',
  `status`      ENUM('active','inactive') NOT NULL DEFAULT 'active',
  `created_at`  DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`  DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_products_slug` (`slug`),

  -- Performance indexes for common queries
  KEY `idx_products_category_id` (`category_id`),
  KEY `idx_products_status`      (`status`),
  KEY `idx_products_price`       (`price`),
  FULLTEXT KEY `ft_products_search` (`name`, `description`),

  CONSTRAINT `fk_products_category`
    FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`)
    ON DELETE RESTRICT
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 6. TABLE: carts
-- One cart per user (1:1). Created lazily when user first
-- adds an item. Deleting user cascades to cart.
-- ============================================================
CREATE TABLE `carts` (
  `id`         INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  `user_id`    INT UNSIGNED    NOT NULL,
  `created_at` DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_carts_user_id` (`user_id`),

  CONSTRAINT `fk_carts_user`
    FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 7. TABLE: cart_items
-- Line items in a cart. Each row references one cart and one
-- product. Quantity must be >= 1 (enforced by CHECK constraint).
-- ============================================================
CREATE TABLE `cart_items` (
  `id`         INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  `cart_id`    INT UNSIGNED    NOT NULL,
  `product_id` INT UNSIGNED    NOT NULL,
  `quantity`   INT UNSIGNED    NOT NULL DEFAULT 1,
  `created_at` DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_cart_items_cart_product` (`cart_id`, `product_id`),
  KEY `idx_cart_items_product_id` (`product_id`),

  CONSTRAINT `chk_cart_items_quantity`
    CHECK (`quantity` >= 1),

  CONSTRAINT `fk_cart_items_cart`
    FOREIGN KEY (`cart_id`) REFERENCES `carts` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,

  CONSTRAINT `fk_cart_items_product`
    FOREIGN KEY (`product_id`) REFERENCES `products` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 8. TABLE: orders
-- Purchase orders. Links user + shipping address.
-- total = sum of (item price * qty) + shipping_cost.
-- status tracks fulfillment lifecycle.
-- payment_status tracks payment independently.
-- snap_token stores Midtrans Snap token for frontend widget.
-- ============================================================
CREATE TABLE `orders` (
  `id`              INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  `user_id`         INT UNSIGNED    NOT NULL,
  `address_id`      INT UNSIGNED    NOT NULL,
  `total`           DECIMAL(12,2)   NOT NULL,
  `shipping_method` VARCHAR(50)     DEFAULT NULL    COMMENT 'e.g. regular, express',
  `shipping_cost`   DECIMAL(10,2)   NOT NULL DEFAULT 0.00,
  `tracking_number` VARCHAR(100)    DEFAULT NULL,
  `status`          ENUM('pending','paid','processing','shipped','delivered','cancelled')
                                    NOT NULL DEFAULT 'pending',
  `payment_status`  ENUM('pending','success','failed','expired')
                                    NOT NULL DEFAULT 'pending',
  `snap_token`      VARCHAR(255)    DEFAULT NULL,
  `notes`           TEXT            DEFAULT NULL,
  `created_at`      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  KEY `idx_orders_user_id`        (`user_id`),
  KEY `idx_orders_status`         (`status`),
  KEY `idx_orders_payment_status` (`payment_status`),
  KEY `idx_orders_created_at`     (`created_at`),

  CONSTRAINT `fk_orders_user`
    FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
    ON DELETE RESTRICT
    ON UPDATE CASCADE,

  CONSTRAINT `fk_orders_address`
    FOREIGN KEY (`address_id`) REFERENCES `addresses` (`id`)
    ON DELETE RESTRICT
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 9. TABLE: order_items
-- Line items in an order. Price is SNAPSHOTTED at time of
-- purchase (not re-read from products table) to preserve
-- historical accuracy.
-- ============================================================
CREATE TABLE `order_items` (
  `id`         INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  `order_id`   INT UNSIGNED    NOT NULL,
  `product_id` INT UNSIGNED    NOT NULL,
  `quantity`   INT UNSIGNED    NOT NULL,
  `price`      DECIMAL(12,2)   NOT NULL           COMMENT 'Price at time of purchase',
  `created_at` DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  KEY `idx_order_items_order_id`   (`order_id`),
  KEY `idx_order_items_product_id` (`product_id`),

  CONSTRAINT `fk_order_items_order`
    FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,

  CONSTRAINT `fk_order_items_product`
    FOREIGN KEY (`product_id`) REFERENCES `products` (`id`)
    ON DELETE RESTRICT
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 10. TABLE: payments
-- One payment record per order. Tracks Midtrans transaction.
-- midtrans_order_id = the order_id sent to Midtrans API.
-- paid_at records the exact timestamp of successful payment.
-- ============================================================
CREATE TABLE `payments` (
  `id`                INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  `order_id`          INT UNSIGNED    NOT NULL,
  `midtrans_order_id` VARCHAR(100)    DEFAULT NULL  COMMENT 'Order ID sent to Midtrans',
  `method`            VARCHAR(50)     DEFAULT NULL  COMMENT 'e.g. gopay, bank_transfer',
  `status`            ENUM('pending','success','failed','expired')
                                      NOT NULL DEFAULT 'pending',
  `paid_at`           DATETIME        DEFAULT NULL,
  `created_at`        DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`        DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_payments_order_id` (`order_id`),
  KEY `idx_payments_midtrans_order_id` (`midtrans_order_id`),
  KEY `idx_payments_status` (`status`),

  CONSTRAINT `fk_payments_order`
    FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 11. TABLE: reviews
-- Product reviews. One review per user per product (unique
-- constraint). Rating must be 1-5.
-- Only allowed after order containing the product is delivered.
-- ============================================================
CREATE TABLE `reviews` (
  `id`         INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  `user_id`    INT UNSIGNED    NOT NULL,
  `product_id` INT UNSIGNED    NOT NULL,
  `rating`     TINYINT UNSIGNED NOT NULL           COMMENT '1 to 5 stars',
  `comment`    TEXT            DEFAULT NULL,
  `created_at` DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_reviews_user_product` (`user_id`, `product_id`),
  KEY `idx_reviews_product_id` (`product_id`),

  CONSTRAINT `chk_reviews_rating`
    CHECK (`rating` BETWEEN 1 AND 5),

  CONSTRAINT `fk_reviews_user`
    FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,

  CONSTRAINT `fk_reviews_product`
    FOREIGN KEY (`product_id`) REFERENCES `products` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================
-- ============================================================
-- ENTITY RELATIONSHIP SUMMARY
-- ============================================================
--
--  users ──1:N──> addresses        (user has many shipping addresses)
--  users ──1:1──> carts            (user has exactly one cart)
--  users ──1:N──> orders           (user has many orders)
--  users ──1:N──> reviews          (user has many reviews)
--
--  categories ──1:N──> products    (category has many products)
--
--  carts ──1:N──> cart_items       (cart has many line items)
--  products ──1:N──> cart_items    (product appears in many carts)
--
--  orders ──1:N──> order_items     (order has many line items)
--  products ──1:N──> order_items   (product appears in many orders)
--  orders ──N:1──> addresses       (order shipped to one address)
--
--  orders ──1:1──> payments        (order has one payment record)
--
--  products ──1:N──> reviews       (product has many reviews)
--
-- ============================================================


-- ============================================================
-- 12. SEED DATA
-- ============================================================

-- Admin user (password: admin123)
-- Hash generated with bcrypt, salt rounds = 10
INSERT INTO `users` (`id`, `name`, `email`, `password`, `role`, `phone`, `is_active`) VALUES
(1, 'Admin',    'admin@store.com',    '$2b$10$UOBwhHrxpZPn486lBDvkQOZ3gmfOrg6zYSB.x8Xt7Z13Gm01/Em.W', 'admin',    '081234567890', 1),
(2, 'John Doe', 'john@example.com',   '$2b$10$iloJECWGMnw6toyNXs7yquBJ6lSH2UMTal/wzvht5ZLDFo/5RCX6e', 'customer', '081234567891', 1);

-- Categories
INSERT INTO `categories` (`id`, `name`, `slug`) VALUES
(1, 'Electronics',   'electronics'),
(2, 'Fashion',       'fashion'),
(3, 'Home & Living', 'home-living'),
(4, 'Sports',        'sports'),
(5, 'Books',         'books');

-- Sample addresses for John Doe
INSERT INTO `addresses` (`id`, `user_id`, `label`, `street`, `city`, `province`, `postal_code`, `is_default`) VALUES
(1, 2, 'Home',   'Jl. Sudirman No. 123', 'Jakarta Selatan', 'DKI Jakarta', '12190', 1),
(2, 2, 'Office', 'Jl. Gatot Subroto Kav. 5', 'Jakarta Selatan', 'DKI Jakarta', '12930', 0);

-- Sample products
INSERT INTO `products` (`id`, `category_id`, `name`, `slug`, `description`, `price`, `stock`, `images`, `status`) VALUES
(1,  1, 'Wireless Bluetooth Headphones', 'wireless-bluetooth-headphones', 'Premium noise-cancelling wireless headphones with 30-hour battery life.', 1299000.00,  50,  '[]', 'active'),
(2,  1, 'Smart Watch Pro',               'smart-watch-pro',               'Advanced smartwatch with health monitoring and GPS tracking.',            2499000.00,  30,  '[]', 'active'),
(3,  1, 'USB-C Fast Charger',            'usb-c-fast-charger',            '65W fast charger compatible with laptops and smartphones.',                    349000.00, 100,  '[]', 'active'),
(4,  1, 'Portable Bluetooth Speaker',    'portable-bluetooth-speaker',    'Waterproof speaker with 360-degree sound.',                                    799000.00,  40,  '[]', 'active'),
(5,  2, 'Classic Cotton T-Shirt',        'classic-cotton-tshirt',         'Comfortable 100% cotton t-shirt available in multiple colors.',                 149000.00, 200,  '[]', 'active'),
(6,  2, 'Slim Fit Jeans',                'slim-fit-jeans',                'Modern slim-fit denim jeans with stretch comfort.',                             399000.00,  80,  '[]', 'active'),
(7,  2, 'Running Sneakers',              'running-sneakers',              'Lightweight running shoes with responsive cushioning.',                         899000.00,  60,  '[]', 'active'),
(8,  3, 'Minimalist Desk Lamp',          'minimalist-desk-lamp',          'LED desk lamp with adjustable brightness and color temperature.',               299000.00,  45,  '[]', 'active'),
(9,  3, 'Ceramic Coffee Mug Set',        'ceramic-coffee-mug-set',        'Set of 4 handmade ceramic mugs, 350ml each.',                                  199000.00,  70,  '[]', 'active'),
(10, 4, 'Yoga Mat Premium',              'yoga-mat-premium',              'Non-slip eco-friendly yoga mat, 6mm thickness.',                                349000.00,  55,  '[]', 'active'),
(11, 4, 'Resistance Band Set',           'resistance-band-set',           '5-piece resistance band set for home workouts.',                                199000.00,  90,  '[]', 'active'),
(12, 5, 'The Art of Programming',        'the-art-of-programming',        'Comprehensive guide to modern software development.',                         189000.00, 120,  '[]', 'active');

-- Sample reviews
INSERT INTO `reviews` (`user_id`, `product_id`, `rating`, `comment`) VALUES
(2, 1, 5, 'Excellent sound quality and very comfortable for long listening sessions.'),
(2, 5, 4, 'Good quality cotton, fits well. Color is slightly different from photo.'),
(2, 8, 5, 'Love the minimalist design. Perfect for my work desk.');


-- ============================================================
-- 13. USEFUL QUERIES (for reference / testing)
-- ============================================================

-- -- Get all active products with category name and average rating
-- SELECT
--   p.id, p.name, p.price, p.stock, p.status,
--   c.name AS category_name,
--   COALESCE(AVG(r.rating), 0) AS avg_rating,
--   COUNT(r.id) AS review_count
-- FROM products p
-- JOIN categories c ON p.category_id = c.id
-- LEFT JOIN reviews r ON p.id = r.product_id
-- WHERE p.status = 'active'
-- GROUP BY p.id
-- ORDER BY p.created_at DESC;

-- -- Get user's cart with items and totals
-- SELECT
--   ci.id AS cart_item_id,
--   p.name, p.price, p.stock, p.images,
--   ci.quantity,
--   (p.price * ci.quantity) AS line_total
-- FROM cart_items ci
-- JOIN carts ct ON ci.cart_id = ct.id
-- JOIN products p ON ci.product_id = p.id
-- WHERE ct.user_id = 2;

-- -- Get order history with items for a user
-- SELECT
--   o.id AS order_id, o.status, o.payment_status, o.total, o.created_at,
--   oi.product_id, p.name AS product_name, oi.quantity, oi.price
-- FROM orders o
-- JOIN order_items oi ON o.id = oi.order_id
-- JOIN products p ON oi.product_id = p.id
-- WHERE o.user_id = 2
-- ORDER BY o.created_at DESC;

-- -- Admin: monthly revenue report
-- SELECT
--   DATE_FORMAT(created_at, '%Y-%m') AS month,
--   COUNT(*) AS total_orders,
--   SUM(total) AS revenue
-- FROM orders
-- WHERE payment_status = 'success'
-- GROUP BY month
-- ORDER BY month DESC;

-- -- Search products by name or description (full-text)
-- SELECT p.id, p.name, p.price, c.name AS category_name
-- FROM products p
-- JOIN categories c ON p.category_id = c.id
-- WHERE p.status = 'active'
--   AND MATCH(p.name, p.description) AGAINST('wireless headphones' IN NATURAL LANGUAGE MODE);

COMMIT;
