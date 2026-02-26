# 📱 TerFer Commerce - Documentation Complète

**Plateforme E-Commerce Multi-Vendeurs | Marketplace Tunisienne**  
*Documentation Générale - Vue d'ensemble, Fonctionnalités & Améliorations*

---

## 📑 Table des Matières

1. [Vue d'ensemble générale](#vue-densemble-générale)
2. [Architecture et Stack Technologique](#architecture-et-stack-technologique)
3. [Fonctionnalités par Rôle Utilisateur](#fonctionnalités-par-rôle-utilisateur)
4. [Système de Commission](#système-de-commission)
5. [Points à Améliorer](#points-à-améliorer)
6. [Roadmap Future](#roadmap-future)

---

## 🎯 Vue d'ensemble Générale

### Qu'est-ce que TerFer Commerce?

**TerFer Commerce** est une plateforme e-commerce moderne permettant à plusieurs vendeurs de gérer leurs boutiques en ligne avec un contrôle administratif complet. Le système fonctionne sur un modèle de commission de **20%** où la plateforme prélève 20% de chaque vente.

### Objectif Principal
Créer un écosystème commercial sécurisé et efficace où:
- Les **clients** peuvent acheter auprès de plusieurs vendeurs
- Les **vendeurs** gèrent leurs boutiques et voient leurs gains
- L'**admin** supervise tout et gère les commissions

### Chiffres Clés
- ✅ Support de **3 langues** (EN, FR, AR)
- ✅ **20% de commission** automatique par vente
- ✅ Système de **rôles** (Admin, Seller, Customer)
- ✅ **10+ catégories** de produits disponibles
- ✅ Interface **responsive** (mobile, tablet, desktop)

---

## 🛠️ Architecture et Stack Technologique

### Frontend (React 18 + Vite + TailwindCSS)
```
Framework:          React 18
Build Tool:         Vite 3.x (HMR enabled)
Styling:            Tailwind CSS 3.x + PostCSS
Router:             React Router DOM v6
State Management:   React Context API (3 contexts):
                    - AuthContext: user, token, login/logout
                    - CartContext: items[], addToCart, removeFromCart
                    - WishlistContext: wishlist[], toggle
Internationalization: i18next (EN, FR, AR)
Notifications:      React Hot Toast
Icons:              Lucide React
UI Icons:           Lucide Icons
HTTP Client:        Fetch API (native)
Form Validation:    Manual validation + Regex patterns
Storage:            localStorage (token, user, cart, wishlist)
CSS Framework:      Tailwind CSS responsive grid + flexbox

Pages Structure (25+ pages):
├── Public Pages:
│   ├── HomePage.jsx
│   ├── ProductPage.jsx
│   ├── ShopPage.jsx
│   ├── SellerPage.jsx
│   ├── LoginPage.jsx
│   ├── RegisterPage.jsx
├── Customer Pages:
│   ├── CartPage.jsx
│   ├── CheckoutPage.jsx
│   ├── ProfilePage.jsx
│   ├── OrderDetailPage.jsx
│   ├── InvoicePage.jsx
├── Seller Pages:
│   ├── SellerDashboardPage.jsx
│   ├── SellerProductsPage.jsx
│   ├── SellerOrdersPage.jsx
│   ├── SellerAnalyticsPage.jsx
│   ├── SellerSettingsPage.jsx
│   ├── AddProductPage.jsx
├── Admin Pages:
│   ├── AdminDashboardPage.jsx
│   ├── AdminUsersPage.jsx
│   ├── AdminSellersPage.jsx
│   ├── AdminProductsPage.jsx
│   ├── AdminOrdersPage.jsx
│   ├── AdminEarningsPage.jsx
│   ├── AdminCreateCustomerPage.jsx
│   ├── AdminCreateSellerPage.jsx

Translation Files (i18next):
├── public/locales/en/translation.json
├── public/locales/fr/translation.json
├── public/locales/ar/translation.json
```

### Backend (Node.js + Express 5.x + MongoDB)
```
Runtime:            Node.js v14+
Framework:          Express.js 5.x (async-await compatible)
Database:           MongoDB 5.x + Mongoose 9.x ODM
Authentication:     JWT (jsonwebtoken) - Bearer tokens in header
Password Hashing:   bcryptjs 3.x (salt rounds: 10)
File Upload:        Multer 2.x (destination: /backend/uploads)
API Documentation:  Swagger/OpenAPI 6.2.8 (/api/docs)
Logging:            Morgan 1.10 (dev mode logging)
Security Headers:   Helmet 8.x
CORS:               cors 2.8.6 (currently permissive)
Error Handling:     express-async-handler 1.2
Env Variables:      dotenv 17.x (.env file)

Database Models (3):
├── User
│   ├── Personal: name, email, password (hashed), phone, avatar
│   ├── Authentication: role (enum: customer/seller/admin), isActive
│   ├── Seller Fields: shopName, shopDescription, shopLogo, isVerifiedSeller
│   ├── Relations: addresses[], wishlist[] (Product refs)
│   ├── Indexes: email (unique), _id
│   └── Timestamps: createdAt, updatedAt
├── Product
│   ├── Basic: name, description, price, brand
│   ├── Commerce: stock, category (enum: 10 categories), rating, numReviews
│   ├── Images: images[] (URLs or paths)
│   ├── Commission: platformCommissionRate (default: 20)
│   ├── Pricing: oldPrice (strikethrough), wholesalePrice
│   ├── Variants: colors[], sizes[], variants[] (color+size+qty)
│   ├── Relations: seller (User ref), shop (string)
│   ├── Indexes: seller, category
│   └── Timestamps: createdAt, updatedAt
├── Order
│   ├── Identification: user (ref), orderNumber (unique), timestamps
│   ├── Items: items[] array:
│   │   ├── product (ref), name, quantity, price
│   │   ├── sellerPrice, platformCommission
│   │   ├── image, seller (ref), shop
│   ├── Shipping: shippingAddress (fullName, phone, address, city, postalCode)
│   ├── Payment: paymentMethod (COD/Card/PayPal), paymentStatus
│   ├── Pricing: subtotal, shippingCost (7 DT default), total
│   ├── Status: orderStatus (pending→confirmed→processing→shipped→delivered)
│   ├── Calculations: automatic via controller
│   └── Timestamps: createdAt, updatedAt

API Routes Structure:
├── /api/users
│   ├── POST /register - Create account (customer/seller)
│   ├── POST /login - Authenticate + JWT token
│   ├── GET /profile - Get logged-in user (protected)
│   ├── PUT /profile - Update profile (protected)
│   ├── POST /addresses - Add address (protected)
│   ├── PUT /addresses/:id - Update address (protected)
│   ├── DELETE /addresses/:id - Delete address (protected)
│   ├── POST /wishlist/:productId - Toggle wishlist (protected)
│   └── GET /seller/:id - Get seller public info
├── /api/products
│   ├── GET / - Get all products (with filters: category, search, price, sort, page)
│   ├── GET /:id - Get product detail
│   ├── GET /category/:cat - Get products by category
│   ├── POST / - Create product (protected, seller/admin)
│   ├── PUT /:id - Update product (protected, seller owner)
│   ├── DELETE /:id - Delete product (protected, seller owner)
│   └── POST /:id/reviews - Add review (protected, customer)
├── /api/orders
│   ├── POST / - Create order (protected, customer)
│   ├── GET /myorders - Get user's orders (protected, customer)
│   ├── GET /seller/myorders - Get seller's orders (protected, seller)
│   ├── GET /:id - Get order detail (protected)
│   ├── GET /number/:orderNumber - Get order by number (protected)
│   ├── PUT /:id/status - Update order status (protected, seller)
│   ├── PUT /:id/cancel - Cancel order (protected, customer/seller)
│   └── GET / - Get all orders (protected, admin)
├── /api/upload
│   └── POST / - Upload product image (protected, seller) - Multer
├── /api/admin
│   ├── GET /stats - Dashboard KPIs (protected, admin)
│   ├── GET /users - List users (protected, admin)
│   ├── GET /users/:id - Get user detail (protected, admin)
│   ├── PUT /users/:id - Update user (protected, admin)
│   ├── DELETE /users/:id - Delete user (protected, admin)
│   ├── GET /products - List all products (protected, admin)
│   ├── DELETE /products/:id - Delete product (protected, admin)
│   ├── GET /orders - List all orders (protected, admin)
│   └── GET /sellers - List sellers with stats (protected, admin)

Middleware Chain:
1. express.json() - Parse JSON body
2. express.urlencoded() - Parse URL-encoded body
3. cors() - CORS headers (currently ALL origins)
4. helmet() - Security headers
5. morgan('dev') - Request logging
6. Routes
7. errorHandler - Centralized error handling
8. notFound (404) handler

Authentication Flow:
1. Login: POST /api/users/login
   → Validate email/password
   → Generate JWT token
   → Return user + token
2. Frontend: Save token to localStorage
3. Protected Requests: Include 'Authorization: Bearer {token}' header
4. Backend: protect middleware verifies token
   → Decode JWT
   → Check user exists + isActive
   → Attach req.user
5. Role Checks: admin/seller middleware verify req.user.role
```

### Déploiement & Environnement
```
Frontend:
  Dev Server:   Vite (npm run dev)
  Port:         5173 ou 5174 (auto-increment if taken)
  Hot Reload:   Yes (HMR configured)
  Build:        npm run build → dist/ folder
  Preview:      npm run preview

Backend:
  Dev Server:   nodemon (npm run dev)
  Port:         5000 (hardcoded)
  Auto-restart: Yes (watches .js changes)
  Production:   node src/server.js (npm start)
  API Docs:     http://localhost:5000/api/docs (Swagger UI)
  Health:       GET http://localhost:5000/ (version check)

Database:
  Local:        mongodb://localhost:27017/terfer
  Atlas:        mongodb+srv://username:password@cluster.mongodb.net/terfer
  Collections:  users, products, orders
  Indexes:      email (unique on users), orderNumber (unique on orders)
  Backup:       Manual (TODO: automated backups)

File Storage:
  Location:     /backend/uploads/ (NOT in .gitignore - SECURITY ISSUE)
  Product Imgs: /backend/uploads/product-images/ (via Multer)
  Max Size:     ~10MB per file (TODO: validate)
  Format:       MIME types not validated (SECURITY ISSUE)
  Cloud:        None yet (TODO: AWS S3 or Cloudinary)

Environment Variables (.env):
  PORT=5000
  MONGO_URI=mongodb://localhost:27017/terfer
  JWT_SECRET=your_super_secret_key_here
  NODE_ENV=development
  FRONTEND_URL=http://localhost:5173 (TODO: use for CORS)
```

---

## 👥 Fonctionnalités par Rôle Utilisateur

### 1️⃣ CLIENT / CUSTOMER

#### Authentification
- ✅ **Inscription**: POST /api/users/register
  - Email validation (regex pattern)
  - Password minlength: 6 (⚠️ TROP FAIBLE - should be 8)
  - Auto hash password avec bcryptjs
  - Default role: 'customer'
  - No email verification (À ajouter)

- ✅ **Connexion**: POST /api/users/login
  - Email + password validation
  - bcrypt password comparison
  - JWT token generation (process.env.JWT_SECRET)
  - Token returned to frontend (stored in localStorage)
  - Response: { _id, name, email, role, token }

- ❌ **Password Reset**: NOT IMPLEMENTED
  - À créer: /forgot-password endpoint
  - À créer: /reset-password endpoint
  - À créer: Reset token model

- ✅ **Logout**: Frontend only 
  - Remove localStorage.token
  - Remove localStorage.user
  - Redirect to home

#### Navigation & Recherche - GET /api/products
- ✅ **Parcourir**: GET /api/products - Liste tous produits
  - Default retourne 12 produits par page (limit: 12)
  - Mongoose populate: seller info inclus
  - Response: { products[], total, page, pages }

- ✅ **Filtrer Catégorie**: ?category=Mode
  - 10 catégories: Mode, High-Tech, Maison, Beauté, Bijoux, Sport, Enfants, Auto, Animaux, Accessoires
  - Enum validation en Product model
  - Case-sensitive

- ✅ **Recherche**: ?search=terme
  - Regex search sur name et description
  - Case-insensitive
  - Example: ?search=t-shirt → matches "T-Shirt Vintage"

- ✅ **Filtrer Prix**: ?minPrice=50&maxPrice=200
  - MongoDB query: { price: { $gte: minPrice, $lte: maxPrice } }
  - Float values accepted

- ✅ **Trier**: ?sort=price_asc|price_desc|rating
  - price_asc: sort: { price: 1 }
  - price_desc: sort: { price: -1 }
  - rating: sort: { rating: -1 }
  - Default: no sort (insertion order)

- ✅ **Pagination**: ?page=2&limit=20
  - page: 1-based (page 1 = first 12)
  - limit: items per page (default 12)
  - Calculation: skip = (page - 1) * limit

- ✅ **Détails Vendeur**: Inclus dans chaque product
  - seller (Object): _id, name, shopName, shopLogo
  - shop (String): seller shop name

#### Gestion du Panier (CartContext - Frontend localStorage)
- ✅ **Ajouter Produit**: CartContext.addToCart(product, quantity)
  - Check si déjà dans panier → incrémenter qty
  - Sinon: ajouter nouvel item
  - Structure item: { product: {...}, quantity, price, seller, shop, image }
  - Auto-calcule: itemTotal = price * quantity (SANS commission)

- ✅ **Supprimer Produit**: CartContext.removeFromCart(productId)
  - Filter out du cart items array
  - Re-calculate totals

- ✅ **Modifier Quantité**: Update quantity et re-calculate
  - UI: +/- buttons in CartPage.jsx
  - Check stock disponible (frontend) ⚠️ NOT VALIDATED BACKEND

- ✅ **Prix Final avec Commission**:
  - Product price = price base (de la DB)
  - Commission = price * 0.20 (20% hardcoded)
  - Prix client = price + commission = price * 1.2
  - Formule: totalPrice = sum(item.price * item.qty * 1.2) + shippingCost (7 DT)
  - Affichage: Breakdown en checkbox items + Total

- ✅ **Sauvegarde Locale**: 
  - Panier en CartContext state (React)
  - Pas synchronisé backend (localStorage only)
  - Persiste chargement page (localStorage)
  - localStorage key: 'cart' (TODO: verification)

- ✅ **Affichage Total en Temps Réel**:
  - CartContext calcule: subtotal, commission, shippingCost, total
  - Mis à jour chaque action (add/remove/qty change)
  - Affichage CartPage.jsx: breakdown détaillé

#### Wishlist (WishlistContext - Frontend)
- ✅ **Ajouter/Retirer**: POST /api/users/wishlist/:productId (toggle)
  - WishlistContext state: wishlist[] array de product IDs
  - Frontend toggle: if productId in wishlist → remove else add
  - Persiste localStorage (WishlistContext)
  - Visual: Heart icon filled/unfilled

- ✅ **Affichage**: Wishlist page avec tous les favoris
  - Fetch full product details pour chaque ID
  - Afficher prix avec commission
  - Bouton "Add to Cart"
  - Pas de partage ou sync multi-device (TODO)

- ✅ **Visibilité Prix**: Affiche prix + commission (comme panier)

#### Commandes (Order Model + orderController)
- ✅ **Créer Commande**: POST /api/orders (protected, customer)
  - Input: { items[], shippingAddress, paymentMethod }
  - Validation: stock NOT checked ⚠️ BUG
  - Auto-generate orderNumber: Unique ID pattern
  - Calcul automatique:
    ```
    subtotal = SUM(item.price * item.quantity)
    platformCommission = SUM(item.price * item.quantity * 0.20)
    shippingCost = 7 DT (hardcoded)
    total = subtotal + platformCommission + shippingCost
    Note: Commission IN subtotal (not additive) ⚠️ Logic issue
    ```
  - Store items avec: product, quantity, price, sellerPrice, platformCommission, seller, shop
  - Status initial: 'pending'
  - Response: Order created
  - ⚠️ ISSUE: Product stock NEVER decremented ← CRITICAL BUG

- ✅ **Voir Mes Commandes**: GET /api/orders/myorders (protected, customer)
  - Return all orders where user = req.user._id
  - Populate: user, items.product, items.seller
  - Sort: createdAt descending
  - Response: orders[]

- ✅ **Adresses de Livraison**: User.addresses[] (sous-document)
  - Fields: fullName, phone, address, city, postalCode, country, isDefault
  - POST /api/users/addresses - add new
  - PUT /api/users/addresses/:addressId - update
  - DELETE /api/users/addresses/:addressId - remove
  - Default: First address marked isDefault: true

- ✅ **Paiement**: paymentMethod enum [COD, Card, PayPal]
  - Actuellement: COD only implémenté
  - Card & PayPal: Dans enum mais pas de logic (TODO)
  - paymentStatus: 'pending' initial (TODO: auto-paid on webhook)

- ✅ **Consulter Historique**: User Profile page
  - GET /api/orders/myorders
  - Affiche liste détaillée avec statuts
  - Filtrable par date, status

- ✅ **Détails Commande**: GET /api/orders/:id
  - Full order avec items détaillés
  - Seller info, product info, pricing breakdown
  - Shipping address
  - Status timeline (TODO: statusHistory array)

- ✅ **PDF Invoice**: GET /api/orders/:orderId/invoice
  - Généré dynamiquement ou JSPdf
  - Contient: orderNumber, items, totals, shipping address
  - Vendeur + platform + customer info

- ✅ **Suivre Statut**: Order.orderStatus field
  - Statuts: pending → confirmed → processing → shipped → delivered
  - Annulation possible (status = 'cancelled')
  - Timeline avec timestamps pour chaque transition
  - Pas de tracking number (TODO: Aramex/TunisiePost integration)

- ✅ **Vendeur Update Statut**: PUT /api/orders/:id/status (protected, seller)
  - Seller peut passer order de pending → confirmed → processing → shipped
  - Limit: Seller peut only update propres orders
  - Input: { status, note }
  - Customer notified of status change (TODO: email)
  - Response: Updated order

- ⚠️ **ISSUE**: Multi-vendor orders
  - Si client achete de vendeur A + B = 1 seule commande
  - Items array mixte [itemsA, itemsB]
  - Vendeur A voit commande entière (peut voir itemsB) - SECURITY ISSUE
  - TODO: Separer en sub-orders par vendor

#### Profil
- ✅ **Voir Profil**: GET /api/users/profile
  - Name, email, phone, avatar, role
  - Addresses[], wishlist[]
  - Para sellers: shopName, shopDescription, shopLogo, isVerifiedSeller

- ✅ **Modifier Info**: PUT /api/users/profile
  - Fields: name, email, phone, avatar
  - Validation: email unique (sauf current user)
  - Response: Updated user object

- ✅ **Gérer Adresses**: CRUD operations
  - Add, edit, delete addresses
  - Max addresses: no limit
  - Mark one as default

- ✅ **Voir Commandes**: Via order history page
  - Link to OrderDetailPage
  - Filtrable, sortable par date/status

#### Multilingue
- ✅ Changer langue (EN, FR, AR)
- ✅ Interface complètement traduite

#### Avis & Évaluations
- ✅ Laisser avis sur produits (Rating + Commentaire)
- ✅ Voir avis d'autres clients

---

### 2️⃣ VENDEUR / SELLER

#### Authentification & Setup
- ✅ Inscription comme vendeur
- ✅ Connexion sécurisée
- ✅ Activation par admin (rôle: "seller")
- ✅ Profil vendeur avec nom boutique

#### Tableau de Bord (Dashboard)
- ✅ Statistiques clés:
  - Nombre total de produits
  - Nombre total de commandes
  - Ventes totales (brutes)
  - Graphiques de tendances
- ✅ Vue d'ensemble des performances

#### Gestion des Produits
- ✅ Créer produit avec:
  - Nom, description, prix
  - Images (avec upload)
  - Catégorie
  - Brand
  - Stock
- ✅ Éditer produits existants
- ✅ Supprimer produits
- ✅ Lister tous ses produits
- ✅ Voir nombre de ventes par produit

#### Gestion des Commandes
- ✅ Voir toutes ses commandes
- ✅ Filtrer par statut
- ✅ Voir détails client
- ✅ Voir détails produits commandés
- ✅ Mettre à jour statut commande:
  - pending → confirmed → processing → shipped → delivered
  - Possibilité d'annulation
- ✅ Ajouter notes sur commandes

#### Gestion des Revenus
- ✅ Voir revenus bruts par vente
- ✅ Voir déduction commission 20%
- ✅ Voir revenus nets (80% du prix)
- ✅ Historique des gainnings

#### Paramètres Boutique
- ✅ Modifier nom de la boutique
- ✅ Modifier description
- ✅ Modifier avatar/logo
- ✅ Voir statistiques boutique

---

### 3️⃣ ADMINISTRATEUR / ADMIN

#### Authentification
- ✅ Compte admin précréé
- ✅ Accès super-utilisateur
- ✅ Token JWT sécurisé
- ✅ Impossible à supprimer via panel admin

#### Tableau de Bord Principal
- ✅ 6 KPI cards:
  - Nombre total d'utilisateurs
  - Nombre de vendeurs
  - Nombre de clients/achéteurs
  - Nombre de produits
  - Nombre de commandes
  - Revenus totaux (commission 20%)
- ✅ Top 5 vendeurs par ventes
- ✅ Commandes récentes
- ✅ Graphiques de tendances

#### Gestion des Utilisateurs (Clients)
- ✅ Lister tous les utilisateurs
- ✅ Filtrer par rôle (customer/seller)
- ✅ Rechercher par nom/email/shop name
- ✅ Voir détails utilisateur:
  - Infos personnelles
  - Historique commandes
  - Nombre d'achats
  - Montant dépensé
- ✅ Créer client manuellement
- ✅ Activer/désactiver client
- ✅ Supprimer client (sauf admins)
- ✅ Éditer infos client

#### Gestion des Vendeurs
- ✅ Lister tous les vendeurs
- ✅ Voir statistiques par vendeur:
  - Nombre de produits
  - Nombre de commandes
  - Ventes totales
  - Commission générée
- ✅ Voir détails vendeur:
  - Infos boutique
  - Liste des produits
  - Historique commandes
- ✅ Créer vendeur manuellement
- ✅ Activer/suspendre vendeur
- ✅ Voir revenus générés par vendeur

#### Gestion des Produits
- ✅ Lister tous les produits (toutes boutiques)
- ✅ Filtrer par vendeur/boutique
- ✅ Rechercher par nom
- ✅ Voir détails produit
- ✅ Supprimer produit (si problématique)
- ✅ Pagination support

#### Gestion des Commandes
- ✅ Lister toutes les commandes
- ✅ Filtrer par statut:
  - pending, confirmed, processing, shipped, delivered, cancelled
- ✅ Filtrer par vendeur
- ✅ Voir détails commande:
  - Infos client
  - Détails produits
  - Adresse de livraison
  - Timeline du statut
- ✅ Historique complet

#### Dashboard des Gains
- ✅ Revenus totaux de la plateforme
- ✅ Décomposition des revenus:
  - Commission collectée
  - Par vendeur
  - Par produit
- ✅ Graphiques financiers
- ✅ Rapports de ventes

#### Sécurité & Contrôle
- ✅ Seul les admins accèdent au panel admin
- ✅ Vérification du rôle sur chaque requête
- ✅ Tokens JWT avec expiration
- ✅ Protection des routes sensibles

---

## � Bugs Critiques à Fixer (Code Issues)

### 1️⃣ **Stock Management = ZERO** 🔴 URGENT
**Fichier**: `backend/src/controllers/orderController.js`
```javascript
// PROBLEM: Product stock NEVER updated after order
async function createOrder(req, res) {
  // ... order creation code ...
  const order = await Order.create(orderData);
  // ❌ MISSING: Product stock decrement
  // Should have:
  // for (let item of order.items) {
  //   await Product.findByIdAndUpdate(item.product._id, {
  //     $inc: { stock: -item.quantity }
  //   });
  // }
  res.json(order);
}
```
**Impact**: 
- Overselling possible (order 10 units when only 5 in stock)
- Inventory never synced with reality
- Backend thinks unlimited stock

**Fix**:
```javascript
// After order created
for (let item of order.items) {
  await Product.findByIdAndUpdate(
    item.product._id,
    { $inc: { stock: -item.quantity } },
    { new: true }
  );
}
```

### 2️⃣ **No Stock Validation** 🔴 URGENT
**Fichier**: `backend/src/controllers/orderController.js`
```javascript
// PROBLEM: No check if stock available before creating order
async function createOrder(req, res) {
  // ❌ Missing validation:
  // for (let item of items) {
  //   const product = await Product.findById(item.product);
  //   if (product.stock < item.quantity) {
  //     throw new Error(`Not enough stock for ${product.name}`);
  //   }
  // }
}
```
**Impact**: Client can order out-of-stock items, then order fails

**Fix**:
```javascript
// Validate stock BEFORE creating order
for (let item of orderItems) {
  const product = await Product.findById(item.product);
  if (!product || product.stock < item.quantity) {
    res.status(400);
    throw new Error(`${product.name}: Only ${product.stock} in stock`);
  }
}
```

### 3️⃣ **Password Too Weak** 🔴 URGENT
**Fichier**: `backend/src/models/User.js`
```javascript
// CURRENT (BAD):
password: {
  type: String,
  required: [true, 'Password is required'],
  minlength: 6,  // ❌ WAY TOO LOW!
  select: false
}

// SHOULD BE:
password: {
  type: String,
  required: [true, 'Password is required'],
  minlength: [8, 'Password must be at least 8 characters'],
  validate: {
    validator: function(v) {
      return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(v);
    },
    message: 'Password must contain uppercase, lowercase, number, and special character'
  },
  select: false
}
```
**Impact**: Easy password cracking (admin@1, test123, abc12345)

### 4️⃣ **Uploads Folder Exposed** 🔴 URGENT (Security)
**Issue**: `/backend/uploads/` folder accessible globally + NOT in .gitignore

**Problem**:
```bash
# Anyone can access all uploaded files
GET http://localhost:5000/uploads/some-product-image.jpg
# If deployed, exposes all user-uploaded data
```

**Fix**:
1. Add to `.gitignore`:
   ```
   /backend/uploads/
   /backend/.env
   /backend/node_modules/
   /frontend/build/
   ```

2. Move uploads to cloud (AWS S3, Cloudinary) - Priority

3. Or: Protect with authentication:
   ```javascript
   app.use('/uploads', protect, admin, express.static('uploads'));
   ```

### 5️⃣ **CORS Too Permissive** 🟠 HIGH
**Fichier**: `backend/src/app.js`
```javascript
// CURRENT (BAD):
app.use(cors()); // Allows ALL origins

// SHOULD BE:
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
```
**Impact**: Malicious sites can make requests on behalf of users

### 6️⃣ **No Password Reset Feature** 🔴 URGENT
**Missing Endpoints**:
- `POST /api/users/forgot-password` - not implemented
- `POST /api/users/reset-password` - not implemented
- `GET /api/users/reset-password/:token` - not implemented

**Impact**: Users locked out forever if forget password

### 7️⃣ **No Email Verification** 🟠 HIGH
**Issue**: Register with typo email and locked out
```javascript
// Current: register accepts any email
const user = await User.create({
  name, email, password,
  // ❌ No emailVerified field or check
});

// Should have:
emailVerified: { type: Boolean, default: false }
// And block login until verified
```

### 8️⃣ **No Input Validation** 🟠 SECURITY
**Issue**: No joi/zod or input sanitization
```javascript
// Vulnerable to:
// - SQL/Mongo injection: {"$ne": ""}
// - XSS: <script>alert('xss')</script>
// - Large payloads: requests with 100MB data

// Use joi for validation:
const schema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
  name: Joi.string().max(50).required()
});
const {error, value} = schema.validate(req.body);
```

### 9️⃣ **No Rate Limiting** 🟠 SECURITY
**Issue**: Brute force attacks possible
```javascript
// No limit on login attempts
POST /api/users/login - Unlimited attempts
POST /api/products - Unlimited product creation

// Add express-rate-limit:
const rateLimit = require('express-rate-limit');
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Too many login attempts, try again later'
});
app.post('/api/users/login', loginLimiter, authUser);
```

### 🔟 **Multi-Vendor Order Safety** 🟠 IMPORTANT
**Issue**: When order has items from vendor A + B
```javascript
// Current: vendors.seller.myorders returns ALL items
// SECURITY PROBLEM: Vendor A can see vendor B's prices/customer

// Fix: Filter items per vendor:
sellerOrders = orders.filter(order => 
  order.items.some(item => item.seller === req.user._id)
);
// OR: Create separate OrderLine per vendor
```

---

## 💰 Commission System - Technical Details

### Formule (Implémentation Réelle)

**Location**: `backend/src/controllers/orderController.js` line ~70
```javascript
// Current implementation:
const platformCommissionRate = 0.20; // 20% hardcoded

order.items.forEach(item => {
  const commission = item.price * item.quantity * platformCommissionRate;
  item.platformCommission = commission;
  item.sellerPrice = (item.price * item.quantity) - commission;
});

order.subtotal = sum(item.price * item.quantity);
order.total = order.subtotal + commission_total + 7; // 7 = shipping
```

### Frontend Display

**Location**: `frontend/src/pages/CartPage.jsx` + `frontend/src/pages/CheckoutPage.jsx`

```jsx
// Cart calculation (CartContext + UI display)
const subtotal = items.reduce((sum, item) => 
  sum + (item.price * item.quantity), 0
);
const platformCommission = subtotal * 0.20; // 20%
const shippingCost = 7; // Hardcoded
const total = subtotal + platformCommission + shippingCost;

// Display:
// Subtotal:         100 DT
// Commission (20%): +20 DT
// Shipping:         +7 DT
// --------------------
// Total:           127 DT
```

### Issues & TODOs

1. ❌ **Commission hardcoded 20%** - Should use Product.platformCommissionRate
2. ❌ **No payout system** - Vendors can't withdraw money
3. ❌ **No audit trail** - No logs of commissions
4. ❌ **No per-category rates** - All products use 20%
5. ❌ **No admin control** - Can't modify commission in admin panel

---

```
Prix de base (défini par vendeur)  = 100 DT
Commission = 20%                    = 20 DT
Prix affiché au client             = 120 DT
↓
Client achète 120 DT
↓
Vendeur reçoit:  80 DT (120 - 20% commission)
Plateforme reçoit: 40 DT (20% de commission - 20 DT)
```

**IMPORTANT**: La commission est déjà incluse dans le prix affiché au client.

### Cas d'Usage Pratique

| Scenario | Prix Base | Commission 20% | Prix Client | Vendeur Reçoit |
|----------|-----------|----------------|------------|-----------------|
| T-shirt  | 50 DT     | 10 DT          | 60 DT      | 40 DT           |
| Téléphone| 500 DT    | 100 DT         | 600 DT     | 400 DT          |
| Livre    | 25 DT     | 5 DT           | 30 DT      | 20 DT           |

### Affichage Transparent

Dans le panier et à la checkout:
- ✅ Prix original (prix base)
- ✅ Commission (20%)
- ✅ Prix total

---

## ❌ Points à Améliorer

### Quick Priority Matrix

| Feature | Effort | Impact | Priority |
|---------|--------:|--------:|----------|
| Fix Stock Management | ⭐⭐ | 🔴🔴🔴 | P0 |
| Improve Password Validation | ⭐ | 🔴🔴 | P0 |
| Email Notifications | ⭐⭐⭐ | 🔴🔴 | P1 |
| Payment Integration | ⭐⭐⭐⭐ | 🔴🔴 | P1 |
| Password Reset Flow | ⭐⭐ | 🔴 | P1 |
| Rate Limiting | ⭐ | 🔴 | P1 |
| Cart Persistence | ⭐⭐ | 🟠 | P2 |
| Advanced Analytics | ⭐⭐⭐ | 🟠 | P2 |
| Promotions System | ⭐⭐⭐ | 🟠 | P2 |
| Chat Support | ⭐⭐⭐⭐ | 🟡 | P3 |

### 🔴 CRITIQUE (0. FIX FIRST - Production Blockers)

#### 1. **Authentification & Sécurité**
- [ ] **Forgot Password**: Implémentary réinitialisation de mot de passe via email
  - Envoi de lien temporaire
  - Validation du token
  - Mise à jour sécurisée du mot de passe
  
- [ ] **Email Verification**: Vérifier email lors de l'inscription
  - Envoi code de confirmation
  - Blocage jusqu'à vérification
  
- [ ] **Rate Limiting**: Protection contre les tentatives brute-force
  - Limiter les essais de login
  - Limiter API requests
  
- [ ] **Password Policy**: Validation minimum de mot de passe
  - Min 8 caractères
  - Combo majuscule/minuscule/chiffre
  - Pas de mot de passe faible

#### 2. **Système de Paiement**
- [ ] **Paiement en Ligne**: Intégrer payment gateway
  - Carte bancaire (Stripe, Flouci, Paiement.tn)
  - Paiement par portefeuille mobile (Ooredoo, Orange Money)
  - Simulation de paiement en development
  
- [ ] **Statut de Paiement**:
  - Suivi du paiement
  - Confirmation avant expédition
  - Remboursement en cas de problème

#### 3. **Notifications**
- [ ] **E-mail Notifications**:
  - Confirmation inscription
  - Confirmation commande
  - Mise à jour statut commande
  - Récapitulatif livraison
  
- [ ] **Push Notifications**:
  - Pour clients
  - Pour vendeurs
  - Configuration par utilisateur

#### 4. **Gestion des Fichiers**
- [ ] **Améliorer Upload Images**:
  - Optimisation automatique de tailles
  - Compression d'images
  - Support de multiples formats
  - Stockage cloud (AWS S3, Cloudinary)
  
- [ ] **Validation Fichiers**:
  - Vérifier type MIME
  - Limiter taille fichiers
  - Scan anti-virus

#### 5. **Gestion des Retours & Remboursements**
- [ ] **Système de Retour**:
  - Demander retour produit
  - Délai de rétractation
  - Frais de port retour
  - Suivi retour
  
- [ ] **Remboursement**:
  - Traitement automatique
  - Notification au client
  - Historique remboursements

### 🟠 IMPORTANTE (Priorité Moyenne)

#### 6. **Gestion des Stocks**
- [ ] **Alertes Stock**:
  - Notification vendeur si stock bas
  - Afficher "En rupture" produits
  - Pré-commande si rupture
  
- [ ] **Synchronisation Stock**:
  - Décrémenter stock après commande
  - Réserver stock au panier
  - Libérer si panier abandonné

#### 7. **Système d'Évaluation**
- [ ] **Ratings Plus Détaillés**:
  - Évaluation par catégorie (Qualité, Livraison, Service)
  - Photos/vidéos d'avis
  - Utile/Pas utile sur avis
  
- [ ] **Réputation Vendeur**:
  - Score vendeur visible
  - Détail des critères (Livraison, Qualité, Service)
  - Temps réponse vendeur

#### 8. **Amélioration UX**
- [ ] **Panier Persistant**:
  - Sincroniser panier avec backend
  - Même panier multi-appareils
  
- [ ] **Wishlist Améliorée**:
  - Partager wishlist
  - Alerte baisse prix
  - Comparer produits
  
- [ ] **Historique Recherche**:
  - Recommandations personnalisées
  - Produits similaires
  - Recherche avancée avec filtres

#### 9. **Vendeurs - Features Avancées**
- [ ] **Paramètres Avancés**:
  - Frais de port réglables
  - Délai de livraison estimé
  - Heures de service (si applicable)
  
- [ ] **Promotions & Réductions**:
  - Créer codes promo
  - Réductions de volume
  - Flash sales
  
- [ ] **Analytics Améliorés**:
  - Produits les plus vendus
  - Ventes quotidiennes/mensuel
  - Panier moyen
  - Taux de conversion

#### 10. **Admin - Outils Avancés**
- [ ] **Système de Modération**:
  - Reporter contenu inapproprié
  - Bloquer utilisateurs
  - Suspendre vendeur
  - Loguer actions admin
  
- [ ] **Configuration Plateforme**:
  - Modifier % commission
  - Catégories dynamiques
  - Paramètres globaux
  
- [ ] **Rapports & Exports**:
  - Exporter données CSV/Excel
  - Rapports PDF
  - Statistiques avancées
  - Audit trail

### 🟡 SOUHAITABLE (Priorité Basse)

#### 11. **Fonctionnalités Sociales**
- [ ] **Chat Acheteur-Vendeur**:
  - Questions sur produit
  - Négociation prix
  - Support client
  
- [ ] **Forum/Communauté**:
  - Q&A entre clients
  - Partage d'expériences
  - Tips & tricks

#### 12. **Mobile App**
- [ ] **Application Native**:
  - React Native ou Flutter
  - Même fonctionnalités que web
  - Push notifications
  - Offline mode basique

#### 13. **Logistique & Expédition**
- [ ] **Intégration Transporteurs**:
  - API Aramex
  - API TunisiePost
  - Calcul frais automatique
  - Code tracking généré
  
- [ ] **Multi-seller Orders**:
  - Si 1 commande = plusieurs vendeurs
  - Plusieurs colis
  - Suivi par colis
  - Frais de port par vendeur

#### 14. **Marketplace Features**
- [ ] **Subscription & VIP**:
  - Plans vendeur premium
  - Featured listings
  - Support prioritaire
  
- [ ] **Drops & Pre-order**:
  - Produits avec date limite
  - Pré-commandes avec dépôt

---

## � Bugs Connus & Issues Actuels

### Bugs Critique à Fixer IMMÉDIATEMENT

#### 1. **Stock Management Bug**
- **Severity**: CRITIQUE
- **Description**: La quantité de produit n'est JAMAIS décrémentée après une commande
- **Impact**: Overselling possible, inventory incorrect
- **Location**: `backend/src/controllers/orderController.js` → `createOrder()`
- **Solution Required**:
  ```javascript
  // After order created, must update product stock
  for (let item of order.items) {
    await Product.findByIdAndUpdate(
      item.product,
      { $inc: { stock: -item.quantity } }
    );
  }
  ```
- **Fix Priority**: 🔴 URGENT

#### 2. **Missing Stock Validation**
- **Severity**: CRITIQUE
- **Description**: Aucune validation si stock suffisant avant créer commande
- **Impact**: Overbooking, client peut commander plus que stock disponible
- **Location**: `backend/src/controllers/orderController.js` → `createOrder()`
- **Solution Required**:
  ```javascript
  // Validate stock before creating order
  for (let item of orderItems) {
    const product = await Product.findById(item.product);
    if (product.stock < item.quantity) {
      throw new Error(`Insufficient stock for ${product.name}`);
    }
  }
  ```
- **Fix Priority**: 🔴 URGENT

#### 3. **Password Validation Too Weak**
- **Severity**: HAUTE
- **Description**: UserSchema requires password >= 6 chars (trop faible)
- **Impact**: Comptes hacké easily, security issue
- **Location**: `backend/src/models/User.js` line 19-22
- **Current Code**: `minlength: 6`
- **Solution Required**: 
  ```javascript
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters'],
    validate: {
      validator: (v) => /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(v),
      message: 'Password must contain uppercase, lowercase, number, and special character'
    }
  }
  ```
- **Fix Priority**: 🔴 URGENT

#### 4. **Uploads Folder Exposed (Security)**
- **Severity**: HAUTE
- **Description**: `/backend/uploads` not in `.gitignore`, user files exposed
- **Impact**: PII data leak, sensitive images in repo
- **Location**: `.gitignore` missing uploads entry
- **Current Code**: App serves `app.use('/uploads', express.static(...))`
- **Solution Required**:
  1. Add to `.gitignore`:
     ```
     /backend/uploads/
     /backend/.env
     /backend/node_modules/
     ```
  2. Create `.gitkeep` in uploads folder
- **Fix Priority**: 🔴 URGENT

#### 5. **No Email Validation on Register**
- **Severity**: HAUTE
- **Description**: Utilisateur peut register avec typo d'email et ne pas pouvoir reset password
- **Impact**: Locked out accounts, impossible recover
- **Location**: `backend/src/controllers/authController.js` → `registerUser()`
- **Solution Required**: 
  - Add email verification (OTP ou email link)
  - Block login until email verified
- **Fix Priority**: 🔴 URGENT

#### 6. **Admin Endpoints Missing Seller Filter**
- **Severity**: MOYENNE
- **Description**: Admin orders/products endpoints don't properly filter by seller
- **Impact**: Admin voir tous les produits/commandes (correct) mais pagination might break
- **Location**: `backend/src/controllers/adminController.js`
- **Fix Priority**: 🟠 HAUTE

### Security Issues

#### 7. **No Password Reset Endpoint**
- **Status**: ❌ NOT IMPLEMENTED
- **Routes Missing**: 
  - `POST /api/users/forgot-password`
  - `POST /api/users/reset-password`
  - `GET /api/users/reset-password/:token`

#### 8. **No Rate Limiting**
- **Status**: ❌ NOT IMPLEMENTED
- **Issue**: Brute force attacks possible (login, API endpoints)
- **Solution**: Use `express-rate-limit` package
- **Example**:
  ```javascript
  const rateLimit = require('express-rate-limit');
  const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 attempts
    message: 'Too many login attempts, please try again later'
  });
  app.post('/api/users/login', loginLimiter, authUser);
  ```

#### 9. **No Input Validation/Sanitization**
- **Status**: ⚠️ PARTIALLY IMPLEMENTED
- **Issue**: MongoDB injection possible, XSS possible
- **Solution**: Use `joi` or `zod` for validation
- **Example**:
  ```javascript
  const Joi = require('joi');
  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required()
  });
  ```

#### 10. **No CORS Configuration (Open)**
- **Status**: ⚠️ PERMISSIVE
- **Current Code**: `app.use(cors())` - allows ALL origins
- **Solution Required**:
  ```javascript
  app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
  }));
  ```

### Functional Issues

#### 11. **No Pagination on Products List**
- **Status**: ⚠️ BASIC IMPLEMENTATION
- **Issue**: Large product lists might be slow
- **Solution**: Implement `skip` & `limit` properly in aggregation

#### 12. **Cart Persistence Issue**
- **Status**: ⚠️ FRONTEND ONLY
- **Issue**: Panier stocké seulement localStorage, pas de sync backend
- **Solution**: Créer endpoint POST /api/orders/cart pour sauvegarder temporaire

#### 13. **Image Optimization Missing**
- **Status**: ❌ NOT IMPLEMENTED
- **Issue**: Large images slow down site
- **Solution**: Sharp library for compression

---

## ✅ Ce Qui Fonctionne Bien

1. ✅ **Architecture**:
   - Clean separation: controllers, models, routes, middleware
   - Proper error handling avec express-async-handler
   - Middleware chain logical (auth → admin/seller checks)

2. ✅ **Authentication**:
   - JWT tokens properly implemented
   - User model with hashed passwords (bcryptjs)
   - Role-based access control (customer, seller, admin)

3. ✅ **Data Models**:
   - Well-structured schemas (User, Product, Order)
   - Proper relationships (refs, populate)
   - Timestamps on documents

4. ✅ **Frontend**:
   - React Context for state management
   - Multiple language support (i18n)
   - Good responsive design (Tailwind CSS)

5. ✅ **Commission System**:
   - Correctly calculated (20%)
   - Properly deducted from seller earnings
   - Visible to users

6. ✅ **Order Workflow**:
   - Complete status pipeline
   - Order number generation
   - Invoice generation



### Fonctionnalités Existantes ✅

| Feature | Frontend | Backend | Status |
|---------|----------|---------|--------|
| Inscription/Login | ✅ | ✅ | Production |
| Panier | ✅ | ✅ | Production |
| Checkout | ✅ | ✅ | Production (COD only) |
| Commandes | ✅ | ✅ | Production |
| Produits | ✅ | ✅ | Production |
| Admin Dashboard | ✅ | ✅ | Production |
| Seller Dashboard | ✅ | ✅ | Production |
| i18n (3 langues) | ✅ | N/A | Production |
| Commission 20% | ✅ | ✅ | Production |
| Responsive Design | ✅ | N/A | Production |

### Fonctionnalités Manquantes ❌

| Feature | Frontend | Backend | Priority |
|---------|----------|---------|----------|
| Paiement en ligne | ❌ | ❌ | CRITIQUE |
| Email Notifications | ❌ | ❌ | CRITIQUE |
| Password Reset | ❌ | ❌ | CRITIQUE |
| Gestion Stocks | ❌ | ❌ | IMPORTANTE |
| Retours/Remboursements | ❌ | ❌ | IMPORTANTE |
| Chat Acheteur-Vendeur | ❌ | ❌ | SOUHAITABLE |
| Logistics API | ❌ | ❌ | SOUHAITABLE |
| Mobile App | ❌ | ❌ | SOUHAITABLE |

---

## 🚀 Roadmap Future

### Phase 1 (Q1 2026) - MVP Renforcé
1. **Paiement en Ligne**: Stripe + Flouci
2. **Email Notifications**: Nodemailer ou SendGrid
3. **Password Reset**: Lien temporaire
4. **Rate Limiting**: Express-rate-limit

### Phase 2 (Q2 2026) - Stabilité
1. **Gestion Stocks**: Réservation & Sync
2. **Remboursements**: Automatisés
3. **Cloud Storage**: AWS S3 ou Cloudinary
4. **Logs & Monitoring**: Winston + analytics

### Phase 3 (Q3 2026) - Croissance
1. **Chat Support**: Socket.io
2. **Promotions**: Codes promo, Flash sales
3. **Logistics API**: Aramex/TunisiePost
4. **Mobile App**: React Native

### Phase 4 (Q4 2026) - Premium
1. **Marketplace Premium**: VIP sellers
2. **Communauté**: Forum/Reviews
3. **Advanced Analytics**: BI Dashboard
4. **Internationalisation**: Autres pays

---

## 📈 KPIs à Tracker

Pour mesurer la santé de la plateforme:

- **Utilisateurs**: Total, Actifs, Rétention
- **Vendeurs**: Total, % approbation, Revenue moyen
- **Commandes**: Total, AOV (Average Order Value), Taux conversion
- **Revenus**: Commission collectée, Croissance MoM
- **Satisfaction**: NPS, Avis moyens, Taux retour
- **Performance**: Temps chargement, Uptime, Erreurs

---

## 🔒 Recommandations Sécurité

1. **Chiffrement des données sensibles** (bcryptjs ✅ déjà implémenté)
2. **HTTPS obligatoire** en production
3. **CORS strictement configuré** (À réviser)
4. **Rate limiting** sur toutes les APIs (À ajouter)
5. **Validation input** stricte (À améliorer)
6. **Audit logs** de toutes les actions critiques
7. **2FA** pour admins (À considérer)
8. **Backup régulier** de la base de données
9. **PCI DSS compliance** pour paiements
10. **Politique RGPD** (droit à l'oubli, export données)

---

## 📞 Support & Documentation

### Documentation Existante
- `/ADMIN_GUIDE.md` - Guide admin
- `/QUICK_START.md` - Démarrage rapide
- `/backend/MONGODB_SETUP.md` - Setup MongoDB
- `/backend/GETTING_STARTED.md` - Guide backend

### À Créer
- [ ] Guide utilisateur client
- [ ] Guide vendeur
- [ ] Documentation API complète (Swagger)
- [ ] Architecture diagram
- [ ] Database schema diagram
- [ ] Component demo (Storybook)

---

## � Code Structure Files Reference

### Backend Key Files

**`backend/src/models/User.js`** - User Schema (97 lines)
```javascript
// Key fields:
- name, email, password (hashed), phone, avatar
- role: enum ['customer', 'seller', 'admin']
- addresses: [{fullName, phone, address, city, postalCode, country, isDefault}]
- wishlist: [ObjectId refs to Product]
- shopName, shopDescription, shopLogo, isVerifiedSeller, isActive
- Pre-save middleware: Hash password with bcryptjs

// Methods:
- matchPassword(enteredPassword) - Compare with bcrypt
```

**`backend/src/models/Product.js`** (149 lines)
```javascript
// Key fields:
- name, description, price, oldPrice, wholesalePrice
- images: [String], category: enum [10 categories]
- stock: Number, variants: [{color, size, quantity}]
- colors[], sizes[]
- platformCommissionRate: default 20
- seller: ObjectId ref, shop: String
- rating, numReviews
- Fields NOT USED: subcategory, brand (defined but not enforced)
```

**`backend/src/models/Order.js`** (142 lines)
```javascript
// Key fields:
- user: ObjectId ref, orderNumber: String (unique)
- items: [{product, quantity, price, sellerPrice, platformCommission, image, seller, shop}]
- shippingAddress: {fullName, phone, address, city, postalCode, country}
- paymentMethod: enum [COD, Card, PayPal], paymentStatus: enum [pending, paid, failed, refunded]
- subtotal, shippingCost (default 7), total
- orderStatus: enum [pending, confirmed, processing, shipped, delivered, cancelled]

// ISSUE: Items can contain multiple sellers (no sub-orders separation)
```

**`backend/src/controllers/authController.js`** (64 lines)
```javascript
- registerUser(req, res): Creates user, no email verification
- authUser(req, res): Login with JWT generation, no rate limiting
- Issue: Passwords validated at model level only (minlength 6)
```

**`backend/src/middleware/authMiddleware.js`** (65 lines)
```javascript
- protect: Verify Bearer token, check user exists & isActive
- admin: Check role === 'admin'
- seller: Check role === 'seller' OR 'admin'
- Issue: No error recovery for invalid tokens
```

**`backend/src/app.js`** (56 lines)
```javascript
- Middleware stack: json, urlencoded, cors (PERMISSIVE!), helmet, morgan
- Routes: /api/users, /api/products, /api/orders, /api/upload, /api/admin
- Static: /uploads folder exposed
- Swagger docs: /api/docs
- Issue: No global error handler configuration
```

### Frontend Key Files

**`frontend/src/context/AuthContext.jsx`** (70 lines)
```javascript
- useAuth hook
- AuthProvider: user, loading, login, register, logout
- localStorage: user (JSON), token (JWT)
- Fetch: http://localhost:5000/api/users/login|register
```

**`frontend/src/context/CartContext.jsx`**
```javascript
- CartProvider: items[], addToCart, removeFromCart, updateQuantity
- Calculations: subtotal, platformCommission (20%), shippingCost (7)
- localStorage: cart (items array)
- No backend sync (TODO)
```

**`frontend/src/App.jsx`** (113 lines)
```javascript
- Router setup with 25+ pages
- Protected routes for seller/admin
- Layout: Navbar + Footer for most routes
- AdminLayout & SellerLayout for dashboards
```

**`frontend/src/pages/CheckoutPage.jsx`**
```javascript
- Form: shippingAddress fields
- paymentMethod selection (COD default)
- POST /api/orders to create order
- Calculates: subtotal + commission + shipping
```

**`frontend/src/components/ProtectedRoute.jsx`**
```javascript
- Checks user.role against allowedRoles
- Redirects to login if not authenticated
- Redirects to home if insufficient role
```

### Configuration Files

**`backend/.env`** (Required)
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/terfer
JWT_SECRET=your_secret_key
NODE_ENV=development
# Missing: FRONTEND_URL for CORS, EMAIL settings, AWS_KEY, etc.
```

**`backend/package.json`**
```json
- Dependencies: express 5, mongoose 9, bcryptjs 3, jwt, multer, helmet, cors, morgan
- Scripts: dev (nodemon), start, data:import, data:destroy
- Missing: test script, lint script
```

**`frontend/package.json`**
```json
- Dependencies: react 18, react-router, tailwindcss, i18next, react-hot-toast, lucide-react
- Scripts: dev (vite), build, preview
- Missing: lint script, format script
```

### Scripts & Utils

**`backend/src/createAdmin.js`**
- Creates admin account: adminterfer@gmail.com / adminterfer123
- Can be run multiple times (creates duplicate if not checked)
- TODO: Make idempotent

**`backend/src/seeder.js`**
- Imports/destroys test data
- Run: `npm run data:import`
- Run: `npm run data:destroy`

**`backend/src/utils/generateToken.js`**
- Creates JWT with jwt.sign(user._id, JWT_SECRET)
- No expiration set (TODO: add exp: 7d)
- Security: Expiration should be short (24h) with refresh tokens

---

## 🎯 Implementation Priorities (Next Steps)

### Week 1: Critical Fixes (MUST DO)
1. ✋ **STOP overselling**: Add stock validation + decrement in orderController
2. 🔐 **Improve passwords**: Change minlength 6 → 8 + add complexity validation
3. 🗑️ **Secure uploads**: Add /backend/uploads to .gitignore, move to cloud
4. 🔒 **Fix CORS**: Restrict to FRONTEND_URL instead of "all origins"

### Week 2: Security
1. 💌 **Add password reset**: forgot-password + reset-password endpoints
2. 📧 **Email verification**: OTP or link validation on register
3. 🚫 **Rate limiting**: express-rate-limit on auth endpoints
4. ✓ **Input validation**: Use joi for all POST/PUT requests

### Week 3: Features
1. 💰 **Payment gateway**: Stripe/Flouci integration
2. 📧 **Email notifications**: Order confirmation, status updates
3. 💾 **Cart persistence**: Sync with backend
4. 📊 **Better analytics**: Seller dashboard metrics

### Week 4: Polish
1. 🎨 **Image optimization**: Compress on upload
2. 📱 **Mobile testing**: Ensure responsive works
3. 📈 **Performance**: Optimize queries, add indexes
4. 🧪 **Testing**: Add unit & integration tests

---

## 📖 Documentation to Create

- [ ] **API Documentation** - Complete endpoints reference (use Swagger)
- [ ] **Database Schema Diagram** - Visual ER diagram
- [ ] **Architecture Diagram** - Frontend/Backend/DB flow
- [ ] **Developer Setup Guide** - Step-by-step local setup
- [ ] **Deployment Guide** - How to deploy to production
- [ ] **User Guides** - Customer/Seller/Admin how-tos
- [ ] **Testing Guide** - How to test features
- [ ] **Contributing Guide** - Code standards, PR process

TerFer Commerce est une **plateforme solide** avec les fonctionnalités essentielles d'un marketplace. Les prochaines étapes devraient se concentrer sur:

1. **Paiement en ligne** (CRITIQUE)
2. **Notifications par email** (CRITIQUE)
3. **Gestion des stocks** (IMPORTANTE)
4. **Amélioration UX/UI** (IMPORTANTE)

Une fois ces points adressés, la plateforme sera **prête pour production** et pourra accueillir un volume de vendeurs et clients significatif.

---

**Document créé**: Février 2026  
**Version**: 1.0  
**Auteur**: Team TerFer Commercial
