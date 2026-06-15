# Product Requirements Document (PRD)
## E-Commerce Platform

**Version:** 1.0.0  
**Status:** Draft  
**Last Updated:** June 2026

---

## 1. Overview

### 1.1 Product Summary

Platform e-commerce full-featured yang memungkinkan pengguna untuk browsing produk, menambahkan ke keranjang belanja, melakukan checkout, dan melakukan pembayaran secara online. Dibangun dengan React, Node.js + Express, dan MySQL, dengan integrasi Midtrans sebagai payment gateway utama.

### 1.2 Goals & Objectives

- Menyediakan pengalaman belanja online yang seamless dari product discovery hingga payment confirmation
- Mendukung berbagai metode pembayaran lokal Indonesia via Midtrans (GoPay, OVO, DANA, QRIS, Virtual Account, Indomaret/Alfamart)
- Membangun sistem manajemen produk dan order yang scalable
- Memberikan pengalaman pengguna yang responsif dan cepat di desktop maupun mobile

### 1.3 Target Users

| User Type | Deskripsi |
|-----------|-----------|
| **Shopper (Customer)** | Pengguna yang browsing, membeli produk |
| **Admin** | Pengelola toko — manajemen produk, order, dan laporan |

---

## 2. Tech Stack

| Layer | Teknologi |
|-------|-----------|
| **Frontend** | React (Vite), React Router, Axios, Tailwind CSS |
| **Backend** | Node.js, Express.js, REST API |
| **Database** | MySQL dengan Sequelize ORM |
| **Payment Gateway** | Midtrans (Snap) |
| **Auth** | JWT (JSON Web Token) |
| **File Storage** | Local / Cloud Storage (untuk image produk) |

---

## 3. Fitur Utama

### 3.1 Authentication & Authorization

**Customer:**
- Register dengan email & password
- Login / Logout
- Forgot password (via email)
- Profile management (nama, alamat, nomor HP)

**Admin:**
- Login ke dashboard admin (role-based access)
- Akses terbatas hanya untuk admin

**Acceptance Criteria:**
- JWT token disimpan di httpOnly cookie
- Password di-hash menggunakan bcrypt
- Refresh token mechanism untuk session management

---

### 3.2 Product Catalog

**Customer dapat:**
- Melihat daftar produk dengan pagination
- Filter produk berdasarkan kategori, harga (range), dan rating
- Search produk berdasarkan nama/deskripsi (full-text search)
- Melihat detail produk (foto, deskripsi, stok, harga, ulasan)
- Melihat produk terkait / rekomendasi

**Admin dapat:**
- Tambah, edit, hapus produk
- Upload foto produk (multiple images)
- Atur stok dan status produk (aktif/nonaktif)
- Kelola kategori produk

**Acceptance Criteria:**
- Gambar produk dikompresi sebelum disimpan
- Stok terkunci saat checkout untuk mencegah oversell
- Produk dengan stok 0 otomatis tampil sebagai "Habis"

---

### 3.3 Shopping Cart

**Customer dapat:**
- Tambah produk ke keranjang
- Update jumlah item di keranjang
- Hapus item dari keranjang
- Melihat total harga di keranjang
- Keranjang persisten (login session)

**Acceptance Criteria:**
- Cart disimpan di database (bukan hanya localStorage) agar tidak hilang saat login dari device lain
- Validasi stok saat item ditambahkan ke cart
- Notifikasi jika stok berubah sebelum checkout

---

### 3.4 Checkout

**Flow checkout:**
1. Review keranjang belanja
2. Pilih/tambah alamat pengiriman
3. Pilih metode pengiriman (estimasi ongkir)
4. Review ringkasan order + total harga
5. Pilih metode pembayaran → redirect ke Midtrans Snap
6. Konfirmasi pembayaran

**Acceptance Criteria:**
- Alamat pengiriman bisa disimpan multiple dan dipilih saat checkout
- Order dibuat dengan status `pending` sebelum pembayaran
- Jika pembayaran gagal/expired, stok dikembalikan

---

### 3.5 Payment (Midtrans Integration)

**Metode pembayaran yang didukung via Midtrans Snap:**
- QRIS (GoPay, OVO, DANA, LinkAja, ShopeePay)
- Virtual Account (BCA, BNI, BRI, Mandiri, Permata)
- Minimarket (Indomaret, Alfamart)
- Kartu Kredit/Debit

**Flow integrasi:**
1. Backend generate `snap_token` dari Midtrans API
2. Frontend load Midtrans Snap widget dengan token
3. User melakukan pembayaran di Snap popup
4. Midtrans kirim notifikasi ke backend via webhook (`/api/payment/notification`)
5. Backend update status order berdasarkan notifikasi

**Acceptance Criteria:**
- Webhook endpoint diverifikasi dengan signature key Midtrans
- Status order diupdate secara real-time
- Email konfirmasi dikirim setelah pembayaran berhasil
- Handle status: `success`, `pending`, `failed`, `expired`

