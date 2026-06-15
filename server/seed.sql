-- ============================================================
-- SEED DATA - Dummy data for e-commerce website
-- Run this AFTER importing database.sql
-- This will DELETE existing data and re-seed everything
-- ============================================================

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+07:00";

USE `ecommerce`;

-- Ensure carts table exists
CREATE TABLE IF NOT EXISTS `carts` (
  `id`         INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  `user_id`    INT UNSIGNED    NOT NULL,
  `created_at` DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_carts_user_id` (`user_id`),
  CONSTRAINT `fk_carts_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Clear existing data (child tables first to respect foreign keys)
DELETE FROM `reviews`;
DELETE FROM `payments`;
DELETE FROM `order_items`;
DELETE FROM `orders`;
DELETE FROM `cart_items`;
DELETE FROM `carts`;
DELETE FROM `addresses`;
DELETE FROM `products`;
DELETE FROM `categories`;
DELETE FROM `users`;

-- ============================================================
-- USERS (1 admin + 11 customers)
-- Password for all: password123 (admin: admin123)
-- ============================================================
INSERT INTO `users` (`id`, `name`, `email`, `password`, `role`, `phone`, `is_active`) VALUES
(1,  'Admin Store',        'admin@store.com',      '$2b$10$UOBwhHrxpZPn486lBDvkQOZ3gmfOrg6zYSB.x8Xt7Z13Gm01/Em.W', 'admin',    '081234567890', 1),
(2,  'John Doe',           'john@example.com',     '$2b$10$iloJECWGMnw6toyNXs7yquBJ6lSH2UMTal/wzvht5ZLDFo/5RCX6e', 'customer', '081234567891', 1),
(3,  'Jane Smith',         'jane@example.com',     '$2b$10$iloJECWGMnw6toyNXs7yquBJ6lSH2UMTal/wzvht5ZLDFo/5RCX6e', 'customer', '081234567892', 1),
(4,  'Budi Santoso',       'budi@example.com',     '$2b$10$iloJECWGMnw6toyNXs7yquBJ6lSH2UMTal/wzvht5ZLDFo/5RCX6e', 'customer', '081234567893', 1),
(5,  'Siti Rahayu',        'siti@example.com',     '$2b$10$iloJECWGMnw6toyNXs7yquBJ6lSH2UMTal/wzvht5ZLDFo/5RCX6e', 'customer', '081234567894', 1),
(6,  'Ahmad Rizky',        'ahmad@example.com',    '$2b$10$iloJECWGMnw6toyNXs7yquBJ6lSH2UMTal/wzvht5ZLDFo/5RCX6e', 'customer', '081234567895', 1),
(7,  'Dewi Lestari',       'dewi@example.com',     '$2b$10$iloJECWGMnw6toyNXs7yquBJ6lSH2UMTal/wzvht5ZLDFo/5RCX6e', 'customer', '081234567896', 1),
(8,  'Rudi Hartono',       'rudi@example.com',     '$2b$10$iloJECWGMnw6toyNXs7yquBJ6lSH2UMTal/wzvht5ZLDFo/5RCX6e', 'customer', '081234567897', 1),
(9,  'Maya Putri',         'maya@example.com',     '$2b$10$iloJECWGMnw6toyNXs7yquBJ6lSH2UMTal/wzvht5ZLDFo/5RCX6e', 'customer', '081234567898', 1),
(10, 'Andi Wijaya',        'andi@example.com',     '$2b$10$iloJECWGMnw6toyNXs7yquBJ6lSH2UMTal/wzvht5ZLDFo/5RCX6e', 'customer', '081234567899', 1),
(11, 'Rina Susanti',       'rina@example.com',     '$2b$10$iloJECWGMnw6toyNXs7yquBJ6lSH2UMTal/wzvht5ZLDFo/5RCX6e', 'customer', '081234567800', 1),
(12, 'Hendra Gunawan',     'hendra@example.com',   '$2b$10$iloJECWGMnw6toyNXs7yquBJ6lSH2UMTal/wzvht5ZLDFo/5RCX6e', 'customer', '081234567801', 0);

-- ============================================================
-- CATEGORIES
-- ============================================================
INSERT INTO `categories` (`id`, `name`, `slug`) VALUES
(1, 'Electronics',   'electronics'),
(2, 'Fashion',       'fashion'),
(3, 'Home & Living', 'home-living'),
(4, 'Sports',        'sports'),
(5, 'Books',         'books');

-- ============================================================
-- ADDRESSES (2 per customer)
-- ============================================================
INSERT INTO `addresses` (`id`, `user_id`, `label`, `street`, `city`, `province`, `postal_code`, `is_default`) VALUES
(1,  2,  'Home',   'Jl. Sudirman No. 123',          'Jakarta Selatan',  'DKI Jakarta',   '12190', 1),
(2,  2,  'Office', 'Jl. Gatot Subroto Kav. 5',      'Jakarta Selatan',  'DKI Jakarta',   '12930', 0),
(3,  3,  'Home',   'Jl. Malioboro No. 45',           'Yogyakarta',       'DI Yogyakarta', '55271', 1),
(4,  3,  'Office', 'Jl. Solo No. 88',                'Yogyakarta',       'DI Yogyakarta', '55281', 0),
(5,  4,  'Home',   'Jl. Diponegoro No. 12',          'Bandung',          'Jawa Barat',    '40115', 1),
(6,  4,  'Office', 'Jl. Asia Afrika No. 200',        'Bandung',          'Jawa Barat',    '40112', 0),
(7,  5,  'Home',   'Jl. Pahlawan No. 77',            'Surabaya',         'Jawa Timur',    '60171', 1),
(8,  5,  'Office', 'Jl. Basuki Rahmat No. 50',       'Surabaya',         'Jawa Timur',    '60187', 0),
(9,  6,  'Home',   'Jl. Gajah Mada No. 33',          'Semarang',         'Jawa Tengah',   '50131', 1),
(10, 6,  'Office', 'Jl. Pandanaran No. 15',          'Semarang',         'Jawa Tengah',   '50241', 0),
(11, 7,  'Home',   'Jl. Raya Kuta No. 99',            'Badung',           'Bali',          '80361', 1),
(12, 7,  'Office', 'Jl. Sunset Road No. 25',          'Badung',           'Bali',          '80361', 0),
(13, 8,  'Home',   'Jl. Merdeka No. 10',              'Medan',            'Sumatera Utara','20111', 1),
(14, 8,  'Office', 'Jl. Diponegoro No. 55',           'Medan',            'Sumatera Utara','20152', 0),
(15, 9,  'Home',   'Jl. A. Yani No. 88',              'Makassar',         'Sulawesi Selatan','90222', 1),
(16, 9,  'Office', 'Jl. Urip Sumoharjo No. 12',       'Makassar',         'Sulawesi Selatan','90231', 0),
(17, 10, 'Home',   'Jl. Veteran No. 22',               'Malang',           'Jawa Timur',    '65111', 1),
(18, 10, 'Office', 'Jl. Ijen No. 75',                  'Malang',           'Jawa Timur',    '65119', 0),
(19, 11, 'Home',   'Jl. Ahmad Dahlan No. 40',          'Bogor',            'Jawa Barat',    '16111', 1),
(20, 11, 'Office', 'Jl. Pajajaran No. 30',             'Bogor',            'Jawa Barat',    '16143', 0);

-- ============================================================
-- PRODUCTS - ELECTRONICS (Category 1) - 10 products
-- ============================================================
INSERT INTO `products` (`id`, `category_id`, `name`, `slug`, `description`, `price`, `stock`, `images`, `status`) VALUES
(1,  1, 'Wireless Bluetooth Headphones',     'wireless-bluetooth-headphones',     'Premium noise-cancelling wireless headphones with 30-hour battery life, deep bass, and crystal-clear audio. Perfect for music lovers and professionals.', 1299000.00, 50,  '["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500"]', 'active'),
(2,  1, 'Smart Watch Pro',                   'smart-watch-pro',                   'Advanced smartwatch with heart rate monitoring, GPS tracking, sleep analysis, and 7-day battery life. Water resistant up to 50m.', 2499000.00, 30,  '["https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500"]', 'active'),
(3,  1, 'USB-C Fast Charger 65W',            'usb-c-fast-charger-65w',            '65W GaN fast charger compatible with laptops, tablets, and smartphones. Compact design with foldable plug.', 349000.00,  100, '["https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=500"]', 'active'),
(4,  1, 'Portable Bluetooth Speaker',        'portable-bluetooth-speaker',        'Waterproof IPX7 speaker with 360-degree sound, 20-hour playtime, and built-in microphone for calls.', 799000.00,  40,  '["https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=500"]', 'active'),
(5,  1, 'Mechanical Keyboard RGB',           'mechanical-keyboard-rgb',           'Hot-swappable mechanical keyboard with Cherry MX switches, per-key RGB lighting, and aluminum frame.', 1599000.00, 35,  '["https://images.unsplash.com/photo-1511406361295-0a1ff814c0ce?w=500"]', 'active'),
(6,  1, 'Wireless Gaming Mouse',             'wireless-gaming-mouse',             'Ultra-lightweight wireless gaming mouse with 25K DPI sensor, 70-hour battery, and programmable buttons.', 699000.00,  60,  '["https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=500"]', 'active'),
(7,  1, '27-inch 4K Monitor',               '27-inch-4k-monitor',               'IPS 4K UHD monitor with HDR10, 99% sRGB color accuracy, USB-C connectivity, and adjustable stand.', 4999000.00, 15,  '["https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=500"]', 'active'),
(8,  1, 'Noise Cancelling Earbuds',          'noise-cancelling-earbuds',          'True wireless earbuds with active noise cancellation, transparency mode, and wireless charging case.', 1899000.00, 45,  '["https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?w=500"]', 'active'),
(9,  1, 'USB Hub 7-in-1',                   'usb-hub-7-in-1',                   'Multi-port USB-C hub with HDMI 4K, USB 3.0, SD card reader, PD charging, and Ethernet port.', 449000.00,  80,  '["https://images.unsplash.com/photo-1625723044792-44de16ccb4e9?w=500"]', 'active'),
(10, 1, 'Webcam HD 1080p',                  'webcam-hd-1080p',                  'Full HD webcam with autofocus, dual stereo microphones, privacy shutter, and universal mount.', 599000.00,  55,  '["https://images.unsplash.com/photo-1587826080692-f439cd0b70da?w=500"]', 'active'),

-- ============================================================
-- PRODUCTS - FASHION (Category 2) - 10 products
-- ============================================================
(11, 2, 'Classic Cotton T-Shirt',            'classic-cotton-tshirt',             'Comfortable 100% combed cotton t-shirt with pre-shrunk fabric. Available in multiple colors. Unisex fit.', 149000.00,  200, '["https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500"]', 'active'),
(12, 2, 'Slim Fit Jeans',                    'slim-fit-jeans',                    'Modern slim-fit denim jeans with stretch comfort technology. Classic 5-pocket design with reinforced stitching.', 399000.00,  80,  '["https://images.unsplash.com/photo-1542272604-787c3835535d?w=500"]', 'active'),
(13, 2, 'Hooded Zip-Up Hoodie',             'hooded-zip-up-hoodie',             'Premium fleece hoodie with full zip, kangaroo pockets, and adjustable drawstring hood. Perfect for layering.', 499000.00,  65,  '["https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=500"]', 'active'),
(14, 2, 'Leather Crossbody Bag',            'leather-crossbody-bag',            'Genuine leather crossbody bag with adjustable strap, multiple compartments, and gold-tone hardware.', 899000.00,  30,  '["https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=500"]', 'active'),
(15, 2, 'Canvas Sneakers',                  'canvas-sneakers',                  'Classic low-top canvas sneakers with vulcanized rubber sole. Timeless design for everyday wear.', 349000.00,  90,  '["https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500"]', 'active'),
(16, 2, 'Oversized Blazer',                 'oversized-blazer',                 'Relaxed-fit oversized blazer with notched lapels and single-button closure. Perfect for smart-casual looks.', 799000.00,  40,  '["https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=500"]', 'active'),
(17, 2, 'Silk Scarf Premium',               'silk-scarf-premium',               '100% mulberry silk scarf with hand-rolled edges. Versatile accessory that can be worn multiple ways.', 299000.00,  75,  '["https://images.unsplash.com/photo-1606259458027-54d2a728b6ab?w=500"]', 'active'),
(18, 2, 'Running Sneakers Ultra',            'running-sneakers-ultra',            'Lightweight running shoes with responsive cushioning, breathable mesh upper, and durable rubber outsole.', 1199000.00, 50,  '["https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500"]', 'active'),
(19, 2, 'Polo Shirt Classic',               'polo-shirt-classic',               'Premium pique cotton polo shirt with embroidered logo, ribbed collar, and two-button placket.', 249000.00,  120, '["https://images.unsplash.com/photo-1625910513413-c23b8bb81cba?w=500"]', 'active'),
(20, 2, 'Wool Beanie Hat',                  'wool-beanie-hat',                  'Soft merino wool beanie with ribbed knit pattern. Warm and comfortable for cold weather.', 129000.00,  150, '["https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9?w=500"]', 'active'),

-- ============================================================
-- PRODUCTS - HOME & LIVING (Category 3) - 10 products
-- ============================================================
(21, 3, 'Minimalist Desk Lamp',              'minimalist-desk-lamp',              'LED desk lamp with adjustable brightness, 3 color temperatures, USB charging port, and touch controls.', 299000.00,  45,  '["https://images.unsplash.com/photo-1519219788971-8d9797e0928e?w=500"]', 'active'),
(22, 3, 'Ceramic Coffee Mug Set',            'ceramic-coffee-mug-set',            'Set of 4 handmade ceramic mugs, 350ml each. Microwave and dishwasher safe with matte finish.', 199000.00,  70,  '["https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=500"]', 'active'),
(23, 3, 'Scented Candle Collection',         'scented-candle-collection',         'Set of 3 soy wax candles with natural essential oils. Includes Lavender, Vanilla, and Sandalwood scents.', 249000.00,  60,  '["https://images.unsplash.com/photo-1602028915047-37269d1a73f7?w=500"]', 'active'),
(24, 3, 'Linen Throw Pillow',               'linen-throw-pillow',               'Premium linen cushion cover with hidden zipper. 45x45cm, machine washable. Perfect for sofa or bed.', 179000.00,  85,  '["https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=500"]', 'active'),
(25, 3, 'Wooden Wall Shelf',                'wooden-wall-shelf',                'Floating wall shelf made from solid oak wood. 60cm wide with invisible mounting hardware included.', 399000.00,  35,  '["https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=500"]', 'active'),
(26, 3, 'Indoor Plant Pot Set',             'indoor-plant-pot-set',             'Set of 3 minimalist ceramic plant pots with bamboo saucers. Ideal for succulents and small plants.', 229000.00,  55,  '["https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=500"]', 'active'),
(27, 3, 'Cotton Bath Towel Set',            'cotton-bath-towel-set',            'Luxurious 600 GSM Egyptian cotton towel set. Includes 2 bath towels, 2 hand towels, and 2 washcloths.', 499000.00,  40,  '["https://images.unsplash.com/photo-1523471826770-c437b4636fe6?w=500"]', 'active'),
(28, 3, 'Wall Art Canvas Print',            'wall-art-canvas-print',            'Modern abstract canvas wall art, 60x80cm. Gallery-wrapped on solid wood frame, ready to hang.', 349000.00,  50,  '["https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=500"]', 'active'),
(29, 3, 'Bamboo Storage Basket',            'bamboo-storage-basket',            'Handwoven bamboo storage basket with cotton lining. Perfect for organizing blankets, toys, or laundry.', 189000.00,  65,  '["https://images.unsplash.com/photo-1627627256672-027a4613d028?w=500"]', 'active'),
(30, 3, 'Aroma Diffuser',                   'aroma-diffuser',                   'Ultrasonic essential oil diffuser with 7 LED color lights, auto shut-off, and 300ml water tank.', 279000.00,  70,  '["https://images.unsplash.com/photo-1625479968533-de325eb299a4?w=500"]', 'active'),

-- ============================================================
-- PRODUCTS - SPORTS (Category 4) - 10 products
-- ============================================================
(31, 4, 'Yoga Mat Premium',                  'yoga-mat-premium',                  'Non-slip eco-friendly TPE yoga mat, 6mm thickness. Includes carrying strap. Perfect for all yoga styles.', 349000.00,  55,  '["https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=500"]', 'active'),
(32, 4, 'Resistance Band Set',               'resistance-band-set',               '5-piece latex resistance band set with different tension levels. Includes door anchor, handles, and carry bag.', 199000.00,  90,  '["https://images.unsplash.com/photo-1598289431512-b97b0917affc?w=500"]', 'active'),
(33, 4, 'Stainless Steel Water Bottle',      'stainless-steel-water-bottle',      'Double-wall vacuum insulated bottle, 750ml. Keeps drinks cold 24hrs or hot 12hrs. BPA-free.', 249000.00,  110, '["https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=500"]', 'active'),
(34, 4, 'Adjustable Dumbbell Set',           'adjustable-dumbbell-set',           'Adjustable dumbbell pair, 2.5-25kg each. Quick-change weight selection with durable steel construction.', 2999000.00, 20,  '["https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=500"]', 'active'),
(35, 4, 'Running Armband Phone Holder',      'running-armband-phone-holder',      'Lightweight running armband with reflective strip, key holder, and touchscreen-compatible window.', 129000.00,  130, '["https://images.unsplash.com/photo-1576678927484-cc907957088c?w=500"]', 'active'),
(36, 4, 'Foam Roller',                       'foam-roller',                       'High-density EVA foam roller for muscle recovery and flexibility. 45cm length, ideal for back and leg massage.', 179000.00,  75,  '["https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=500"]', 'active'),
(37, 4, 'Cycling Gloves',                    'cycling-gloves',                    'Padded palm cycling gloves with breathable mesh back, silicone grip, and touch-compatible fingertips.', 199000.00,  60,  '["https://images.unsplash.com/photo-1645445470303-f96692cf1217?w=500"]', 'active'),
(38, 4, 'Jump Rope Speed',                   'jump-rope-speed',                   'Adjustable speed jump rope with ball bearings, non-slip handles, and steel cable with PVC coating.', 149000.00,  100, '["https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=500"]', 'active'),
(39, 4, 'Sports Backpack 30L',              'sports-backpack-30l',              'Lightweight sports backpack with shoe compartment, water bottle pocket, and padded laptop sleeve.', 449000.00,  45,  '["https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500"]', 'active'),
(40, 4, 'Fitness Tracker Band',             'fitness-tracker-band',             'Slim fitness tracker with step counter, heart rate monitor, sleep tracking, and 14-day battery life.', 399000.00,  70,  '["https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=500"]', 'active'),

-- ============================================================
-- PRODUCTS - BOOKS (Category 5) - 10 products
-- ============================================================
(41, 5, 'The Art of Programming',            'the-art-of-programming',            'Comprehensive guide to modern software development. Covers design patterns, clean code, and best practices.', 189000.00, 120, '["https://images.unsplash.com/photo-1532012197267-da84d127e765?w=500"]', 'active'),
(42, 5, 'Business Strategy Essentials',      'business-strategy-essentials',      'Learn strategic thinking and business planning from top MBA professors. Includes real-world case studies.', 229000.00,  80,  '["https://images.unsplash.com/photo-1517770413964-df8ca61194a6?w=500"]', 'active'),
(43, 5, 'Mindful Living Guide',              'mindful-living-guide',              'A practical guide to mindfulness meditation, stress reduction, and living a more intentional life.', 159000.00,  95,  '["https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=500"]', 'active'),
(44, 5, 'Indonesian Cookbook',               'indonesian-cookbook',               'Authentic recipes from across the Indonesian archipelago. Over 100 traditional dishes with step-by-step photos.', 199000.00,  65,  '["https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=500"]', 'active'),
(45, 5, 'Digital Marketing Mastery',         'digital-marketing-mastery',         'Complete guide to SEO, social media marketing, email campaigns, and paid advertising strategies.', 249000.00,  70,  '["https://images.unsplash.com/photo-1553877522-43269d4ea984?w=500"]', 'active'),
(46, 5, 'The Science of Habits',             'the-science-of-habits',             'Understand the psychology behind habit formation and learn science-backed methods to build better habits.', 179000.00,  110, '["https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=500"]', 'active'),
(47, 5, 'Children Story Book Collection',    'children-story-book-collection',    'Beautifully illustrated collection of 20 classic fairy tales and stories for children ages 3-10.', 299000.00,  50,  '["https://images.unsplash.com/photo-1549737221-bef65e2604a6?w=500"]', 'active'),
(48, 5, 'Photography Handbook',              'photography-handbook',              'Master photography from basics to advanced techniques. Covers composition, lighting, and post-processing.', 219000.00,  60,  '["https://images.unsplash.com/photo-1621413412189-c1b47c66f70b?w=500"]', 'active'),
(49, 5, 'Financial Freedom Blueprint',       'financial-freedom-blueprint',       'Step-by-step guide to personal finance, investing, budgeting, and achieving financial independence.', 189000.00,  85,  '["https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=500"]', 'active'),
(50, 5, 'Travel Journal Indonesia',          'travel-journal-indonesia',          'Stunning photography book showcasing the beauty of Indonesian islands, culture, and hidden destinations.', 349000.00,  40,  '["https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=500"]', 'active');

-- ============================================================
-- ORDERS (various statuses and users)
-- ============================================================
INSERT INTO `orders` (`id`, `user_id`, `address_id`, `total`, `shipping_method`, `shipping_cost`, `tracking_number`, `status`, `payment_status`, `notes`, `created_at`) VALUES
-- Delivered orders (for reviews)
(1,  2, 1,  2748000.00, 'regular', 15000.00, 'JNE-REG-001122', 'delivered', 'success', NULL, '2026-05-01 10:30:00'),
(2,  3, 3,  548000.00,  'regular', 18000.00, 'JNE-REG-001234', 'delivered', 'success', 'Please leave at front door', '2026-05-05 14:20:00'),
(3,  4, 5,  899000.00,  'express', 30000.00, 'JNE-EXP-001567', 'delivered', 'success', NULL, '2026-05-08 09:15:00'),
(4,  5, 7,  1298000.00, 'regular', 20000.00, 'JNE-REG-001890', 'delivered', 'success', 'Gift wrap please', '2026-05-10 16:45:00'),
(5,  6, 9,  648000.00,  'regular', 12000.00, 'JNE-REG-002001', 'delivered', 'success', NULL, '2026-05-12 11:00:00'),
-- Shipped orders
(6,  2, 1,  4499000.00, 'express', 25000.00, 'JNE-EXP-002345', 'shipped',   'success', 'Handle with care', '2026-06-01 08:30:00'),
(7,  7, 11, 749000.00,  'regular', 15000.00, 'JNE-REG-002678', 'shipped',   'success', NULL, '2026-06-03 13:10:00'),
-- Processing orders
(8,  8, 13, 1598000.00, 'regular', 18000.00, NULL,            'processing','success', NULL, '2026-06-08 10:00:00'),
(9,  9, 15, 498000.00,  'express', 35000.00, NULL,            'processing','success', 'Need before weekend', '2026-06-10 15:30:00'),
-- Pending/Paid orders
(10, 10, 17, 899000.00,  'regular', 14000.00, NULL,            'paid',      'success', NULL, '2026-06-12 09:00:00'),
(11, 11, 19, 2299000.00, 'regular', 16000.00, NULL,            'pending',   'pending', NULL, '2026-06-13 20:00:00'),
-- Cancelled order
(12, 2, 1,  349000.00,  'regular', 15000.00, NULL,            'cancelled', 'expired', NULL, '2026-05-15 12:00:00'),
-- More delivered orders
(13, 6, 9,  499000.00,  'regular', 12000.00, 'JNE-REG-003001', 'delivered', 'success', NULL, '2026-04-20 10:30:00'),
(14, 4, 5,  1299000.00, 'express', 30000.00, 'JNE-EXP-003234', 'delivered', 'success', NULL, '2026-04-25 14:00:00'),
(15, 3, 3,  399000.00,  'regular', 18000.00, 'JNE-REG-003567', 'delivered', 'success', NULL, '2026-05-20 09:45:00');

-- ============================================================
-- ORDER ITEMS
-- ============================================================
INSERT INTO `order_items` (`id`, `order_id`, `product_id`, `quantity`, `price`) VALUES
-- Order 1: Headphones + T-Shirt (delivered)
(1,  1,  1,  1, 1299000.00),
(2,  1,  11, 2, 149000.00),
-- Order 2: Coffee Mug + Scented Candle (delivered)
(3,  2,  22, 1, 199000.00),
(4,  2,  23, 1, 249000.00),
-- Order 3: Running Sneakers Ultra (delivered)
(5,  3,  18, 1, 1199000.00),
-- Order 4: Hoodie + Jeans (delivered)
(6,  4,  13, 1, 499000.00),
(7,  4,  12, 2, 399000.00),
-- Order 5: Desk Lamp + Throw Pillow (delivered)
(8,  5,  21, 1, 299000.00),
(9,  5,  24, 2, 179000.00),
-- Order 6: 4K Monitor (shipped)
(10, 6,  7,  1, 4999000.00),
-- Order 7: Bluetooth Speaker (shipped)
(11, 7,  4,  1, 799000.00),
-- Order 8: Mechanical Keyboard + Earbuds (processing)
(12, 8,  5,  1, 1599000.00),
-- Order 9: Polo Shirt + Bath Towel (processing)
(13, 9,  19, 1, 249000.00),
(14, 9,  27, 1, 499000.00),
-- Order 10: Crossbody Bag (paid)
(15, 10, 14, 1, 899000.00),
-- Order 11: Smart Watch + Canvas Sneakers (pending)
(16, 11, 2,  1, 2499000.00),
(17, 11, 15, 1, 349000.00),
-- Order 12: USB-C Charger (cancelled)
(18, 12, 3,  1, 349000.00),
-- Order 13: Oversized Blazer (delivered)
(19, 13, 16, 1, 799000.00),
-- Order 14: Bluetooth Headphones (delivered)
(20, 14, 1,  1, 1299000.00),
-- Order 15: Slim Fit Jeans (delivered)
(21, 15, 12, 1, 399000.00);

-- ============================================================
-- PAYMENTS
-- ============================================================
INSERT INTO `payments` (`id`, `order_id`, `midtrans_order_id`, `method`, `status`, `paid_at`) VALUES
(1,  1,  'ORD-20260501-001',  'gopay',        'success', '2026-05-01 10:32:00'),
(2,  2,  'ORD-20260505-002',  'bank_transfer', 'success', '2026-05-05 14:25:00'),
(3,  3,  'ORD-20260508-003',  'gopay',        'success', '2026-05-08 09:18:00'),
(4,  4,  'ORD-20260510-004',  'credit_card',   'success', '2026-05-10 16:50:00'),
(5,  5,  'ORD-20260512-005',  'gopay',        'success', '2026-05-12 11:05:00'),
(6,  6,  'ORD-20260601-006',  'bank_transfer', 'success', '2026-06-01 08:35:00'),
(7,  7,  'ORD-20260603-007',  'gopay',        'success', '2026-06-03 13:15:00'),
(8,  8,  'ORD-20260608-008',  'credit_card',   'success', '2026-06-08 10:05:00'),
(9,  9,  'ORD-20260610-009',  'gopay',        'success', '2026-06-10 15:35:00'),
(10, 10, 'ORD-20260612-010',  'bank_transfer', 'success', '2026-06-12 09:10:00'),
(11, 11, 'ORD-20260613-011',  NULL,            'pending', NULL),
(12, 12, 'ORD-20260515-012',  NULL,            'expired', NULL),
(13, 13, 'ORD-20260420-013',  'gopay',        'success', '2026-04-20 10:35:00'),
(14, 14, 'ORD-20260425-014',  'credit_card',   'success', '2026-04-25 14:05:00'),
(15, 15, 'ORD-20260520-015',  'bank_transfer', 'success', '2026-05-20 09:50:00');

-- ============================================================
-- REVIEWS (only for delivered orders)
-- ============================================================
INSERT INTO `reviews` (`user_id`, `product_id`, `rating`, `comment`) VALUES
-- John Doe reviews (order 1 delivered)
(2, 1,  5, 'Excellent sound quality! The noise cancellation works great on my daily commute. Battery lasts forever.'),
(2, 11, 4, 'Comfortable cotton tee, fits perfectly. Color is slightly different from the photo but still nice.'),
-- Jane Smith reviews (order 2 delivered)
(3, 22, 5, 'Beautiful ceramic mugs! Love the handmade feel. Perfect size for my morning coffee.'),
(3, 23, 4, 'The lavender scent is amazing. Burns evenly and lasts a long time. Will buy again.'),
-- Budi Santoso reviews (order 3 delivered)
(4, 18, 5, 'Best running shoes I have ever owned. Super lightweight and the cushioning is incredible.'),
-- Siti Rahayu reviews (order 4 delivered)
(5, 13, 5, 'So warm and cozy! The fleece material is premium quality. Love the fit.'),
(5, 12, 4, 'Great jeans, stretchy and comfortable. Slim fit is perfect for casual wear.'),
-- Ahmad Rizky reviews (order 5 delivered)
(6, 21, 5, 'Perfect desk lamp for my home office. The USB charging port is super convenient.'),
(6, 24, 4, 'Nice quality linen pillows. They look great on my sofa. Wish there were more color options.'),
-- Dewi Lestari (order 13 delivered - blazer)
(7, 16, 5, 'Absolutely stunning blazer! The oversized fit is trendy and the material is high quality.'),
-- Budi reviews (order 14 delivered - headphones)
(4, 1,  4, 'Second purchase! Great headphones for the price. Comfortable for long gaming sessions.'),
-- Jane reviews (order 15 delivered - jeans)
(3, 12, 5, 'Bought again because I loved my first pair. Consistent quality and great fit.'),
-- Ahmad reviews (blazer from order 13 - can't, he didn't buy it. Let's add reviews for other delivered items)
(6, 16, 4, 'Got this for my wife. She loves the oversized style. Good quality for the price.'),
-- Extra reviews from various users
(4, 22, 5, 'Bought as a gift and they loved it. Beautiful craftsmanship.'),
(5, 23, 3, 'Scent is nice but fades quickly compared to other candles I have tried.'),
(2, 18, 5, 'Upgraded my running game with these. Worth every rupiah!'),
(7, 21, 4, 'Clean minimalist design. The touch controls are very responsive.'),
(8, 5,  5, 'The hot-swappable switches are a game changer. Typing feels amazing.'),
(9, 33, 4, 'Keeps water cold all day. Great quality stainless steel bottle.'),
(10, 41, 5, 'One of the best programming books I have read. Clear explanations and practical examples.');

-- ============================================================
-- CARTS (for some active users)
-- ============================================================
INSERT INTO `carts` (`id`, `user_id`) VALUES
(1, 3),
(2, 4),
(3, 6),
(4, 7);

-- ============================================================
-- CART ITEMS
-- ============================================================
INSERT INTO `cart_items` (`cart_id`, `product_id`, `quantity`) VALUES
(1, 5,  1),   -- Jane has Mechanical Keyboard in cart
(1, 33, 2),   -- Jane has 2 Water Bottles in cart
(2, 41, 1),   -- Budi has Programming book in cart
(2, 50, 1),   -- Budi has Travel Journal in cart
(3, 8,  1),   -- Ahmad has Earbuds in cart
(3, 9,  1),   -- Ahmad has USB Hub in cart
(4, 27, 1),   -- Dewi has Bath Towel Set in cart
(4, 30, 1);   -- Dewi has Aroma Diffuser in cart

