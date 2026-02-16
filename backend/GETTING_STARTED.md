# 🚀 Guide de démarrage Backend TerFer

## ✅ Étape 1: Vérifier MongoDB

Le backend nécessite MongoDB. Vous avez deux options :

### Option A: MongoDB Local

1. **Télécharger MongoDB Community Server** :
   - Aller sur https://www.mongodb.com/try/download/community
   - Télécharger la version pour Windows
   - Installer avec les paramètres par défaut

2. **Démarrer MongoDB** :
   ```powershell
   # Démarrer le service MongoDB
   net start MongoDB
   ```

3. **Vérifier que MongoDB fonctionne** :
   ```powershell
   # Ouvrir MongoDB Shell
   mongosh
   ```

### Option B: MongoDB Atlas (Cloud - Recommandé)

1. **Créer un compte gratuit** :
   - Aller sur https://www.mongodb.com/cloud/atlas/register
   - Créer un compte gratuit

2. **Créer un cluster** :
   - Cliquer sur "Build a Database"
   - Choisir "FREE" (M0)
   - Sélectionner une région proche (ex: Frankfurt)
   - Cliquer sur "Create"

3. **Configurer l'accès** :
   - Créer un utilisateur de base de données
   - Ajouter votre IP (ou 0.0.0.0/0 pour autoriser toutes les IPs)

4. **Obtenir la chaîne de connexion** :
   - Cliquer sur "Connect"
   - Choisir "Connect your application"
   - Copier la chaîne de connexion

5. **Mettre à jour `.env`** :
   ```env
   MONGO_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/terfer?retryWrites=true&w=majority
   ```

## ✅ Étape 2: Installer les dépendances

```powershell
cd backend
npm install
```

## ✅ Étape 3: Configurer les variables d'environnement

Le fichier `.env` est déjà configuré pour MongoDB local. Si vous utilisez Atlas, modifiez `MONGO_URI`.

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/terfer
JWT_SECRET=supersecretkey
NODE_ENV=development
```

## ✅ Étape 4: Peupler la base de données

```powershell
npm run data:import
```

Cela va créer :
- ✅ 4 utilisateurs (admin, 2 vendeurs, 1 client)
- ✅ 8 produits avec images
- ✅ Données de test complètes

## ✅ Étape 5: Démarrer le serveur

```powershell
npm run dev
```

Vous devriez voir :
```
Server running in development mode on port 5000
MongoDB Connected: localhost
```

## ✅ Étape 6: Tester l'API

Ouvrir votre navigateur et aller sur :
```
http://localhost:5000
```

Vous devriez voir :
```json
{
  "message": "TerFer API is running...",
  "version": "1.0.0",
  "endpoints": {
    "users": "/api/users",
    "products": "/api/products",
    "orders": "/api/orders"
  }
}
```

## 🧪 Tester avec Postman ou Thunder Client

### 1. Login
```
POST http://localhost:5000/api/users/login
Content-Type: application/json

{
  "email": "john@customer.tn",
  "password": "customer123"
}
```

### 2. Obtenir les produits
```
GET http://localhost:5000/api/products
```

### 3. Obtenir un produit spécifique
```
GET http://localhost:5000/api/products/{product_id}
```

### 4. Obtenir le profil (avec token)
```
GET http://localhost:5000/api/users/profile
Authorization: Bearer {votre_token}
```

## 🔑 Comptes de test

### Admin
- **Email**: admin@terfer.tn
- **Password**: admin123

### Vendeur 1 (Moda Tunis)
- **Email**: mohamed@seller.tn
- **Password**: seller123

### Vendeur 2 (Tech Store)
- **Email**: sarah@seller.tn
- **Password**: seller123

### Client
- **Email**: john@customer.tn
- **Password**: customer123

## 🛠️ Commandes utiles

```powershell
# Démarrer en mode développement
npm run dev

# Démarrer en mode production
npm start

# Importer les données de test
npm run data:import

# Supprimer toutes les données
npm run data:destroy
```

## ❌ Résolution des problèmes

### Erreur: "MongoDB connection failed"
- ✅ Vérifier que MongoDB est démarré
- ✅ Vérifier la chaîne de connexion dans `.env`
- ✅ Vérifier que le port 27017 n'est pas bloqué

### Erreur: "Port 5000 already in use"
- ✅ Changer le PORT dans `.env` (ex: 5001)
- ✅ Ou arrêter le processus qui utilise le port 5000

### Erreur: "JWT_SECRET not defined"
- ✅ Vérifier que le fichier `.env` existe
- ✅ Vérifier que `JWT_SECRET` est défini

## 📚 Prochaines étapes

1. ✅ Backend démarré
2. 🔄 Connecter le frontend au backend
3. 🔄 Tester les fonctionnalités
4. 🔄 Déployer sur Heroku/Render

## 🎉 Félicitations !

Votre backend TerFer est maintenant opérationnel ! 🚀

Pour la documentation complète de l'API, consultez `README.md`.
