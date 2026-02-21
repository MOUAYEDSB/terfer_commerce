# Guide de Démarrage Rapide - Admin Dashboard

## 🚀 Étapes pour tester le système admin

### 1. Vérifier que le backend est démarré
```bash
cd backend
npm run dev
```
Le serveur devrait démarrer sur `http://localhost:5000`

### 2. Vérifier que le frontend est démarré
```bash
cd frontend
npm run dev
```
Le frontend devrait démarrer sur `http://localhost:5173` ou `http://localhost:5174`

### 3. Vérifier que l'admin existe dans la base de données

Ouvrez MongoDB Compass ou votre client MongoDB et vérifiez la collection `users` :
```javascript
{
  "email": "adminterfer@gmail.com",
  "role": "admin",
  "isActive": true
}
```

Si l'admin n'existe pas, créez-le :
```bash
cd backend
node src/createAdmin.js
```

### 4. Se connecter en tant qu'admin

1. Allez sur `http://localhost:5173/login` (ou 5174)
2. Utilisez les identifiants :
   - **Email**: adminterfer@gmail.com
   - **Password**: adminterfer123
3. Vous devriez être redirigé vers `/admin/dashboard`

### 🔍 Déboguer les problèmes de page blanche

Si vous voyez une page blanche après le login :

#### Vérification 1 : Console du navigateur
1. Ouvrez la console du navigateur (F12)
2. Regardez les erreurs JavaScript
3. Regardez les erreurs réseau (onglet Network)

#### Vérification 2 : LocalStorage
1. Ouvrez les DevTools (F12)
2. Allez dans l'onglet Application > Local Storage
3. Vérifiez que vous avez :
   - `token` : Le token JWT
   - `user` : L'objet utilisateur avec `role: "admin"`

Si `user` n'a pas `role: "admin"`, supprimez le localStorage et reconnectez-vous :
```javascript
localStorage.clear()
```

#### Vérification 3 : Réponse du backend
Ouvrez la console du navigateur et vérifiez la réponse de `/api/users/login` :
```javascript
{
  "_id": "...",
  "name": "TerFer Admin",
  "email": "adminterfer@gmail.com",
  "role": "admin",
  "token": "..."
}
```

#### Vérification 4 : Routes du backend
Testez l'API admin directement avec curl ou Postman :
```bash
# Récupérez d'abord votre token en vous connectant
curl -X POST http://localhost:5000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"email":"adminterfer@gmail.com","password":"adminterfer123"}'

# Utilisez le token pour tester l'endpoint admin
curl http://localhost:5000/api/admin/stats \
  -H "Authorization: Bearer VOTRE_TOKEN"
```

### 🐛 Problèmes courants et solutions

#### Problème : "Page blanche"
**Solution** : Vérifiez la console pour voir les erreurs. Souvent causé par :
- Backend non démarré
- Erreur dans un composant React
- Token expiré ou invalide

#### Problème : "Not authorized"
**Solution** :
- Vérifiez que le compte a `role: "admin"` dans MongoDB
- Vérifiez que le token est valide
- Reconnectez-vous pour obtenir un nouveau token

#### Problème : "Cannot read property 'role' of null"
**Solution** :
- L'utilisateur n'est pas connecté
- Supprimez le localStorage et reconnectez-vous
```javascript
localStorage.clear()
```

#### Problème : Redirection en boucle
**Solution** :
- Vérifiez que ProtectedRoute fonctionne correctement
- Vérifiez que le rôle de l'utilisateur est correct dans localStorage

### 📝 Test manuel complet

1. **Nettoyez le localStorage** :
   ```javascript
   localStorage.clear()
   ```

2. **Rechargez la page**

3. **Allez sur `/login`**

4. **Connectez-vous avec** :
   - Email: adminterfer@gmail.com
   - Password: adminterfer123

5. **Vérifiez la redirection** :
   - L'URL devrait changer vers `/admin/dashboard`
   - Vous devriez voir le dashboard admin avec :
     - Sidebar à gauche (TerFer Admin)
     - Statistiques (Total Utilisateurs, Boutiques, etc.)
     - Top 5 Vendeurs
     - Commandes Récentes

### 🎯 URLs de test

- Dashboard Admin : `http://localhost:5173/admin/dashboard`
- Gestion Clients : `http://localhost:5173/admin/users`
- Gestion Boutiques : `http://localhost:5173/admin/sellers`
- Gestion Produits : `http://localhost:5173/admin/products`
- Gestion Commandes : `http://localhost:5173/admin/orders`

### 🔐 Créer d'autres admins

Pour créer un autre compte admin, modifiez `backend/src/createAdmin.js` :
```javascript
const admin = await User.create({
    name: 'Nouveau Admin',
    email: 'autreadmin@example.com',
    password: 'password123',
    role: 'admin',
    isActive: true
});
```

Puis exécutez :
```bash
cd backend
node src/createAdmin.js
```

### 📞 Support

Si le problème persiste :
1. Partagez les erreurs de la console du navigateur
2. Partagez les erreurs du terminal backend
3. Vérifiez les logs dans le terminal frontend (Vite)
