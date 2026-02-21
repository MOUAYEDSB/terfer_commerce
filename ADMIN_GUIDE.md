# Super Admin Panel

## Credentials
- **Email**: adminterfer@gmail.com
- **Password**: adminterfer123

## Access
Login at `/login` with the admin credentials. You will be automatically redirected to the admin dashboard.

## Admin Features

### 1. Dashboard (`/admin/dashboard`)
- Total users, sellers, customers, products, orders
- Total revenue
- Top 5 sellers by sales
- Recent orders

### 2. Users Management (`/admin/users`)
- View all users (customers and sellers)
- Filter by role (customer/seller)
- Search by name, email, or shop name
- View user details including:
  - Profile information
  - Orders history
  - Products (for sellers)
- Activate/deactivate users
- Delete users (except admins)

### 3. Sellers Management (`/admin/sellers`)
- View all sellers and their shops
- Statistics per seller:
  - Number of products
  - Number of orders
  - Total sales
- View seller details including:
  - Shop information
  - Products list
  - Orders history
- Activate/suspend sellers

### 4. Products Management (`/admin/products`)
- View all products from all sellers
- Filter by seller/shop
- Search products by name
- Delete products
- Pagination support

### 5. Orders Management (`/admin/orders`)
- View all orders from the platform
- Filter by:
  - Status (pending, confirmed, shipped, delivered, cancelled)
  - Seller/shop
- View order details including:
  - Customer information
  - Items breakdown
  - Delivery address
  - Order status and timeline

## Backend API Endpoints

All admin endpoints require authentication and admin role:

### Stats
- `GET /api/admin/stats` - Get dashboard statistics

### Users
- `GET /api/admin/users` - Get all users (with filters)
- `GET /api/admin/users/:id` - Get user details
- `PUT /api/admin/users/:id` - Update user
- `DELETE /api/admin/users/:id` - Delete user

### Products
- `GET /api/admin/products` - Get all products (with filters)
- `DELETE /api/admin/products/:id` - Delete product

### Orders
- `GET /api/admin/orders` - Get all orders (with filters)

### Sellers
- `GET /api/admin/sellers` - Get sellers with statistics

## Creating Admin Accounts

To create additional admin accounts, run:

```bash
cd backend
node src/createAdmin.js
```

Or modify the script with different credentials before running.

## Security Notes

- Only users with `role: 'admin'` can access admin routes
- Admin accounts cannot be deleted through the admin panel
- All admin actions are protected by JWT authentication
- Passwords are hashed using bcrypt before storage
