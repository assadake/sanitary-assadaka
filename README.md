# شركة الصداقة الراقية · Assadaka Alraqia

Site vitrine statique, mono-page (SPA), pour **شركة الصداقة الراقية / Assadaka Alraqia**
à **Tripoli, Libye** : **مواد صحية وسيراميك** (articles sanitaires, carrelage,
robinetterie, douches, WC, baignoires, matériaux de finition), avec **visite
virtuelle 360°** du showroom.

Catalogue bilingue **arabe (RTL, langue principale) ⇄ anglais (LTR)**. Les
demandes de renseignement / devis partent sur **WhatsApp +218 91-3150095**
(`wa.me/218913150095`) ; **aucun paiement en ligne**, **aucun prix publié** :
modèles, prix et disponibilités se confirment avec la société.

> Ar · شركة ليبية متخصصة في المواد الصحية والسيراميك ومواد البناء — طرابلس، ليبيا. الاستفسارات تُرسَل مباشرة عبر واتساب.

---

## ⚡ Stack

| Couche | Choix |
| --- | --- |
| Build | **Vite 7** + `vite-plugin-singlefile` (tout le site tient dans un seul `dist/index.html`) |
| UI | **React 19** + **TypeScript** (strict) |
| Style | **Tailwind CSS 4** (thème maison : `--color-ikea`, `--color-sun`, polices `font-display` / `font-sans`) |
| Typo | Noto Kufi Arabic (display) + IBM Plex Sans Arabic (texte) via Google Fonts |
| État | Context React maison (`src/store.tsx`) — langue, panier, favoris persistés en `localStorage` |
| Images | Pexels CDN + `public/brands/` + panoramas `public/visite360/` (intouchables) |

Aucune dépendance backend, **aucune base de données**, aucune migration, aucune variable d'environnement requise.

---

## 🚀 Publier sur Vercel depuis GitHub

### 1. Créer le dépôt GitHub

```bash
git init
git add .
git commit -m "feat: Assadaka Alraqia — site bilingue AR/EN + visite 360°"
git branch -M main
git remote add origin https://github.com/<VOTRE-COMPTE>/sanitary-assadaka.git
git push -u origin main
```

> `dist/`, `node_modules/` et `.vercel/` sont déjà exclus par le `.gitignore`.
> Si vous générez un `package-lock.json` (`npm install` en local), commitez-le puis remplacez
> `installCommand` par `npm ci` dans `vercel.json` : builds plus rapides et reproductibles.

### 2. Importer dans Vercel

1. <https://vercel.com/new> → **Import Git Repository** → choisir le dépôt.
2. Vercel détecte **Vite** automatiquement. Vérifiez :

   | Champ | Valeur |
   | --- | --- |
   | Framework Preset | `Vite` |
   | Build Command | `npm run build` |
   | Output Directory | `dist` |
   | Install Command | `npm install` |
   | Node.js Version | `20.x` ou plus |

   Ces valeurs sont déjà figées dans **`vercel.json`** — rien à saisir manuellement.
3. **Deploy**. Chaque `git push` sur `main` redéploie la production ; les pull requests obtiennent une *Preview URL*.

### 3. Domaine personnalisé (optionnel)

Vercel → projet → **Settings → Domains** → ajouter votre nom de domaine Assadaka, puis créer chez votre registrar :

- `A` → `76.76.21.21` ( apex ) ou
- `CNAME` → `cname.vercel-dns.com` ( `www` / sous-domaine )

### Alternative sans GitHub : CLI Vercel

```bash
npm i -g vercel
vercel          # preview
vercel --prod   # production
```

---

## 🧑‍💻 Développement local

```bash
npm install
npm install
npm run dev       # http://localhost:5173 → / , /visite , /visite-360/index.html
npm run typecheck # vérification de types
npm run build     # génère dist/index.html + dist/visite/index.html + dist/visite-360/*
npm run preview   # sert le build de production
npm start         # serveur statique natif pour Render (PORT)
```

Un workflow **GitHub Actions** (`.github/workflows/ci.yml`) rejoue `npm install` + type-check + build à chaque push et conserve `dist/` comme artefact — utile pour vérifier un déploiement avant de le merger.

---

## 🛠 Personnaliser le contenu

| Ce que vous voulez changer | Fichier |
| --- | --- |
| **Numéro WhatsApp** | `src/i18n.ts` → `WHATSAPP_NUMBER` / `WHATSAPP_DISPLAY` |
| **Produits** (nom, modèle, prix sur demande, disponibilité…) | `src/data/catalog.ts` → `PRODUCTS` |
| **Rayons / départements** | `src/data/catalog.ts` → `CATEGORIES` |
| **Idées de salles de bain & guides d'achat** | `src/data/catalog.ts` → `ROOMS`, `STORIES` |
| **Textes de l'interface** (AR + EN) | `src/i18n.ts` → objets `ar` et `en` (mêmes clés) |
| **Adresse, horaires, FAQ** | `src/i18n.ts` (`showroom.*`, `faq*`) + `app/visite/config.ts` et `src/components/Showroom.tsx` (lien Google Maps) |
| **Couleurs & polices** | `src/index.css` → bloc `@theme` |
| **Modèle du message de demande / devis** | `src/store.tsx` → `buildOrderMessage()` |

