# Configuration du Service Account pour le développement local

Pour que la génération d'illustrations fonctionne en développement local, vous devez configurer les credentials Firebase Admin.

## Étapes à suivre :

### 1. Télécharger la clé de service account

1. Allez sur la [Console Firebase](https://console.firebase.google.com/project/classemagique2/settings/serviceaccounts/adminsdk)
2. Cliquez sur l'onglet **"Comptes de service"**
3. Cliquez sur **"Générer une nouvelle clé privée"**
4. Confirmez en cliquant sur **"Générer la clé"**
5. Un fichier JSON sera téléchargé (ex: `classemagique2-firebase-adminsdk-xxxxx.json`)

### 2. Placer la clé dans le projet

1. Renommez le fichier téléchargé en `serviceAccountKey.json`
2. Placez-le à la racine du projet : `C:\Users\Manu\classemagique\serviceAccountKey.json`
3. **IMPORTANT** : Ne commitez JAMAIS ce fichier dans Git (il est déjà dans .gitignore)

### 3. Configurer la variable d'environnement

Ouvrez PowerShell et exécutez :

```powershell
$env:GOOGLE_APPLICATION_CREDENTIALS="C:\Users\Manu\classemagique\serviceAccountKey.json"
```

Puis lancez votre serveur de développement dans la même fenêtre PowerShell :

```powershell
npm run dev
```

### Alternative : Variable d'environnement permanente

Pour éviter de définir la variable à chaque fois, créez un fichier `.env.local` à la racine du projet :

```env
GOOGLE_APPLICATION_CREDENTIALS=C:\Users\Manu\classemagique\serviceAccountKey.json
```

## En production

En production (Firebase Hosting / Cloud Functions), les credentials sont automatiquement détectés. Vous n'avez pas besoin de cette configuration.

## Vérification

Une fois configuré, testez la génération d'illustrations dans la boîte à histoires. L'upload devrait maintenant fonctionner !
