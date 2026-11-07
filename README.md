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

## 📄 Licence

Code fourni à des fins de démonstration. Les visuels proviennent de **Pexels** (licence libre) et les marques citées appartiennent à leurs propriétaires.