### Ajouter un article sanitaire

```ts
{ id: "AS-9001", cat: "sanitary",
  name: { ar: "اسم المنتج", en: "Product name" },
  desc: { ar: "الوصف مع تأكيد الموديل والتوفر", en: "Description; confirm model and availability" },
  price: null,                    // prix sur demande (aucun prix publié)
  img: 11701114,                  // ID photo Pexels
  origin: { ar: "حسب الموديل", en: "Model dependent" },
  rating: null, reviews: 0, stock: null,
  dim: "حسب الموديل",
  mat: { ar: "سيراميك", en: "Ceramic" },
  warranty: null,
  badge: "new" }                   // new | offer | best | import
```

`price`, `rating`, `stock` et `warranty` peuvent être `null` : l'interface affiche
alors une demande de renseignement au lieu d'inventer une valeur. Les champs
sont validés par `npm run typecheck`.

---

## 🧾 Comment fonctionne la demande

1. Le visiteur parcourt les 35 articles, ajoute ses références au panier (persistant).
2. Il renseigne **nom, téléphone, ville, note** et choisit *livraison* ou *retrait au showroom*.
3. Le bouton d'envoi génère un message structuré — référence `AS-<année>-<n°>`, date,
   lignes avec quantités, modèles et prix « sur demande », coordonnées — puis ouvre
   `https://wa.me/218913150095`.
4. La société confirme **modèle, prix, disponibilité et garantie** sur WhatsApp.
   Aucun paiement en ligne, aucune commande ferme depuis le site.

---

## 🏢 Identité et contenu : شركة الصداقة الراقية / Assadaka Alraqia

Le site statique de `main` est **entièrement rebrandé** au nom de la société
**Assadaka Alraqia** (الصداقة الراقية), spécialisée en **مواد صحية وسيراميك**
(articles sanitaires, carrelage, robinetterie, matériaux de finition).

| Donnée | Valeur | Où la modifier |
| --- | --- | --- |
| Nom société | `شركة الصداقة الراقية` / `Assadaka Alraqia` | `src/i18n.ts` (`brand.*`), `index.html` (SEO/OG) |
| WhatsApp | **`218913150095`** — affiché `+218 91-3150095` | `src/i18n.ts` (`WHATSAPP_NUMBER`, `WHATSAPP_DISPLAY`) et `app/visite/config.ts` |
| Page Facebook | `https://www.facebook.com/AssadakaARAQIA/` | `src/components/Footer.tsx` |
| Google Maps | recherche « Assadaka Alraqia sanitary ware Tripoli Libya » | `app/visite/config.ts`, `src/components/Showroom.tsx`, `Showroom360.tsx` |
| Marques | `IDEAL · TURKUAZ · CeraStyle` (+ logos locaux dans `public/brands/`) | `src/data/catalog.ts` (`HERO_STATS`, `TICKER_KEYS`) |
| Catalogue | **35 articles sanitaires** (`AS-xxxx`), 8 catégories, **prix sur demande** | `src/data/catalog.ts` |

⚠️ Le catalogue Assadaka **ne publie pas de prix** : `price: null` affiche
« السعر عند الاستفسار / Price on request » ; aucune remise, aucune note ni
stock inventé. Les modèles, prix, disponibilités et garanties se confirment
avec la société sur WhatsApp.

**Aucune base de données, aucune migration, aucune variable d'environnement,
aucune nouvelle dépendance npm.** Le site reste 100 % statique.

### ⚠️ Deux bases de code dans ce dépôt — ne pas les confondre

| | **`main`** (site déployé sur `sanitary-assadaka.onrender.com`) | **`arena/a85f3eea-sanitary-assadaka`** (ancien service `tolin-shop`) |
| --- | --- | --- |
| Type | **Static Site** Render, Publish `dist` | **Web Service** Node/Express |
| Base de données | **Aucune** — catalogue local dans `src/data/catalog.ts` | **Neon PostgreSQL** via `DATABASE_URL`, tables `products` / `orders` / `app_settings` |
| Identité | **Assadaka Alraqia** — مواد صحية وسيراميك | Assadaka Alraqia (contenu administrable en BDD) |
| Visite 360° | ✅ `/visite` + viewer intact `/visite-360/index.html` | ❌ absente |

👉 Si un domaine affiche un autre nom ou d'anciens articles, c'est qu'il pointe
vers **l'autre service** : vérifier `Settings → Branch` et la section
**Custom Domains** de chaque service. Ce n'est **pas** un problème de base de
données côté site statique : il n'en utilise aucune, et aucune migration n'a été
faite (consigne : ne pas toucher à la BDD).

## 🚀 Déployer sur Render (et diagnostiquer un déploiement « identique »)

