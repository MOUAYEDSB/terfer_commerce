# Guide de Configuration et Test - Améliorations TerFer Backend

## ✅ Modifications Complétées

### 1. Sécurité du Mot de Passe (P0) ✅
**Fichier modifié:** `backend/src/models/User.js`
- ✅ Longueur minimale augmentée de 6 à 8 caractères
- ✅ Validation regex ajoutée (majuscule + minuscule + chiffre + caractère spécial)
- ✅ Méthode `comparePassword` renommée en `matchPassword` pour cohérence

### 2. Configuration CORS (P0) ✅
**Fichier modifié:** `backend/src/app.js`
- ✅ CORS restreint au `FRONTEND_URL` uniquement
- ✅ Configuration complète avec credentials et méthodes autorisées
- ✅ Fallback sur `http://localhost:5173` en développement

### 3. Rate Limiting (P0) ✅
**Fichier créé:** `backend/src/middleware/rateLimitMiddleware.js`
- ✅ API générale: 100 requêtes/15 min
- ✅ Login: 5 tentatives/15 min
- ✅ Register: 3 comptes/heure
- ✅ Forgot Password: 3 demandes/heure

**Fichiers modifiés:**
- ✅ `backend/src/app.js` - apiLimiter ajouté sur `/api/`
- ✅ `backend/src/routes/userRoutes.js` - loginLimiter et registerLimiter ajoutés

### 4. Validation Stock (P1) ✅
**Fichier créé:** `backend/src/middleware/validateStockMiddleware.js`
- ✅ Vérifie le stock avant création de commande
- ✅ Validation pour chaque produit de la commande
- ✅ Erreur 400 si stock insuffisant

**Fichier modifié:** `backend/src/routes/orderRoutes.js`
- ✅ Middleware `validateOrderStock` ajouté sur POST /

### 5. Réinitialisation Mot de Passe (P1) ✅
**Fichier créé:** `backend/src/controllers/passwordResetController.js`
- ✅ `forgotPassword` - Génère token et envoie email
- ✅ `resetPassword` - Réinitialise mot de passe avec token
- ✅ `verifyResetToken` - Vérifie validité du token
- ✅ Token SHA-256 hashé, expiration 1 heure

**Fichier modifié:** `backend/src/models/User.js`
- ✅ Champs ajoutés: `resetPasswordToken`, `resetPasswordExpiry`, `emailVerified`, `emailVerificationToken`

**Fichier modifié:** `backend/src/routes/userRoutes.js`
- ✅ Route POST `/forgot-password` ajoutée
- ✅ Route POST `/reset-password/:resetToken` ajoutée
- ✅ Route GET `/reset-password/:resetToken` ajoutée

### 6. Service Email (P1) ✅
**Fichier créé:** `backend/src/services/emailService.js`
- ✅ Configuration Nodemailer (Gmail dev, SendGrid prod)
- ✅ Template email réinitialisation mot de passe
- ✅ Template email bienvenue
- ✅ Template confirmation commande
- ✅ Fonction générique `sendEmail`

### 7. Configuration Environnement ✅
**Fichier créé:** `backend/.env.example`
- ✅ Variables serveur (PORT, NODE_ENV)
- ✅ Variables database (MONGO_URI)
- ✅ Variables JWT (JWT_SECRET)
- ✅ Variables frontend (FRONTEND_URL)
- ✅ Variables email (EMAIL_USER, EMAIL_PASSWORD, EMAIL_FROM)

---

## 📋 Configuration Requise

### Étape 1: Créer le fichier .env
```bash
cd backend
cp .env.example .env
```

### Étape 2: Configurer les variables d'environnement

Éditer `backend/.env` avec vos valeurs:

```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGO_URI=mongodb://localhost:27017/terfer

# JWT
JWT_SECRET=votre_secret_jwt_super_securise_changez_moi

# Frontend
FRONTEND_URL=http://localhost:5173

# Email (Gmail - pour développement)
EMAIL_SERVICE=gmail
EMAIL_USER=votre-email@gmail.com
EMAIL_PASSWORD=votre-mot-de-passe-application
EMAIL_FROM=TerFer <noreply@terfer.com>
RESET_PASSWORD_URL=http://localhost:5173/reset-password
```

### Étape 3: Configuration Gmail pour les emails

#### Créer un mot de passe d'application Gmail:
1. Aller sur https://myaccount.google.com/security
2. Activer "Validation en deux étapes" si pas déjà fait
3. Rechercher "Mots de passe d'application"
4. Créer un nouveau mot de passe pour "Mail"
5. Copier le mot de passe généré dans `EMAIL_PASSWORD`

**Alternative pour production (SendGrid):**
```env
EMAIL_SERVICE=sendgrid
SENDGRID_API_KEY=votre_clé_api_sendgrid
```

### Étape 4: Installer les dépendances
```bash
cd backend
npm install
```

### Étape 5: Démarrer le serveur
```bash
npm run dev
```

---

## 🧪 Plan de Test

### Test 1: Validation Mot de Passe ✅

**Endpoint:** `POST /api/users/register`

