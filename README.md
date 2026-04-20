# MY QRCODER

> Générateur de QR Code installable (PWA), multilingue (FR / EN / SW), avec logo personnalisé, légende, mode sombre et téléchargement PNG.

🔗 **Demo en ligne** : [myqrcodebdi.lovable.app](https://myqrcodebdi.lovable.app)

---

## ✨ Fonctionnalités

- 🎯 **Génération de QR Code** à partir de n'importe quel lien (URL).
- 🖼️ **Logo personnalisé** au centre du QR code (avec fond blanc arrondi pour la lisibilité).
- 📝 **Légende optionnelle** affichée sous le QR code.
- 💙 **Charte Facebook Blue** (`#1877F2`) — design épuré, fond blanc pur.
- 🌗 **Mode sombre / clair** avec persistance dans `localStorage`.
- 🌍 **Multilingue** : Français 🇫🇷 / English 🇬🇧 / Kiswahili 🇹🇿.
- 📱 **PWA installable** (Android, iOS, Desktop) avec invite d'installation native.
- 💾 **Export PNG** haute qualité (correction d'erreur niveau H pour supporter le logo).

---

## 🛠️ Stack technique

| Domaine | Technologie |
|---|---|
| Framework | [React 18](https://react.dev/) + [Vite 5](https://vitejs.dev/) |
| Langage | [TypeScript 5](https://www.typescriptlang.org/) |
| Styles | [Tailwind CSS v3](https://tailwindcss.com/) + design tokens HSL |
| UI Kit | [shadcn/ui](https://ui.shadcn.com/) + [Radix UI](https://www.radix-ui.com/) |
| Icônes | [lucide-react](https://lucide.dev/) |
| QR Code | [`qrcode`](https://www.npmjs.com/package/qrcode) (canvas) |
| Notifications | [sonner](https://sonner.emilkowal.ski/) |
| Tests | [Vitest](https://vitest.dev/) |

---

## 🚀 Démarrage rapide

### Prérequis

- [Node.js](https://nodejs.org/) ≥ 18
- npm, [bun](https://bun.sh/) ou pnpm

### Installation

```bash
# 1. Cloner le dépôt
git clone <YOUR_GIT_URL>
cd <YOUR_PROJECT_NAME>

# 2. Installer les dépendances
npm install

# 3. Lancer le serveur de développement
npm run dev
```

L'application est disponible sur [http://localhost:8080](http://localhost:8080).

### Scripts disponibles

| Commande | Description |
|---|---|
| `npm run dev` | Serveur de développement (HMR) |
| `npm run build` | Build de production dans `dist/` |
| `npm run preview` | Prévisualise le build de production |
| `npm run lint` | Vérifie le code avec ESLint |
| `npm run test` | Lance la suite de tests Vitest |

---

## 📂 Structure du projet

```
.
├── public/
│   ├── manifest.json        # Manifeste PWA
│   ├── icon-192.png         # Icônes PWA
│   ├── icon-512.png
│   └── apple-touch-icon.png
├── src/
│   ├── assets/
│   │   └── logo.png         # Logo MY QRCODER
│   ├── components/
│   │   ├── InstallPrompt.tsx  # Invite d'installation PWA
│   │   └── ui/                # Composants shadcn/ui
│   ├── hooks/
│   │   └── useTheme.ts        # Gestion du thème clair/sombre
│   ├── pages/
│   │   ├── Index.tsx          # Page principale (générateur)
│   │   └── NotFound.tsx
│   ├── index.css              # Tokens design (HSL) + thème
│   └── main.tsx
├── index.html                 # Meta PWA, manifest, theme-color
└── tailwind.config.ts         # Couleurs sémantiques
```

---

## 🌍 Internationalisation

Les traductions sont définies dans `src/pages/Index.tsx` au sein d'un objet `translations` typé :

```ts
type Lang = "fr" | "en" | "sw";
const translations: Record<Lang, Record<string, string>> = { ... };
```

Pour ajouter une langue :
1. Ajouter une entrée dans `translations` (ex: `de: { ... }`).
2. Ajouter le code dans le tableau `LANGS` pour le sélecteur.

---

## 📱 PWA — Installation

L'application est une **Progressive Web App** complète :

- **Android / Chrome Desktop** : une bannière apparaît automatiquement en bas de l'écran (`InstallPrompt.tsx`) via l'événement `beforeinstallprompt`.
- **iOS Safari** : utiliser `Partager → Sur l'écran d'accueil`.

Le manifeste est défini dans `public/manifest.json` (nom, icônes, theme color `#1877F2`, mode `standalone`).

---

## 🎨 Design system

Toutes les couleurs sont définies en **HSL** dans `src/index.css` via des tokens sémantiques :

```css
--brand: 214 89% 52%;          /* Facebook blue */
--brand-foreground: 0 0% 100%;
--background: 0 0% 100%;       /* Blanc pur en clair */
--foreground: 222 47% 11%;
```

Le mode sombre est activé via la classe `.dark` sur `<html>` (gérée par le hook `useTheme`).

⚠️ **Règle** : ne jamais utiliser de couleurs en dur dans les composants (pas de `bg-white`, `text-black`). Toujours utiliser les tokens (`bg-background`, `text-foreground`, `bg-brand`, etc.).

---

## 🧪 Tests

```bash
npm run test
```

Configuration Vitest dans `vitest.config.ts`, exemple dans `src/test/example.test.ts`.

---

## 🚢 Déploiement

### Via Lovable

1. Ouvrir le projet sur [Lovable](https://lovable.dev/).
2. Cliquer sur **Share → Publish**.

### Hébergement personnalisé

Le projet est une SPA Vite standard, déployable partout (Vercel, Netlify, Cloudflare Pages, GitHub Pages…) :

```bash
npm run build
# Servir le contenu du dossier dist/
```

Pensez à configurer une règle de **rewrite** pour rediriger toutes les routes vers `index.html` (SPA fallback).

---

## 🤝 Contribuer

Les contributions sont les bienvenues !

1. Forker le projet
2. Créer une branche (`git checkout -b feat/ma-feature`)
3. Commiter (`git commit -m "feat: ajoute ma feature"`)
4. Pousser (`git push origin feat/ma-feature`)
5. Ouvrir une Pull Request

---

## 📄 Licence

MIT — libre d'utilisation, modification et distribution.

---

<p align="center">Built with ❤️ using <a href="https://lovable.dev">Lovable</a></p>
