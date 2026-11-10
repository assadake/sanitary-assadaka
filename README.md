# تولين للبضائع الأروبية · TOLIN European Goods

Boutique en ligne mono-page (SPA) pour un magasin libyen de **produits de maison**, **électroménager importé d'Europe** et **outillage / bricolage** — basée à **Tripoli, Libye**.

Le catalogue est bilingue **arabe (RTL, langue principale) ⇄ anglais (LTR)**, et le panier d'achat se transforme en **commande détaillée envoyée sur WhatsApp** au **+218 91 344 2640** (aucun paiement en ligne).

> Ar · متجر ليبي متخصص في منتجات المنزل، الأجهزة الكهربائية الأوروبية وعدّة البريكولاج — طرابلس، ليبيا. الطلبات تُرسَل مباشرة عبر واتساب.

---

## ⚡ Stack

| Couche | Choix |
| --- | --- |
| Build | **Vite 7** + `vite-plugin-singlefile` (tout le site tient dans un seul `dist/index.html`) |
| UI | **React 19** + **TypeScript** (strict) |
| Style | **Tailwind CSS 4** (thème maison : `--color-ikea`, `--color-sun`, polices `font-display` / `font-sans`) |
| Typo | Noto Kufi Arabic (display) + IBM Plex Sans Arabic (texte) via Google Fonts |
| État | Context React maison (`src/store.tsx`) — langue, panier, favoris persistés en `localStorage` |
| Images | Pexels CDN (aucun binaire dans le dépôt) |

Aucune dépendance backend, aucune variable d'environnement requise.

---

## 🚀 Publier sur Vercel depuis GitHub

### 1. Créer le dépôt GitHub

```bash
git init
git add .
git commit -m "feat: TOLIN European Goods — boutique bilingue AR/EN avec commande WhatsApp"
git branch -M main
git remote add origin https://github.com/<VOTRE-COMPTE>/tolin-european-goods.git
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

Vercel → projet → **Settings → Domains** → ajouter `tolin-goods.ly` (ou `.com`), puis créer chez votre registrar :

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
npm run dev       # http://localhost:5173
npm run build     # génère dist/index.html (fichier unique)
npm run preview   # sert le build de production
npx tsc --noEmit  # vérification de types
```

Un workflow **GitHub Actions** (`.github/workflows/ci.yml`) rejoue `npm install` + type-check + build à chaque push et conserve `dist/` comme artefact — utile pour vérifier un déploiement avant de le merger.

---

## 🛠 Personnaliser le contenu

| Ce que vous voulez changer | Fichier |
| --- | --- |
| **Numéro WhatsApp** | `src/i18n.ts` → `WHATSAPP_NUMBER` / `WHATSAPP_DISPLAY` |
| **Produits** (nom, prix, stock, origine, garantie…) | `src/data/catalog.ts` → `PRODUCTS` |
| **Rayons / départements** | `src/data/catalog.ts` → `CATEGORIES` |
| **Pièces & carrousels d'inspiration** | `src/data/catalog.ts` → `ROOMS`, `STORIES` |
| **Textes de l'interface** (AR + EN) | `src/i18n.ts` → objets `ar` et `en` (mêmes clés) |
| **Adresse, horaires, FAQ** | `src/i18n.ts` (`showroom.*`, `faq*`) + `src/components/Showroom.tsx` (lien Google Maps) |
| **Couleurs & polices** | `src/index.css` → bloc `@theme` |
| **Modèle du message de commande** | `src/store.tsx` → `buildOrderMessage()` |

### Ajouter un produit

```ts
{ id: "TL-9001", cat: "diy",
  name: { ar: "اسم المنتج", en: "Product name" },
  desc: { ar: "الوصف", en: "Description" },
  price: 450, old: 520,            // `old` déclenche le badge de remise
  img: 5974048,                    // ID photo Pexels
  origin: { ar: "ألمانيا", en: "Germany" },
  rating: 4.6, reviews: 12, stock: 8,
  dim: "22×8×24 cm",
  mat: { ar: "فولاذ", en: "Steel" },
  warranty: 24,
  badge: "new" }                    // new | offer | best | import
```

Les prix sont affichés en **dinar libyen** (`formatPrice()` dans `src/i18n.ts`).

---

## 🧾 Comment fonctionne la commande

1. Le visiteur ajoute des produits au panier (persistant, même après fermeture du navigateur).
2. Il renseigne **nom, téléphone, ville, note** et choisit *livraison* ou *retrait au showroom*.
3. **`أرسل الطلب عبر واتساب`** génère un message structuré — référence `TL-<année>-<n°>`, date, lignes avec quantités et prix, total estimé, coordonnées — puis ouvre `https://wa.me/218913442640`.
4. Le client n'a plus qu'à appuyer sur *Envoyer* dans WhatsApp. Aucun paiement en ligne : **paiement à la livraison** ou virement.

---

## 🚀 Déployer sur Render (et diagnostiquer un déploiement « identique »)

`vercel.json` ne concerne **que Vercel** : Render ne lit ni `outputDirectory`, ni ses `rewrites`. Le build génère donc lui-même tout ce dont un hébergeur statique a besoin :

| Fichier produit | Rôle |
| --- | --- |
| `dist/index.html` | site complet (JS + CSS inline, `vite-plugin-singlefile`) |
| `dist/visite/index.html` | **vrai fichier** pour `/visite` : `<html lang="fr" dir="ltr">` + balises SEO statiques. Fonctionne **sans aucune règle de réécriture** |
| `dist/visite-360/*` | copie exacte des panoramas et du viewer Pannellum d'origine |
| `dist/deploy-info.json` | diagnostic : commit, branche et date du build réellement déployés |

### Réglages du service Render

Le dépôt est un site **statique** : `package.json` n'a **pas** de script `start`. Un *Web Service* avec `npm start` ne peut donc pas le servir.

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

**Vérification en 10 secondes** : ouvrir `https://<votre-domaine>/deploy-info.json`. Le champ `commit` doit être le SHA de `main` (après la PR #1 : `0277074…`). S'il affiche un autre SHA ou `branch: arena/a85f3eea-…`, corriger **Settings → Branch = main**, faire **Clear build cache**, puis **Manual Deploy**.

Dans le log de build, on doit voir `✓ built` et `dist/index.html  514.94 kB`.

### Checklist après déploiement

| URL | Attendu |
| --- | --- |
| `/` | site TOLIN avec le lien « Visite virtuelle 360° » |
| `/visite` ou `/visite/` | page noir + doré |
| `/visite/index.html` | la même page (fichier statique) |
| `/visite-360/index.html` | viewer Pannellum d'origine |
| `/visite-360/pano1.jpg` | JPEG 930 087 octets |
| `/deploy-info.json` | SHA de `main` |

> Le viewer charge Pannellum depuis `cdn.jsdelivr.net` et les polices depuis Google Fonts : ces CDN doivent être accessibles depuis le navigateur du visiteur (ils sont bloqués dans le sandbox de test uniquement).

---

## 📄 Licence

Code fourni à des fins de démonstration. Les visuels proviennent de **Pexels** (licence libre) et les marques citées appartiennent à leurs propriétaires.