`vercel.json` ne concerne **que Vercel** : Render ne lit ni `outputDirectory`, ni ses `rewrites`. Le build génère donc lui-même tout ce dont un hébergeur statique a besoin :

| Fichier produit | Rôle |
| --- | --- |
| `dist/index.html` | site complet (JS + CSS inline, `vite-plugin-singlefile`) |
| `dist/visite/index.html` | **vrai fichier** pour `/visite` : `<html lang="fr" dir="ltr">` + balises SEO statiques. Fonctionne **sans aucune règle de réécriture** |
| `dist/visite-360/*` | copie exacte des panoramas et du viewer Pannellum d'origine |
| `dist/deploy-info.json` | diagnostic : commit, branche et date du build réellement déployés |

### Réglages du service Render

Le déploiement recommandé est un **Static Site** (`runtime: static`). Le script `npm start` fourni (`scripts/serve.mjs`, zéro dépendance) permet aussi de servir `dist/` depuis un ancien *Web Service* si l'on ne peut pas créer un nouveau service.

| Paramètre | Valeur |
| --- | --- |
| Type | **Static Site** (`runtime: static`) |
| **Branch** | **`main`** |
| Root Directory | *(vide)* |
| Build Command | `npm ci && npm run build` |
| Publish Directory | `dist` |
| Auto-Deploy | activé |
| Redirects/Rewrites | `/*` → `/index.html`, type **Rewrite** (utile pour de futures routes ; les fichiers réels restent servis en priorité) |

Ces valeurs sont versionnées dans **`render.yaml`**. Deux pièges : un Blueprint ne s'applique qu'à un service **créé depuis ce fichier**, et toute modification de `render.yaml` demande un **Sync manuel** du Blueprint dans Render (un simple redeploy ne recharge pas la configuration du service).

### Si vous gardez le Web Service existant (sans créer de Static Site)

Render ne permet **pas** de transformer un Web Service en Static Site après coup. Pour éviter de créer un nouveau projet, vous pouvez garder le service actuel à condition de corriger sa source :

| Champ | Valeur |
| --- | --- |
| **Branch** | **`main`** |
| Root Directory | **champ vide** (ne pas écrire `vide`) |
| Build Command | `npm ci && npm run build` |
| Start Command | `npm start` |

Le script `start` (`scripts/serve.mjs`) est fourni : **zéro dépendance**, Node natif, il sert `dist/` sur `0.0.0.0:$PORT` avec fallback SPA (`/visite`, `/…` → `index.html`) et `no-cache` sur `index.html` / `deploy-info.json`. Render injecte `PORT` automatiquement : aucune variable d'environnement à créer.

Si ce service reste sur l'ancienne branche `arena/a85f3eea-…`, il continuera à construire l'ancien site quel que soit le nombre de "Manual Deploy".

### Deux déploiements manuels qui donnent le même résultat

La cause la plus fréquente : le service surveille **une autre branche** (un service Render `tolin-shop` a été vu attaché à `arena/a85f3eea-sanitary-assadaka`, une branche avec `server/` + Express/Neon). Un « Manual Deploy » reconstruit alors cette branche, quel que soit le nombre de fois où on le relance.

**Vérification en 10 secondes** : ouvrir `https://<votre-domaine>/deploy-info.json`. Le champ `commit` doit être le SHA courant de `main`. S'il affiche un autre SHA ou `branch: arena/a85f3eea-…`, corriger **Settings → Branch = main**, faire **Clear build cache**, puis **Manual Deploy**.

⚠️ Sur un **Static Site créé à la main dans le Dashboard**, `render.yaml` (et donc ses en-têtes `no-cache`) ne s'applique **pas** : `deploy-info.json` peut rester en cache CDN alors que le nouveau build est déjà en ligne. Dans ce cas, ajouter manuellement la règle d'en-tête `Cache-Control: no-cache` pour `/deploy-info.json`, ou vérifier directement le contenu de `/visite` et l'onglet **Events** du Dashboard.

Dans le log de build, on doit voir `✓ built` et `dist/index.html` (~520 kB).

### Checklist après déploiement

| URL | Attendu |
| --- | --- |
| `/` | site **Assadaka** avec le lien « Visite virtuelle 360° » |
| `/visite` ou `/visite/` | page noir + doré |
| `/visite/index.html` | la même page (fichier statique) |
| `/visite-360/index.html` | viewer Pannellum d'origine |
| `/visite-360/pano1.jpg` | JPEG 930 087 octets |
| `/deploy-info.json` | SHA de `main` |

> Le viewer charge Pannellum depuis `cdn.jsdelivr.net` et les polices depuis Google Fonts : ces CDN doivent être accessibles depuis le navigateur du visiteur (ils sont bloqués dans le sandbox de test uniquement).

---

## 📄 Licence

Code fourni à des fins de démonstration. Les visuels proviennent de **Pexels** (licence libre) et les marques citées appartiennent à leurs propriétaires.
