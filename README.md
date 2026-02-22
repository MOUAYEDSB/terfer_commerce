update red# TerFer Commerce - Multi-Vendor E-Commerce Platform

A modern, full-featured e-commerce platform built with React and Node.js that enables multiple sellers to manage their online stores with complete admin oversight and 20% platform commission system.

## 🚀 Features

### Customer Features
- **Browse Products**: Explore products from multiple sellers
- **Shopping Cart**: Add/remove items with real-time updates
- **Checkout**: Secure order placement with detailed invoice
- **Order Tracking**: View order status and details
- **Wishlist**: Save favorite products
- **Multi-language Support**: English, Arabic, and French
- **Responsive Design**: Works on desktop, tablet, and mobile

### Seller Features
- **Seller Dashboard**: Complete store management interface
- **Product Management**: Add, edit, delete products with images and variants
- **Order Management**: View and manage customer orders
- **Analytics**: Track sales, revenue, and performance metrics
- **Shop Settings**: Configure shop information and details
- **Real-time Earnings**: Monitor platform commission deductions

### Admin Features
- **Admin Dashboard**: 6 KPI cards showing platform metrics
- **User Management**: Create, view, edit, and delete customers
- **Seller Management**: Create, activate, suspend seller accounts
- **Product Management**: View and remove products
- **Order Management**: View all platform orders with filters
- **Earnings Dashboard**: Track platform commission earnings
- **Financial Insights**: Breakdown of platform vs seller earnings

### Platform Features
- **20% Commission System**: Automatic commission calculation on all products
- **Dynamic Pricing**: Base price + 20% commission shown to customers
- **Role-Based Access Control**: Customer, Seller, Admin roles
- **JWT Authentication**: Secure token-based authentication
- **File Upload**: Multer integration for product images
- **Database**: MongoDB with Mongoose ODM
- **API Documentation**: OpenAPI/Swagger documentation included

## 📋 Tech Stack

### Frontend
- **React 18**: UI library
- **React Router**: Client-side routing
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Icon library
- **React Hot Toast**: Toast notifications
- **i18next**: Internationalization (i18n)
- **Vite**: Build tool and dev server

### Backend
- **Node.js**: JavaScript runtime
- **Express.js**: Web framework
- **MongoDB**: NoSQL database
- **Mongoose**: ODM for MongoDB
- **JWT**: Authentication tokens
- **Multer**: File upload middleware
- **Dotenv**: Environment variable management
- **Swagger/OpenAPI**: API documentation

### Development Tools
- **ESLint**: Code quality
- **PostCSS**: CSS processing
- **npm**: Package manager

## 📁 Project Structure

```
terfer_commerce/
├── frontend/                    # React application
│   ├── src/
│   │   ├── pages/              # Page components
│   │   │   ├── HomePage.jsx
│   │   │   ├── ProductPage.jsx
│   │   │   ├── CartPage.jsx
│   │   │   ├── CheckoutPage.jsx
│   │   │   ├── LoginPage.jsx
│   │   │   ├── AdminDashboardPage.jsx
│   │   │   ├── SellerDashboardPage.jsx
│   │   │   ├── ProfilePage.jsx
│   │   │   └── ...
│   │   ├── components/         # Reusable components
│   │   │   ├── Navbar.jsx
│   │   │   ├── Footer.jsx
│   │   │   ├── AdminLayout.jsx
│   │   │   ├── SellerLayout.jsx
│   │   │   └── ...
│   │   ├── context/            # React Context (Auth, Cart, Wishlist)
│   │   ├── constants/          # Constants and utilities
│   │   ├── App.jsx             # Main app component
│   │   └── main.jsx            # Entry point
│   ├── public/
│   │   └── locales/            # i18n translation files
│   ├── package.json
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   └── vite.config.js
│
├── backend/                     # Node.js/Express API
│   ├── src/
│   │   ├── controllers/        # API logic
│   │   │   ├── authController.js
│   │   │   ├── productController.js
│   │   │   ├── orderController.js
│   │   │   ├── userController.js
│   │   │   └── adminController.js
│   │   ├── models/             # Mongoose schemas
│   │   │   ├── User.js         # Customer/Seller/Admin
│   │   │   ├── Product.js      # Product with variants
│   │   │   └── Order.js        # Order with items
│   │   ├── routes/             # Express routes
│   │   ├── middleware/         # Auth & error handling
│   │   ├── config/             # Database & services
│   │   ├── app.js              # Express app setup
│   │   ├── server.js           # Server entry point
│   │   └── seeder.js           # Database seeding
│   ├── uploads/                # Uploaded product images
│   ├── package.json
│   ├── .env                    # Environment variables
│   └── openapi.json            # API documentation
│
└── README.md                    # This file
```

## ⚙️ Installation

### Prerequisites
- Node.js (v14+)
- npm or yarn
- MongoDB (local or Atlas)

### Clone Repository
```bash
git clone <repository-url>
cd terfer_commerce
```

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file with these variables:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/terfer_commerce
# OR for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/terfer_commerce

JWT_SECRET=your_jwt_secret_key_here_min_32_chars
NODE_ENV=development
```

4. Start the server:
```bash
npm start
```

Server runs on `http://localhost:5000`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start development server:
```bash
npm run dev
```

