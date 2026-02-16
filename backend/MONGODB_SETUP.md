# Configuration MongoDB pour TerFer

## Option 1 : MongoDB Atlas (Cloud - Recommandé) ⭐

### Étapes :

1. **Créer un compte gratuit** sur [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)

2. **Créer un cluster gratuit (M0)**
   - Choisir un provider (AWS, Google Cloud, Azure)
   - Choisir une région proche (ex: Europe)
   - Cliquer sur "Create Cluster"

3. **Créer un utilisateur de base de données**
   - Aller dans "Database Access"
   - Cliquer sur "Add New Database User"
   - Choisir "Password" authentication
   - Créer un username et password (note-les !)
   - Rôle : "Atlas Admin" ou "Read and write to any database"
   - Cliquer sur "Add User"

4. **Autoriser l'accès réseau**
   - Aller dans "Network Access"
   - Cliquer sur "Add IP Address"
   - Pour le développement : cliquer sur "Allow Access from Anywhere" (0.0.0.0/0)
   - Cliquer sur "Confirm"

5. **Récupérer la connection string**
   - Aller dans "Database" → Cliquer sur "Connect"
   - Choisir "Connect your application"
   - Copier la connection string (elle ressemble à : `mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority`)

6. **Mettre à jour le fichier `.env`**
   ```env
   MONGO_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/terfer?retryWrites=true&w=majority
   ```
   ⚠️ Remplace `username` et `password` par tes identifiants créés à l'étape 3
   ⚠️ Remplace `cluster0.xxxxx` par ton nom de cluster
   ⚠️ Remplace `terfer` par le nom de ta base de données

---

## Option 2 : MongoDB Local (Installation)

### Windows :

1. **Télécharger MongoDB Community Server**
   - Aller sur https://www.mongodb.com/try/download/community
   - Choisir Windows x64
   - Télécharger le fichier `.msi`

2. **Installer MongoDB**
   - Exécuter le fichier `.msi`
   - Choisir "Complete" installation
   - Cocher "Install MongoDB as a Service"
   - Cocher "Run service as Network Service user"
   - Installer

3. **Vérifier que MongoDB est démarré**
   - Ouvrir "Services" (Win + R → `services.msc`)
   - Chercher "MongoDB"
   - Vérifier que le statut est "Running"

4. **Tester la connexion**
   ```bash
   mongosh
   ```
   Si ça fonctionne, MongoDB est bien installé !

5. **Le fichier `.env` devrait déjà être correct** :
   ```env
   MONGO_URI=mongodb://localhost:27017/terfer
   ```

---

## Après configuration

1. **Redémarrer le serveur backend** :
   ```bash
   npm run dev
   ```

2. **Vérifier la connexion** :
   Tu devrais voir : `MongoDB Connected: ...`

3. **Importer des données de test (optionnel)** :
   ```bash
   npm run data:import
   ```

---

## Dépannage

### Erreur : `ECONNREFUSED`
- MongoDB n'est pas démarré (local) ou la connection string est incorrecte (Atlas)

### Erreur : `Authentication failed`
- Vérifie le username/password dans la connection string Atlas
- Vérifie que l'utilisateur DB a les bonnes permissions

### Erreur : `Network timeout`
- Vérifie que ton IP est autorisée dans Network Access (Atlas)
- Vérifie ta connexion internet