---

### 3.6 Order Management

**Customer dapat:**
- Melihat riwayat order
- Melihat detail order (status, resi, item)
- Melakukan tracking pengiriman (via nomor resi)
- Membatalkan order (jika masih status `pending`)

**Admin dapat:**
- Melihat semua order masuk
- Update status order (processing → shipped → delivered)
- Input nomor resi pengiriman
- Filter order berdasarkan status, tanggal

**Order Status Flow:**
```
pending → paid → processing → shipped → delivered
                                              ↑
                             cancelled ←──────┘ (jika dibatalkan)
```

---

### 3.7 Review & Rating

**Customer dapat:**
- Memberikan rating (1–5 bintang) dan ulasan teks untuk produk yang sudah dibeli
- Edit atau hapus ulasan sendiri
- Melihat semua ulasan produk

**Admin dapat:**
- Moderasi ulasan (hapus jika melanggar)

**Acceptance Criteria:**
- Review hanya bisa dilakukan setelah order berstatus `delivered`
- Satu user hanya bisa review satu kali per produk
- Rating rata-rata ditampilkan di halaman produk

---

### 3.8 Admin Dashboard

- Overview statistik: total revenue, total order, total produk, total user
- Grafik penjualan (harian/bulanan)
- Manajemen produk (CRUD)
- Manajemen order
- Manajemen user (lihat, nonaktifkan akun)
- Export laporan order ke CSV

---

## 4. Database Schema (High-Level)

```
users           → id, name, email, password, role, phone, created_at
addresses       → id, user_id, label, street, city, province, postal_code
categories      → id, name, slug
products        → id, category_id, name, slug, description, price, stock, images, status
carts           → id, user_id
cart_items      → id, cart_id, product_id, quantity
orders          → id, user_id, address_id, total, status, payment_status, snap_token
order_items     → id, order_id, product_id, quantity, price
payments        → id, order_id, midtrans_order_id, method, status, paid_at
reviews         → id, user_id, product_id, rating, comment, created_at
```

---

## 5. API Endpoints (High-Level)

### Auth
| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| POST | `/api/auth/register` | Registrasi user |
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/logout` | Logout |
| GET | `/api/auth/me` | Get current user |

### Products
| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/api/products` | List produk (dengan filter & pagination) |
| GET | `/api/products/:id` | Detail produk |
| POST | `/api/products` | Tambah produk (admin) |
| PUT | `/api/products/:id` | Edit produk (admin) |
| DELETE | `/api/products/:id` | Hapus produk (admin) |

### Cart
| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/api/cart` | Get cart user |
| POST | `/api/cart/items` | Tambah item ke cart |
| PUT | `/api/cart/items/:id` | Update quantity |
| DELETE | `/api/cart/items/:id` | Hapus item dari cart |

### Orders
| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| POST | `/api/orders` | Buat order baru |
| GET | `/api/orders` | Riwayat order user |
| GET | `/api/orders/:id` | Detail order |
| PATCH | `/api/orders/:id/cancel` | Batalkan order |
| GET | `/api/admin/orders` | Semua order (admin) |
| PATCH | `/api/admin/orders/:id/status` | Update status order (admin) |

### Payment
| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| POST | `/api/payment/token` | Generate Midtrans snap token |
| POST | `/api/payment/notification` | Webhook dari Midtrans |

---

## 6. Non-Functional Requirements

| Kategori | Requirement |
|----------|-------------|
| **Performance** | Halaman produk load < 3 detik, API response < 500ms |
| **Security** | HTTPS, JWT auth, SQL injection prevention via ORM, XSS protection |
| **Scalability** | Database indexing pada kolom yang sering di-query (product name, category, status) |
| **Availability** | Uptime target 99.5% |
| **Mobile Responsive** | Semua halaman harus responsif di layar mobile (min 375px) |

---

## 7. Milestones & Prioritas

### Phase 1 — MVP (Core)
- [ ] Setup project (React + Express + MySQL)
- [ ] Auth (register, login, JWT)
- [ ] Product catalog (list, detail, search, filter)
- [ ] Shopping cart
- [ ] Checkout flow
- [ ] Midtrans Snap integration
- [ ] Basic order management

### Phase 2 — Enhancement
- [ ] Admin dashboard
- [ ] Review & rating
- [ ] Email notification
- [ ] Order tracking

### Phase 3 — Polish
- [ ] Export laporan CSV
- [ ] Optimasi performa (caching, indexing)
- [ ] Unit & integration testing

---

## 8. Out of Scope (v1.0)

- Multi-vendor / marketplace (satu seller saja)
- Fitur live chat / customer support
- Loyalty points / voucher sistem
- Mobile app (iOS/Android) — hanya web responsive
- Integrasi kurir otomatis (Rajaongkir bisa ditambahkan di v2)

---

*Dokumen ini akan diupdate seiring perkembangan project.*