Frontend runs on `http://localhost:5173`

## 🔐 Authentication & Roles

### Users Roles
- **Customer**: Regular user who can browse and purchase products
- **Seller**: User who can manage products and orders
- **Admin**: Super admin who manages entire platform

### Default Admin Account
- **Email**: `adminterfer@gmail.com`
- **Password**: `adminterfer123`

### Creating Admin Account
```bash
cd backend
node src/createAdmin.js
```

## 💰 Commission System

The platform operates on a **20% commission model**:

- **Base Price**: Price set by seller
- **Customer sees**: Base Price × 1.20 (added 20% platform commission)
- **Seller receives**: 80% of base price
- **Platform earns**: 20% of base price

**Example:**
- Seller sets product price: 100 TND
- Customer sees: 120 TND (100 + 20% commission)
- Order in cart: 120 TND
- After sale: Seller earns 80 TND, Platform earns 20 TND

## 📊 Database Models

### User Schema
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  phone: String,
  role: String (customer|seller|admin),
  isActive: Boolean,
  isVerifiedSeller: Boolean,
  shopName: String,
  shopDescription: String,
  createdAt: Date
}
```

### Product Schema
```javascript
{
  name: String,
  description: String,
  price: Number,
  finalPrice: Number (virtual: price × 1.20),
  wholesalePrice: Number,
  oldPrice: Number,
  platformCommissionRate: Number (default: 20),
  stock: Number,
  images: [String],
  seller: ObjectId (reference to User),
  colors: [String],
  sizes: [String],
  variants: [{
    color: String,
    size: String,
    quantity: Number
  }],
  createdAt: Date
}
```

### Order Schema
```javascript
{
  orderNumber: String,
  customer: ObjectId (reference to User),
  items: [{
    product: ObjectId,
    quantity: Number,
    price: Number,
    sellerPrice: Number (base price on order),
    platformCommission: Number
  }],
  subtotal: Number,
  shippingCost: Number,
  total: Number,
  status: String (pending|confirmed|shipped|delivered|cancelled),
  shippingAddress: Object,
  createdAt: Date
}
```

## 🔗 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get logged-in user profile

### Products
- `GET /api/products` - Get all products (paginated)
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create product (seller)
- `PUT /api/products/:id` - Update product (seller)
- `DELETE /api/products/:id` - Delete product (seller)

### Orders
- `POST /api/orders` - Create order
- `GET /api/orders` - Get user orders
- `GET /api/orders/:id` - Get order details

### Admin
- `GET /api/admin/stats` - Get platform statistics
- `GET /api/admin/users` - Get all users
- `POST /api/admin/sellers/create` - Create seller account
- `POST /api/admin/customers/create` - Create customer account
- `GET /api/admin/sellers` - Get sellers stats
- `GET /api/admin/products` - Get all products
- `GET /api/admin/orders` - Get all orders
- `GET /api/admin/earnings` - Get earnings data

## 🌐 Localization

The platform supports three languages:
- **English (en)**
- **Arabic (ar)**
- **French (fr)**

Translation files are stored in `frontend/public/locales/`

## 🚀 Deployment

### Backend Deployment (Heroku/Railway)
1. Push to Git repository
2. Connect to deployment platform
3. Set environment variables
4. Deploy

### Frontend Deployment (Vercel/Netlify)
1. Build: `npm run build`
2. Deploy `dist` folder
3. Set API URL in environment

## 📖 Usage Examples

### Register as Seller
1. Click "Devenir Vendeur" on registration
2. Fill seller information and shop details
3. Admin approves account
4. Start adding products

### Create Product (Seller)
1. Go to Seller Dashboard
2. Click "Ajouter un Produit"
3. Fill product details (name, price, images, variants)
4. Save - product appears with 20% commission added

### Manage Orders (Admin)
1. Go to Admin Dashboard
2. Navigate to "Commandes"
3. Filter by status or seller
4. View order details and earnings breakdown

## 🛠️ Development

### Run Backend in Development
```bash
cd backend
npm start
```

### Run Frontend in Development
```bash
cd frontend
npm run dev
```

### Build Frontend for Production
```bash
cd frontend
npm run build
```

## 🐛 Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB is running locally or check Atlas connection string
- Verify network access for Atlas in IP whitelist

### Port Already in Use
- Backend: Change PORT in `.env`
- Frontend: Vite will use next available port

### Images Not Loading
- Check `uploads/` folder in backend exists
- Verify file paths in product images array

## 📝 Environment Variables

### Backend (.env)
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/terfer_commerce
JWT_SECRET=your_secret_key_minimum_32_characters_long
NODE_ENV=development
```

### Frontend (if needed)
Set API URL in component or environment file:
```javascript
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
```

## 📄 License

This project is proprietary and confidential.

## 👥 Support

For issues or questions, contact development team.

## 🎯 Roadmap

- [ ] Payment gateway integration (Stripe/Paypal)
- [ ] Email notifications
- [ ] SMS notifications
- [ ] Advanced analytics
- [ ] Seller verification system
- [ ] Review and rating system enhancements
- [ ] Mobile app (React Native)
- [ ] Real-time notifications (Socket.io)

---

**Built with ❤️ for TerFer Commerce**