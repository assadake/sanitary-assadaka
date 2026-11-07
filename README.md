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
| État | Context React maison — langue, panier et favoris en `localStorage` ; catalogue chargé depuis l’API |
| API | Express + Node.js — catalogue et enregistrement des commandes |
| Base de données | PostgreSQL Neon — produits et commandes |
| Hébergement | Render Web Service (serveur Node + SPA compilée) |
| Images | Pexels CDN (aucun binaire dans le dépôt) |

---

## 🚀 Déployer sur Render avec Neon

Le dépôt est préparé pour un déploiement **Render + Neon** : Render sert l’application et son API dans le même service, Neon héberge PostgreSQL. Au premier démarrage, le serveur crée les tables et importe le catalogue de démonstration si la table `products` est vide.

### 1. Créer la base PostgreSQL Neon

1. Créez un projet sur <https://neon.tech> (la région Frankfurt est proche de la Libye).
2. Dans **Connect**, choisissez la chaîne de connexion PostgreSQL (de préférence le *pooled connection string*), et copiez-la. Elle doit inclure `sslmode=require`.
3. Gardez cette URL privée : elle sera ajoutée dans Render, jamais dans le code ni dans une variable `VITE_*`.

### 2. Déployer le service Render

1. Poussez cette branche sur GitHub puis ouvrez <https://dashboard.render.com> → **New → Blueprint** (ou **New Web Service**) et sélectionnez le dépôt.
2. Le fichier **`render.yaml`** configure le service Node `tolin-shop`, région Frankfurt, commandes de build et démarrage, ainsi que le contrôle de santé `/api/health`.
3. Quand Render le demande, renseignez **`DATABASE_URL`** avec l’URL Neon copiée précédemment. Validez le déploiement.
4. Render construit le front (`npm ci && npm run build`), puis lance l’API (`npm start`). Ouvrez l’URL `*.onrender.com` et vérifiez `https://VOTRE-SERVICE.onrender.com/api/health` : le résultat attendu est `{"status":"ok"}`.

Le premier démarrage crée `products` et `orders`, puis peuple `products` avec le catalogue initial. Chaque demande est enregistrée dans Neon **avant** l’ouverture de WhatsApp ; le total et les prix sont recalculés côté serveur à partir des produits actifs. Une ligne `status = 'new'` signifie que la demande est enregistrée mais que le client doit encore confirmer l’envoi dans WhatsApp. Le navigateur n’a jamais accès aux identifiants de la base.

> Le plan gratuit Render peut mettre le service en veille après une période d’inactivité, ce qui rend la première visite plus lente. Les limites et tarifs des plans Render/Neon dépendent de leurs offres actuelles.

### Catalogue et commandes

Le catalogue public est lu depuis PostgreSQL à chaque chargement, donc les modifications faites dans Neon sont reflétées sur le site. Il n’y a pas encore de panneau d’administration ni d’API publique d’écriture des produits : gérez les produits depuis la console SQL Neon, et n’activez jamais une route d’administration sans authentification.

Exemples dans **Neon → SQL Editor** :

```sql
-- Voir les dernières commandes (les coordonnées client sont des données privées)
SELECT order_no, customer->>'name' AS customer, customer->>'phone' AS phone,
       subtotal, collection_mode, status, created_at
FROM orders ORDER BY created_at DESC LIMIT 50;

-- Désactiver temporairement un produit sans le supprimer
UPDATE products SET active = FALSE, updated_at = NOW() WHERE id = 'TL-1001';

-- Modifier le prix d'un produit (conserver le reste de son objet JSON)
UPDATE products
SET data = jsonb_set(data, '{price}', '3990'::jsonb), updated_at = NOW()
WHERE id = 'TL-1001';

-- Ajouter un produit (cat doit être un identifiant de catégorie existant)
INSERT INTO products (id, sort_order, data) VALUES (
  'TL-9001', 900,
  '{"id":"TL-9001","cat":"decor","name":{"ar":"مصباح طاولة","en":"Table lamp"},"desc":{"ar":"مصباح أنيق للمنزل.","en":"A stylish lamp for your home."},"price":450,"img":5974048,"origin":{"ar":"ألمانيا","en":"Germany"},"rating":4.5,"reviews":0,"stock":8,"dim":"22×8×24 cm","mat":{"ar":"فولاذ","en":"Steel"},"warranty":12}'::jsonb
);
```

Pour supprimer un produit de façon réversible, utilisez `active = FALSE`. Pour toute modification de nom, description, stock ou image, modifiez le champ correspondant de `products.data` (objet JSON bilingue pour `name`, `desc`, `origin` et `mat`). `src/data/catalog.ts` sert uniquement au premier remplissage de la base ; une fois le catalogue initialisé, effectuez les changements dans Neon. Les commandes conservent un instantané du produit et du prix au moment de la validation.

### Alternative : hébergement statique Vercel

`vercel.json` est conservé pour le front statique de démonstration. Pour l’API, la base Neon et l’enregistrement des commandes, utilisez le service Render défini dans `render.yaml` (ou adaptez Vercel en fonctions serveur avant de le choisir).

## 🧑‍💻 Développement local

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # génère dist/index.html (fichier unique)
npm start         # API + front compilé, avec DATABASE_URL
npm run preview   # sert le build de production
npx tsc --noEmit  # vérification de types
```

Un workflow **GitHub Actions** (`.github/workflows/ci.yml`) rejoue `npm install` + type-check + build à chaque push et conserve `dist/` comme artefact — utile pour vérifier un déploiement avant de le merger.

---

## 🛠 Personnaliser le contenu

| Ce que vous voulez changer | Fichier |
| --- | --- |
| **Numéro WhatsApp** | `src/i18n.ts` → `WHATSAPP_NUMBER` / `WHATSAPP_DISPLAY` |
| **Catalogue déjà déployé** (nom, prix, stock, origine, garantie…) | Console SQL Neon → table `products` (exemples ci-dessus) |
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
