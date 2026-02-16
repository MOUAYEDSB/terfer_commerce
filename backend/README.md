# TerFer Backend API

API REST pour la marketplace TerFer - Plateforme e-commerce tunisienne

## 🚀 Démarrage rapide

### Prérequis
- Node.js (v14+)
- MongoDB (local ou Atlas)

### Installation

```bash
cd backend
npm install
```

### Configuration

Créer un fichier `.env` à la racine du dossier backend :

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/terfer
JWT_SECRET=votre_secret_jwt_super_securise
NODE_ENV=development
```

### Démarrer le serveur

```bash
# Mode développement avec nodemon
npm run dev

# Mode production
npm start
```

### Peupler la base de données

```bash
# Importer les données de test
npm run data:import

# Supprimer toutes les données
npm run data:destroy
```

## 📚 Documentation API

### Base URL
```
http://localhost:5000/api
```

---

## 🔐 Authentification

### Inscription
**POST** `/users/register`

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "customer" // ou "seller"
}
```

### Connexion
**POST** `/users/login`

```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Réponse:**
```json
{
  "_id": "...",
  "name": "John Doe",
  "email": "john@example.com",
  "role": "customer",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

## 👤 Utilisateurs

### Obtenir le profil
**GET** `/users/profile` 🔒

Headers: `Authorization: Bearer {token}`

### Mettre à jour le profil
**PUT** `/users/profile` 🔒

```json
{
  "name": "John Updated",
  "phone": "+216 12 345 678",
  "avatar": "https://..."
}
```

### Ajouter une adresse
**POST** `/users/addresses` 🔒

```json
{
  "fullName": "John Doe",
  "phone": "+216 12 345 678",
  "address": "123 Rue de la République",
  "city": "Tunis",
  "postalCode": "1001",
  "isDefault": true
}
```

### Modifier une adresse
**PUT** `/users/addresses/:addressId` 🔒

### Supprimer une adresse
**DELETE** `/users/addresses/:addressId` 🔒

### Ajouter/Retirer de la wishlist
**POST** `/users/wishlist/:productId` 🔒

### Obtenir info vendeur
**GET** `/users/seller/:id`

---

## 🛍️ Produits

### Obtenir tous les produits
**GET** `/products`

**Query params:**
- `category` - Filtrer par catégorie
- `search` - Recherche par nom/description
- `minPrice` - Prix minimum
- `maxPrice` - Prix maximum
- `seller` - ID du vendeur
- `sort` - `price_asc`, `price_desc`, `rating`
- `page` - Numéro de page (défaut: 1)
- `limit` - Produits par page (défaut: 12)

**Exemple:**
```
GET /products?category=Mode&minPrice=20&maxPrice=100&sort=price_asc&page=1
```

### Obtenir un produit
**GET** `/products/:id`

### Obtenir produits par catégorie
**GET** `/products/category/:category`

### Créer un produit
**POST** `/products` 🔒 (Seller)

```json
{
  "name": "T-shirt Vintage",
  "description": "Description du produit...",
  "price": 45,
  "images": ["https://..."],
  "category": "Mode",
  "brand": "Brand Name",
  "stock": 50,
  "shop": "Nom de la boutique"
}
```

### Modifier un produit
**PUT** `/products/:id` 🔒 (Seller)

### Supprimer un produit
**DELETE** `/products/:id` 🔒 (Seller)

### Ajouter un avis
**POST** `/products/:id/reviews` 🔒

```json
{
  "rating": 5,
  "comment": "Excellent produit!"
}
```

---

## 📦 Commandes

### Créer une commande
**POST** `/orders` 🔒

```json
{
  "items": [
    {
      "product": "product_id",
      "name": "T-shirt Vintage",
      "quantity": 2,
      "price": 45,
      "image": "https://...",
      "seller": "seller_id",
      "shop": "Moda Tunis"
    }
  ],
  "shippingAddress": {
    "fullName": "John Doe",
    "phone": "+216 12 345 678",
    "address": "123 Rue...",
    "city": "Tunis",
    "postalCode": "1001"
  },
  "paymentMethod": "COD"
}
```

### Obtenir mes commandes
**GET** `/orders/myorders` 🔒

### Obtenir une commande
**GET** `/orders/:id` 🔒

### Obtenir commande par numéro
**GET** `/orders/number/:orderNumber` 🔒

### Obtenir commandes vendeur
**GET** `/orders/seller/myorders` 🔒 (Seller)

### Mettre à jour statut
**PUT** `/orders/:id/status` 🔒 (Seller)

```json
{
  "status": "shipped",
  "note": "Colis expédié via Aramex"
}
```

**Statuts disponibles:**
- `pending` - En attente
- `confirmed` - Confirmée
- `processing` - En préparation
- `shipped` - Expédiée
- `delivered` - Livrée
- `cancelled` - Annulée

### Annuler une commande
**PUT** `/orders/:id/cancel` 🔒

```json
{
  "reason": "Changement d'avis"
}
```

### Obtenir toutes les commandes
**GET** `/orders/all` 🔒 (Admin)

---

## 📋 Catégories disponibles

- Mode
- High-Tech
- Maison
- Beauté
- Bijoux
- Sport
- Enfants
- Auto
- Animaux
- Accessoires

---

## 🔑 Comptes de test

Après avoir exécuté `npm run data:import`:

### Admin
- Email: `admin@terfer.tn`
- Password: `admin123`

### Vendeur 1
- Email: `mohamed@seller.tn`
- Password: `seller123`
- Shop: Moda Tunis

### Vendeur 2
- Email: `sarah@seller.tn`
- Password: `seller123`
- Shop: Tech Store

### Client
- Email: `john@customer.tn`
- Password: `customer123`

---

## 🛠️ Technologies utilisées

- **Node.js** - Runtime JavaScript
- **Express** - Framework web
- **MongoDB** - Base de données NoSQL
- **Mongoose** - ODM pour MongoDB
- **JWT** - Authentification
- **bcryptjs** - Hachage des mots de passe
- **express-async-handler** - Gestion des erreurs async
- **helmet** - Sécurité HTTP
- **cors** - Cross-Origin Resource Sharing
- **morgan** - Logger HTTP

---

## 📁 Structure du projet

```
backend/
├── src/
│   ├── config/
│   │   └── db.js              # Configuration MongoDB
│   ├── controllers/
│   │   ├── userController.js   # Logique utilisateurs
│   │   ├── productController.js # Logique produits
│   │   └── orderController.js  # Logique commandes
│   ├── middleware/
│   │   ├── authMiddleware.js   # Authentification JWT
│   │   └── errorMiddleware.js  # Gestion erreurs
│   ├── models/
│   │   ├── User.js            # Modèle utilisateur
│   │   ├── Product.js         # Modèle produit
│   │   └── Order.js           # Modèle commande
│   ├── routes/
│   │   ├── userRoutes.js      # Routes utilisateurs
│   │   ├── productRoutes.js   # Routes produits
│   │   └── orderRoutes.js     # Routes commandes
│   ├── app.js                 # Configuration Express
│   ├── server.js              # Point d'entrée
│   └── seeder.js              # Script de seed
├── .env                       # Variables d'environnement
└── package.json
```

---

## 🔒 Sécurité

- Mots de passe hachés avec bcrypt
- Authentification JWT
- Protection CORS
- Headers sécurisés avec Helmet
- Validation des données
- Protection contre les injections NoSQL

---

## 📝 Notes

- 🔒 = Route protégée (nécessite authentification)
- (Seller) = Nécessite rôle vendeur
- (Admin) = Nécessite rôle admin

---

## 🐛 Débogage

Pour activer les logs détaillés:
```bash
NODE_ENV=development npm run dev
```

---

## 📧 Support

Pour toute question: contact@terfer.tn