**Test 1.1 - Mot de passe faible (devrait échouer)**
```bash
curl -X POST http://localhost:5000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "simple"
  }'
```
**Résultat attendu:** Erreur 400 - "Password must be at least 8 characters"

**Test 1.2 - Mot de passe sans caractères spéciaux (devrait échouer)**
```bash
curl -X POST http://localhost:5000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test2@example.com",
    "password": "Simple123"
  }'
```
**Résultat attendu:** Erreur 400 - "Password must contain at least one special character"

**Test 1.3 - Mot de passe valide (devrait réussir)**
```bash
curl -X POST http://localhost:5000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test3@example.com",
    "password": "Secure@123"
  }'
```
**Résultat attendu:** 201 - Utilisateur créé avec token

---

### Test 2: Rate Limiting ✅

**Test 2.1 - Rate limit sur login (5 tentatives/15min)**
```bash
# Essayer 6 fois de se connecter
for i in {1..6}; do
  curl -X POST http://localhost:5000/api/users/login \
    -H "Content-Type: application/json" \
    -d '{"email": "wrong@example.com", "password": "wrong"}' \
    -w "\nAttempt $i: %{http_code}\n"
  sleep 1
done
```
**Résultat attendu:** 
- Tentatives 1-5: 401 Unauthorized
- Tentative 6: 429 Too many requests

**Test 2.2 - Rate limit sur API générale (100 requêtes/15min)**
```bash
# Tester avec un endpoint simple
for i in {1..101}; do
  curl -X GET http://localhost:5000/api/products \
    -w "\nRequest $i: %{http_code}\n"
done
```
**Résultat attendu:**
- Requêtes 1-100: 200 OK
- Requête 101: 429 Too many requests

---

### Test 3: Validation Stock ✅

**Test 3.1 - Commander avec stock insuffisant (devrait échouer)**

Prérequis: Avoir un produit avec stock = 5

```bash
# 1. Se connecter et obtenir un token
TOKEN=$(curl -X POST http://localhost:5000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"email": "customer@example.com", "password": "Customer@123"}' \
  | jq -r '.token')

# 2. Essayer de commander 10 unités (stock = 5)
curl -X POST http://localhost:5000/api/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "items": [{
      "product": "PRODUCT_ID_HERE",
      "quantity": 10,
      "price": 50
    }],
    "shippingAddress": {
      "fullName": "John Doe",
      "phone": "12345678",
      "address": "123 Main St",
      "city": "Tunis",
      "postalCode": "1000",
      "country": "Tunisia"
    },
    "paymentMethod": "cash"
  }'
```
**Résultat attendu:** Erreur 400 - "Insufficient stock for product: [Product Name]"

**Test 3.2 - Commander avec stock suffisant (devrait réussir)**
```bash
# Commander 3 unités (stock = 5)
curl -X POST http://localhost:5000/api/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "items": [{
      "product": "PRODUCT_ID_HERE",
      "quantity": 3,
      "price": 50
    }],
    "shippingAddress": {
      "fullName": "John Doe",
      "phone": "12345678",
      "address": "123 Main St",
      "city": "Tunis",
      "postalCode": "1000",
      "country": "Tunisia"
    },
    "paymentMethod": "cash"
  }'
```
**Résultat attendu:** 201 - Commande créée, stock réduit à 2

---

### Test 4: Réinitialisation Mot de Passe ✅

**Test 4.1 - Demander réinitialisation**
```bash
curl -X POST http://localhost:5000/api/users/forgot-password \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test3@example.com"
  }'
```
**Résultat attendu:** 
- 200 - "Password reset email sent"
- Email reçu avec lien de réinitialisation

**Test 4.2 - Vérifier le token**
```bash
# Récupérer le token depuis l'email
curl -X GET http://localhost:5000/api/users/reset-password/TOKEN_FROM_EMAIL
```
**Résultat attendu:** 200 - "Token is valid"

**Test 4.3 - Réinitialiser le mot de passe**
```bash
curl -X POST http://localhost:5000/api/users/reset-password/TOKEN_FROM_EMAIL \
  -H "Content-Type: application/json" \
  -d '{
    "password": "NewSecure@456"
  }'
```
**Résultat attendu:** 200 - "Password reset successful"

**Test 4.4 - Se connecter avec nouveau mot de passe**
```bash
curl -X POST http://localhost:5000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test3@example.com",
    "password": "NewSecure@456"
  }'
```
**Résultat attendu:** 200 - Token JWT retourné

**Test 4.5 - Token expiré (après 1 heure)**
Attendre 1 heure ou modifier la DB manuellement pour tester l'expiration.

**Test 4.6 - Rate limit forgot password (3/heure)**
```bash
for i in {1..4}; do
  curl -X POST http://localhost:5000/api/users/forgot-password \
    -H "Content-Type: application/json" \
    -d '{"email": "test3@example.com"}' \
    -w "\nAttempt $i: %{http_code}\n"
done
```
**Résultat attendu:**
- Tentatives 1-3: 200 OK
- Tentative 4: 429 Too many requests

---

### Test 5: Service Email ✅

