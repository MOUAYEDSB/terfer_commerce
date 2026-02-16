# Guide MongoDB Atlas - Configuration Pas à Pas

## 📋 Étape 1 : Créer un compte MongoDB Atlas

1. **Aller sur** : https://www.mongodb.com/cloud/atlas/register
2. **S'inscrire** avec ton email (ou utiliser Google/GitHub)
3. **Choisir** "Build a Database" ou "Get started free"

---

## 📋 Étape 2 : Créer un cluster gratuit

1. **Choisir** "M0 FREE" (cluster gratuit)
2. **Choisir un provider** : AWS, Google Cloud, ou Azure
3. **Choisir une région** proche de toi (ex: `eu-west-1` pour l'Europe)
4. **Nom du cluster** : Laisser par défaut (ex: `Cluster0`) ou donner un nom
5. **Cliquer** sur "Create Deployment" (cela prend 3-5 minutes)

---

## 📋 Étape 3 : Créer un utilisateur de base de données

1. **Aller dans** "Database Access" (menu de gauche)
2. **Cliquer** sur "Add New Database User"
3. **Méthode d'authentification** : Choisir "Password"
4. **Username** : Entrer un nom (ex: `terfer_user`)
5. **Password** : 
   - Cliquer sur "Autogenerate Secure Password" OU
   - Créer ton propre mot de passe (note-le bien !)
6. **Rôle** : Choisir "Atlas Admin" (pour avoir tous les droits)
7. **Cliquer** sur "Add User"

⚠️ **IMPORTANT** : Note le username et password quelque part, tu en auras besoin !

---

## 📋 Étape 4 : Autoriser l'accès réseau

1. **Aller dans** "Network Access" (menu de gauche)
2. **Cliquer** sur "Add IP Address"
3. **Pour le développement** : Cliquer sur "Allow Access from Anywhere"
   - Cela ajoute `0.0.0.0/0` (toutes les IPs)
   - ⚠️ Pour la production, utilise seulement ton IP spécifique
4. **Cliquer** sur "Confirm"

---

## 📋 Étape 5 : Récupérer la connection string

1. **Retourner** dans "Database" (menu de gauche)
2. **Cliquer** sur "Connect" (bouton sur ton cluster)
3. **Choisir** "Connect your application"
4. **Driver** : Laisser "Node.js" et version "5.5 or later"
5. **Copier** la connection string qui ressemble à :
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

---

## 📋 Étape 6 : Mettre à jour le fichier .env

1. **Ouvrir** le fichier `backend/.env`
2. **Remplacer** la ligne `MONGO_URI` avec ta connection string
3. **Remplacer** `<username>` et `<password>` par tes identifiants de l'étape 3
4. **Ajouter** le nom de la base de données à la fin (avant `?`)

**Exemple** :
```env
MONGO_URI=mongodb+srv://terfer_user:MonMotDePasse123@cluster0.abc123.mongodb.net/terfer?retryWrites=true&w=majority
```

**Format complet** :
```
mongodb+srv://USERNAME:PASSWORD@CLUSTER.mongodb.net/DATABASE_NAME?retryWrites=true&w=majority
```

---

## 📋 Étape 7 : Tester la connexion

1. **Redémarrer** ton serveur backend :
   ```bash
   npm run dev
   ```

2. **Vérifier** que tu vois :
   ```
   MongoDB Connected: cluster0-shard-00-00.xxxxx.mongodb.net
   ```

3. **Si ça fonctionne** : ✅ Tu es prêt !

---

## 🔧 Dépannage

### Erreur : "Authentication failed"
- Vérifie que le username et password dans `.env` sont corrects
- Assure-toi qu'il n'y a pas d'espaces dans la connection string
- Les caractères spéciaux dans le password doivent être encodés en URL (%20 pour espace, %40 pour @, etc.)

### Erreur : "Network timeout"
- Vérifie que ton IP est autorisée dans "Network Access"
- Assure-toi d'avoir cliqué sur "Allow Access from Anywhere"

### Erreur : "Invalid connection string"
- Vérifie que la connection string commence par `mongodb+srv://`
- Vérifie qu'il n'y a pas d'espaces avant ou après
- Assure-toi que le nom de la base de données est ajouté avant le `?`

---

## 📝 Exemple de fichier .env complet

```env
PORT=5000
MONGO_URI=mongodb+srv://terfer_user:MonMotDePasse123@cluster0.abc123.mongodb.net/terfer?retryWrites=true&w=majority
JWT_SECRET=supersecretkey
NODE_ENV=development
```

---

## ✅ Checklist

- [ ] Compte MongoDB Atlas créé
- [ ] Cluster M0 FREE créé
- [ ] Utilisateur DB créé (username + password notés)
- [ ] IP autorisée (0.0.0.0/0 pour dev)
- [ ] Connection string copiée
- [ ] Fichier .env mis à jour
- [ ] Serveur redémarré
- [ ] Connexion réussie !
