 Voici la charte complète. Je l'ai construite pour que light et dark partagent le même ADN de marque (l'axe
  indigo→violet), juste exprimé différemment.

  ---
  🎨 Charte Graphique — SmartLife

  1. Philosophie & signature de marque

  L'idée centrale : SmartLife = un assistant personnel intelligent et apaisant. La marque vit sur un axe indigo → violet
  (#6366F1 → #7C3AED). Cet axe est le fil rouge — il doit apparaître dans les deux thèmes.

  ┌─────────────────────┬──────────────────────────────┬───────────────────────────────────────────────────────────┐
  │                     │   Dark mode (existant, on    │                   Light mode (NOUVEAU)                    │
  │                     │            garde)            │                                                           │
  ├─────────────────────┼──────────────────────────────┼───────────────────────────────────────────────────────────┤
  │ Signature visuelle  │ Glow néon sur fond           │ Ombres teintées indigo/violet + canvas lavande            │
  │                     │ quasi-noir                   │                                                           │
  ├─────────────────────┼──────────────────────────────┼───────────────────────────────────────────────────────────┤
  │ Base                │ Noir profond #070B14         │ Lavande très clair (pas blanc pur)                        │
  ├─────────────────────┼──────────────────────────────┼───────────────────────────────────────────────────────────┤
  │ Profondeur créée    │ Lueur + glass blur           │ Cartes blanches flottant sur canvas teinté + ombres       │
  │ par                 │                              │ colorées                                                  │
  ├─────────────────────┼──────────────────────────────┼───────────────────────────────────────────────────────────┤
  │ Énergie             │ Néon                         │ Pastels saturés + gradients vifs                          │
  └─────────────────────┴──────────────────────────────┴───────────────────────────────────────────────────────────┘

  ▎ Règle d'or du nouveau light mode : on ne met JAMAIS de blanc pur en fond de page, et les ombres ne sont JAMAIS
  ▎ grises — toujours teintées indigo/violet. C'est ça qui rend le thème « markant » tout en restant pro et reposant.

  ---
  2. Système de couleurs — Tokens sémantiques

  Ce sont les variables CSS à mettre dans :root (light) et :root.dark. Tes noms de tokens existent déjà — je ne fais que
  changer les valeurs light.

  🌞 Light mode (NOUVEAU)

  ┌────────────────────┬─────────────────────────────────────────────────────────┬──────────────────────────────────┐
  │       Token        │                         Valeur                          │               Rôle               │
  ├────────────────────┼─────────────────────────────────────────────────────────┼──────────────────────────────────┤
  │ --app-bg           │ #F5F4FD                                                 │ Canvas lavande très clair (≠     │
  │                    │                                                         │ blanc)                           │
  ├────────────────────┼─────────────────────────────────────────────────────────┼──────────────────────────────────┤
  │ --app-bg-gradient  │ radial-gradient(at 20% 0%, #EEF0FF 0%, #F5F4FD 40%,     │ Fond de page subtilement dégradé │
  │                    │ #F7F5FC 100%)                                           │                                  │
  ├────────────────────┼─────────────────────────────────────────────────────────┼──────────────────────────────────┤
  │ --surface          │ #FFFFFF                                                 │ Cartes (flottent sur le canvas)  │
  ├────────────────────┼─────────────────────────────────────────────────────────┼──────────────────────────────────┤
  │ --surface-elevated │ #FFFFFF                                                 │ Modales, popovers                │
  ├────────────────────┼─────────────────────────────────────────────────────────┼──────────────────────────────────┤
  │ --surface-muted    │ rgba(99,102,241,0.06)                                   │ Inputs, zones douces (teinte     │
  │                    │                                                         │ indigo, pas gris)                │
  ├────────────────────┼─────────────────────────────────────────────────────────┼──────────────────────────────────┤
  │ --surface-hover    │ rgba(99,102,241,0.11)                                   │ Survol                           │
  ├────────────────────┼─────────────────────────────────────────────────────────┼──────────────────────────────────┤
  │ --text-primary     │ #1C1A2E                                                 │ Charcoal violacé chaud (≠ slate  │
  │                    │                                                         │ froid)                           │
  ├────────────────────┼─────────────────────────────────────────────────────────┼──────────────────────────────────┤
  │ --text-secondary   │ #56526E                                                 │ Texte secondaire                 │
  ├────────────────────┼─────────────────────────────────────────────────────────┼──────────────────────────────────┤
  │ --text-muted       │ #928DA8                                                 │ Labels, placeholders             │
  ├────────────────────┼─────────────────────────────────────────────────────────┼──────────────────────────────────┤
  │ --border-subtle    │ rgba(99,102,241,0.15)                                   │ Bordures (teinte indigo)         │
  ├────────────────────┼─────────────────────────────────────────────────────────┼──────────────────────────────────┤
  │ --shadow-card      │ 0 10px 30px -8px rgba(99,102,241,0.22), 0 4px 12px -6px │ L'ombre teintée = signature      │
  │                    │  rgba(124,58,237,0.14)                                  │                                  │
  ├────────────────────┼─────────────────────────────────────────────────────────┼──────────────────────────────────┤
  │ --ring-focus       │ rgba(99,102,241,0.35)                                   │ Anneau de focus                  │
  └────────────────────┴─────────────────────────────────────────────────────────┴──────────────────────────────────┘

  🌙 Dark mode (INCHANGÉ — déjà bon)

  ┌────────────────────┬─────────────────────────────┐
  │       Token        │           Valeur            │
  ├────────────────────┼─────────────────────────────┤
  │ --app-bg           │ #070B14                     │
  ├────────────────────┼─────────────────────────────┤
  │ --surface          │ #0D1117                     │
  ├────────────────────┼─────────────────────────────┤
  │ --surface-elevated │ #0F1117                     │
  ├────────────────────┼─────────────────────────────┤
  │ --surface-muted    │ rgba(255,255,255,0.05)      │
  ├────────────────────┼─────────────────────────────┤
  │ --surface-hover    │ rgba(255,255,255,0.10)      │
  ├────────────────────┼─────────────────────────────┤
  │ --text-primary     │ #F1F5F9                     │
  ├────────────────────┼─────────────────────────────┤
  │ --text-secondary   │ #94A3B8                     │
  ├────────────────────┼─────────────────────────────┤
  │ --text-muted       │ #64748B                     │
  ├────────────────────┼─────────────────────────────┤
  │ --border-subtle    │ rgba(255,255,255,0.10)      │
  ├────────────────────┼─────────────────────────────┤
  │ --shadow-card      │ 0 8px 40px rgba(0,0,0,0.60) │
  └────────────────────┴─────────────────────────────┘

  🎯 Couleurs de marque (identiques dans les 2 thèmes)

  ┌────────────────┬────────────────────────────────────────────────┬──────────────────────────────────────────────┐
  │      Nom       │                      Hex                       │                    Usage                     │
  ├────────────────┼────────────────────────────────────────────────┼──────────────────────────────────────────────┤
  │ Brand Indigo   │ #6366F1                                        │ Accent principal, CTA                        │
  ├────────────────┼────────────────────────────────────────────────┼──────────────────────────────────────────────┤
  │ Brand Violet   │ #7C3AED                                        │ Fin du gradient                              │
  ├────────────────┼────────────────────────────────────────────────┼──────────────────────────────────────────────┤
  │ Gradient       │ linear-gradient(135deg, #6366F1 0%, #7C3AED    │ Boutons primaires, titres héros, éléments    │
  │ marque         │ 100%)                                          │ actifs                                       │
  ├────────────────┼────────────────────────────────────────────────┼──────────────────────────────────────────────┤
  │ Success        │ #10B981                                        │ Validations                                  │
  ├────────────────┼────────────────────────────────────────────────┼──────────────────────────────────────────────┤
  │ Warning        │ #F59E0B                                        │ Alertes douces                               │
  ├────────────────┼────────────────────────────────────────────────┼──────────────────────────────────────────────┤
  │ Danger         │ #EF4444                                        │ Erreurs, suppression                         │
  └────────────────┴────────────────────────────────────────────────┴──────────────────────────────────────────────┘

  ---
  3. Système d'accents par module

  Tu as 8 modules (Tasks, Agenda, Notes, Food, Reminders, Sleep, Social, Study). Chacun a une couleur d'identité. Pour
  chaque module, 4 valeurs : fond + texte, en light et dark.

  ┌───────────┬─────────┬───────────────────────┬───────────────┬───────────────────────┬──────────────┐
  │  Module   │ Couleur │     Light — fond      │ Light — texte │      Dark — fond      │ Dark — texte │
  ├───────────┼─────────┼───────────────────────┼───────────────┼───────────────────────┼──────────────┤
  │ Tasks     │ Indigo  │ rgba(99,102,241,0.10) │ #4F46E5       │ rgba(99,102,241,0.16) │ #A5B4FC      │
  ├───────────┼─────────┼───────────────────────┼───────────────┼───────────────────────┼──────────────┤
  │ Agenda    │ Violet  │ rgba(139,92,246,0.10) │ #7C3AED       │ rgba(139,92,246,0.16) │ #C4B5FD      │
  ├───────────┼─────────┼───────────────────────┼───────────────┼───────────────────────┼──────────────┤
  │ Notes     │ Sky     │ rgba(14,165,233,0.10) │ #0284C7       │ rgba(14,165,233,0.16) │ #7DD3FC      │
  ├───────────┼─────────┼───────────────────────┼───────────────┼───────────────────────┼──────────────┤
  │ Food      │ Emerald │ rgba(16,185,129,0.10) │ #059669       │ rgba(16,185,129,0.16) │ #6EE7B7      │
  ├───────────┼─────────┼───────────────────────┼───────────────┼───────────────────────┼──────────────┤
  │ Reminders │ Amber   │ rgba(245,158,11,0.12) │ #B45309       │ rgba(245,158,11,0.16) │ #FCD34D      │
  ├───────────┼─────────┼───────────────────────┼───────────────┼───────────────────────┼──────────────┤
  │ Sleep     │ Rose    │ rgba(244,63,94,0.10)  │ #E11D48       │ rgba(244,63,94,0.16)  │ #FDA4AF      │
  ├───────────┼─────────┼───────────────────────┼───────────────┼───────────────────────┼──────────────┤
  │ Social    │ Orange  │ rgba(249,115,22,0.10) │ #EA580C       │ rgba(249,115,22,0.16) │ #FDBA74      │
  ├───────────┼─────────┼───────────────────────┼───────────────┼───────────────────────┼──────────────┤
  │ Study     │ Cyan    │ rgba(6,182,212,0.10)  │ #0E7490       │ rgba(6,182,212,0.16)  │ #67E8F9      │
  └───────────┴─────────┴───────────────────────┴───────────────┴───────────────────────┴──────────────┘

  ▎ En dark mode, l'accent du module pilote aussi le glow (module-glow-* existant). En light mode, l'accent pilote la
  ▎ couleur de l'ombre de carte du module : remplace rgba(99,102,241,...) de --shadow-card par la couleur du module.
  ▎ C'est le pendant du glow.

  ---
  4. Typographie

  ┌──────────────┬───────────────────────────────────────┬──────────────────────────────────────────────────────────┐
  │    Niveau    │            Taille / poids             │                          Notes                           │
  ├──────────────┼───────────────────────────────────────┼──────────────────────────────────────────────────────────┤
  │ Police       │ Inter, system-ui, sans-serif          │ (déjà ta font-sans)                                      │
  ├──────────────┼───────────────────────────────────────┼──────────────────────────────────────────────────────────┤
  │ Display /    │ text-3xl→text-4xl, font-black,        │ Titres de page, peut recevoir le gradient marque en      │
  │ Hero         │ tracking-tight                        │ background-clip: text                                    │
  ├──────────────┼───────────────────────────────────────┼──────────────────────────────────────────────────────────┤
  │ H1 section   │ text-2xl font-bold                    │                                                          │
  ├──────────────┼───────────────────────────────────────┼──────────────────────────────────────────────────────────┤
  │ H2           │ text-lg font-semibold                 │                                                          │
  ├──────────────┼───────────────────────────────────────┼──────────────────────────────────────────────────────────┤
  │ Corps        │ text-sm / text-base, font-normal      │ --text-primary                                           │
  ├──────────────┼───────────────────────────────────────┼──────────────────────────────────────────────────────────┤
  │ Secondaire   │ text-sm, --text-secondary             │                                                          │
  ├──────────────┼───────────────────────────────────────┼──────────────────────────────────────────────────────────┤
  │ Label /      │ text-xs font-medium uppercase         │                                                          │
  │ caption      │ tracking-wide, --text-muted           │                                                          │
  ├──────────────┼───────────────────────────────────────┼──────────────────────────────────────────────────────────┤
  │ Chiffre stat │ text-4xl font-black                   │ ⚠️ corrige .stat-value : actuellement text-white         │
  │              │                                       │ hardcodé → doit être color: var(--text-primary)          │
  └──────────────┴───────────────────────────────────────┴──────────────────────────────────────────────────────────┘

  Titre héros avec gradient (les deux thèmes) :
  background: linear-gradient(135deg, #6366F1, #7C3AED);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;

  ---
  5. Échelle, rayons, élévation

  ┌────────────────────────┬──────────────────────────────────────────────────────────────────────────────────────┐
  │       Propriété        │                                        Valeur                                        │
  ├────────────────────────┼──────────────────────────────────────────────────────────────────────────────────────┤
  │ Unité d'espacement     │ base 4px (échelle Tailwind standard)                                                 │
  ├────────────────────────┼──────────────────────────────────────────────────────────────────────────────────────┤
  │ Rayon — cartes         │ 16px (rounded-2xl)                                                                   │
  ├────────────────────────┼──────────────────────────────────────────────────────────────────────────────────────┤
  │ Rayon — boutons/inputs │ 12px (rounded-xl)                                                                    │
  ├────────────────────────┼──────────────────────────────────────────────────────────────────────────────────────┤
  │ Rayon — badges/pills   │ 9999px (rounded-full)                                                                │
  ├────────────────────────┼──────────────────────────────────────────────────────────────────────────────────────┤
  │ Élévation 0 (canvas)   │ aucune ombre                                                                         │
  ├────────────────────────┼──────────────────────────────────────────────────────────────────────────────────────┤
  │ Élévation 1 (carte)    │ --shadow-card                                                                        │
  ├────────────────────────┼──────────────────────────────────────────────────────────────────────────────────────┤
  │ Élévation 2 (hover)    │ ombre +30% d'opacité + translateY(-2px)                                              │
  ├────────────────────────┼──────────────────────────────────────────────────────────────────────────────────────┤
  │ Élévation 3 (modale)   │ 0 24px 60px -12px rgba(99,102,241,0.30) (light) / 0 24px 60px rgba(0,0,0,0.7) (dark) │
  └────────────────────────┴──────────────────────────────────────────────────────────────────────────────────────┘

  ---
  6. Composants — specs

  Carte (.glass-card)

  - Light : background: #FFFFFF ; border: 1px solid var(--border-subtle) ; box-shadow: var(--shadow-card) ; rayon 16px.
  (pas de backdrop-blur en light — le blur sur fond clair ne sert à rien)
  - Dark : inchangé (glass + blur 24px).
  - Hover : translateY(-2px) + ombre renforcée.

  Bouton primaire (.btn-primary)

  - Identique aux 2 thèmes : linear-gradient(135deg,#6366F1,#7C3AED), texte blanc, rayon 12px.
  - Light hover : ombre teintée 0 8px 20px -4px rgba(99,102,241,0.45) (au lieu du glow néon dark).
  - Dark hover : glow inchangé.

  Bouton secondaire (.btn-secondary)

  - background: var(--surface-muted) ; border: 1px solid var(--border-subtle) ; texte --text-secondary → --text-primary
  au survol.

  Input (.input)

  - background: var(--surface-muted) ; bordure --border-subtle ; focus → border-indigo-500/60 + ring: var(--ring-focus).
  - ⚠️ corrige placeholder-gray-500 hardcodé → utiliser --text-muted.

  Badge / Pill de module

  - background: accent-light-bg du module ; color: accent-light-text ; rounded-full px-2.5 py-0.5 text-xs font-semibold.

  Header (.app-header)

  - background: color-mix(in srgb, var(--surface) 88%, transparent) + backdrop-blur (garde le blur ici, ça marche sur
  les deux).
  - Bordure basse --border-subtle.

  Modale / overlay

  - Backdrop light : rgba(28,26,46,0.35) (violacé, pas noir pur).
  - Backdrop dark : rgba(0,0,0,0.6).
  - Panneau : --surface-elevated, élévation 3, rayon 16px (plein écran < 640px, déjà géré).

  Navigation / item actif

  - Item actif : fond = accent-light-bg du module + barre/indicateur en gradient marque.
  - Item inactif : --text-secondary, hover --surface-hover.

  ---
  7. Mouvement

  ┌────────────────────┬──────────────────────────────────────────────────────────────┬──────────────────────────────┐
  │     Animation      │                            Valeur                            │            Usage             │
  ├────────────────────┼──────────────────────────────────────────────────────────────┼──────────────────────────────┤
  │ Apparition panneau │ fadeSlideIn 0.22s ease-out (existant)                        │ ouverture de cartes/panneaux │
  ├────────────────────┼──────────────────────────────────────────────────────────────┼──────────────────────────────┤
  │ Fade up            │ 0.3s ease-out                                                │ listes, items                │
  ├────────────────────┼──────────────────────────────────────────────────────────────┼──────────────────────────────┤
  │ Transitions hover  │ 200ms                                                        │ boutons, cartes              │
  ├────────────────────┼──────────────────────────────────────────────────────────────┼──────────────────────────────┤
  │ Glow pulse         │ 3s ease-in-out infinite                                      │ dark only                    │
  ├────────────────────┼──────────────────────────────────────────────────────────────┼──────────────────────────────┤
  │ Durée max          │ ≤ 300ms                                                      │ rester réactif, jamais lourd │
  ├────────────────────┼──────────────────────────────────────────────────────────────┼──────────────────────────────┤
  │ Respect            │ @media (prefers-reduced-motion) → désactiver translateY/glow │ accessibilité                │
  └────────────────────┴──────────────────────────────────────────────────────────────┴──────────────────────────────┘

  ---
  8. Accessibilité (non négociable)

  - Contraste texte principal sur surface : ≥ 4.5:1 (#1C1A2E sur #FFFFFF = ~15:1 ✅).
  - Texte d'accent module sur son fond pastel : vérifier ≥ 4.5:1 — c'est pour ça que les textes d'accent light sont
  assombris (#4F46E5, #0284C7…) vs le hex de base.
  - --ring-focus visible sur tous les éléments interactifs.
  - color-scheme déclaré (déjà fait) pour les contrôles natifs.

  ---
  9. Plan de migration (pour après la charte HTML)

  1. Remplacer le bloc :root (light) de index.css par les nouveaux tokens (§2).
  2. Ajouter --app-bg-gradient et l'appliquer sur body.
  3. Corriger .stat-value (text-white → var(--text-primary)) et .input (placeholder).
  4. Créer des classes utilitaires module-accent-* (bg + text) à partir du §3.
  5. Faire passer les panneaux legacy du « compatibility bridge » vers les tokens sémantiques, module par module (Food
  est déjà fait, c'est le modèle).

  ---
  Voilà la charte complète. Construis ton charte_graphic_SL.html à partir de ça — je te conseille d'y mettre côte à côte
  light/dark pour chaque composant (cartes, boutons, inputs, badges des 8 modules, modale, header) avec les hex
  affichés, ça te servira de référence vivante.