**Test 5.1 - Email de réinitialisation**
Déjà testé dans Test 4.1

**Test 5.2 - Email de bienvenue**
Vérifier l'email après inscription (Test 1.3)

**Test 5.3 - Email de confirmation commande**
Vérifier l'email après création commande (Test 3.2)

**Note:** Les emails peuvent aller dans les spams. Vérifier le dossier spam.

---

## 🔒 Tests de Sécurité

### Test 6: CORS

**Test 6.1 - Requête depuis origine autorisée**
```bash
curl -X GET http://localhost:5000/api/products \
  -H "Origin: http://localhost:5173" \
  -v
```
**Résultat attendu:** Header `Access-Control-Allow-Origin: http://localhost:5173`

**Test 6.2 - Requête depuis origine non autorisée**
```bash
curl -X GET http://localhost:5000/api/products \
  -H "Origin: http://malicious-site.com" \
  -v
```
**Résultat attendu:** Pas de header CORS ou origine bloquée

---

## 📊 Monitoring

### Vérifier les logs
```bash
# En mode dev, les logs apparaissent dans la console
# Chercher:
# - "Password reset email sent to: email@example.com"
# - "Rate limit exceeded for IP: xxx.xxx.xxx.xxx"
# - "Insufficient stock for product: Product Name"
```

### Vérifier la base de données
```javascript
// Vérifier les tokens de reset dans MongoDB
use terfer
db.users.find({ resetPasswordToken: { $exists: true } })

// Vérifier le stock après commande
db.products.find({ _id: ObjectId("PRODUCT_ID") }, { stock: 1, name: 1 })
```

---

## 🐛 Résolution de Problèmes

### Problème: "express-rate-limit is not defined"
**Solution:** 
```bash
cd backend
npm install express-rate-limit
```

### Problème: "nodemailer is not defined"
**Solution:**
```bash
cd backend
npm install nodemailer
```

### Problème: "Error: Invalid login credentials" lors des emails
**Solution:**
- Vérifier Gmail "Mots de passe d'application"
- Vérifier EMAIL_USER et EMAIL_PASSWORD dans .env
- Vérifier que la validation en 2 étapes est active

### Problème: Emails ne sont pas envoyés
**Solution:**
- Vérifier les logs de la console
- Vérifier le dossier spam
- Tester avec un service comme Mailtrap en dev:
```env
EMAIL_SERVICE=smtp
EMAIL_HOST=smtp.mailtrap.io
EMAIL_PORT=2525
EMAIL_USER=your_mailtrap_user
EMAIL_PASSWORD=your_mailtrap_password
```

### Problème: "Cannot read property 'matchPassword' of null"
**Solution:** L'ancienne méthode `comparePassword` a été renommée. Vérifier tous les contrôleurs:
```javascript
// Ancien
const isMatch = await user.comparePassword(password);
// Nouveau
const isMatch = await user.matchPassword(password);
```

---

## 📈 Prochaines Étapes (Non Implémentées)

### P2 - Améliorations Futures
- [ ] Pagination sur les listes de produits
- [ ] Filtres avancés sur les produits
- [ ] Pages frontend pour reset password
- [ ] Vérification d'email après inscription
- [ ] Notifications push
- [ ] Webhooks pour les paiements
- [ ] Logs structurés (Winston)
- [ ] Tests unitaires (Jest)
- [ ] Tests d'intégration (Supertest)
- [ ] Documentation OpenAPI complète
- [ ] Rate limiting par utilisateur (pas seulement par IP)
- [ ] Blacklist de tokens JWT
- [ ] Refresh tokens

---

## 📝 Notes Importantes

1. **Mot de passe d'application Gmail:** Ne jamais commiter le mot de passe dans Git
2. **JWT_SECRET:** Utiliser une valeur aléatoire longue (32+ caractères) en production
3. **CORS:** En production, remplacer par votre domaine réel
4. **Rate Limiting:** Ajuster les limites selon vos besoins
5. **Emails:** Passer à SendGrid ou AWS SES en production pour meilleure délivrabilité
6. **HTTPS:** Toujours utiliser HTTPS en production pour les tokens et mots de passe
7. **Validation:** Les middlewares de validation sont appliqués dans l'ordre

---

## ✅ Checklist Déploiement Production

- [ ] Variables .env configurées (pas de valeurs par défaut)
- [ ] JWT_SECRET changé (valeur aléatoire forte)
- [ ] FRONTEND_URL mis à jour avec domaine de production
- [ ] Service email configuré (SendGrid/AWS SES)
- [ ] NODE_ENV=production
- [ ] MongoDB Atlas configuré avec restrictions IP
- [ ] HTTPS activé
- [ ] Rate limits ajustés pour production
- [ ] Logs configurés (Winston/CloudWatch)
- [ ] Monitoring configuré (Sentry/New Relic)
- [ ] Backup database automatisé
- [ ] Tests de charge effectués

---

**Date de dernière mise à jour:** $(Get-Date -Format "yyyy-MM-dd HH:mm")
**Version:** 1.0.0
**Auteur:** GitHub Copilot
