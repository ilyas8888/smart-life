Approche Codex :

  La bonne direction selon moi : une section sociale utile, contrôlée et orientée “progression personnelle partagée”,
  pas un mini-Instagram.

  Avis Produit

  Les utilisateurs ne veulent pas forcément “poster leur vie”. Ils veulent surtout :

  - partager un programme gym avec un ami ;
  - montrer une recette ou un food diary à un coach ;
  - recevoir un avis sur une journée alimentaire ;
  - partager un journal avec un thérapeute, un proche ou eux-mêmes via lien ;
  - suivre un défi avec quelqu’un ;
  - commenter un plan, une routine, une recette ou une progression ;
  - garder le contrôle total sur ce qui est visible.

  Donc la vraie demande n’est pas seulement “likes/commentaires/partages”. La vraie demande est :

  > “Aide-moi à progresser avec d’autres personnes, sans perdre le contrôle de mes données.”

  C’est ça qu’il faut résoudre.

  Approche Recommandée

  Je proposerais une section centrale appelée Together ou Social, mais structurée en 4 niveaux.

  1. Partage Privé Par Lien

  C’est la base la plus importante.

  L’utilisateur peut partager :

  - journal ;
  - food diary ;
  - programme gym ;
  - recette ;
  - séance workout ;
  - progression hebdomadaire ;
  - plan study ;
  - sleep summary.

  Options au moment du partage :

  - lecture seule ;
  - autoriser commentaires ;
  - autoriser réactions ;
  - expiration : 24h, 7 jours, 30 jours, jamais ;
  - lien révocable ;
  - masquer les calories, le poids, les notes privées, etc. ;
  - public par lien ou seulement utilisateurs SmartLife invités.

  Ça résout directement les besoins réels : coach, ami, nutritionniste, partenaire d’entraînement, famille.

  2. Collections Partagées

  Au lieu de poster des éléments isolés, l’utilisateur peut créer une collection :

  - “Mes recettes protéinées” ;
  - “Programme Push Pull Legs” ;
  - “Mon suivi Ramadan nutrition” ;
  - “Préparation summer cut” ;
  - “Routine sommeil productive” ;
  - “Journal mental privé avec coach”.

  Chaque collection peut contenir plusieurs ressources SmartLife.

  C’est plus professionnel qu’un simple feed, parce que ça transforme le social en outil de collaboration.

  3. Interactions Utiles

  Oui aux likes/commentaires/partages, mais pas partout de façon générique.

  Je ferais plutôt :

  - réactions rapides : utile, inspirant, à tester, bravo ;
  - commentaires contextuels ;
  - questions/réponses sur une recette ou un programme ;
  - possibilité de cloner une recette ou un programme ;
  - possibilité de sauvegarder dans “Mes inspirations” ;
  - partage externe par lien ;
  - signalement d’un contenu public.

  Pour SmartLife, le bouton le plus puissant n’est pas “Like”. C’est :

  > “Utiliser dans mon plan”

  Exemples :

  - cloner un programme gym ;
  - ajouter une recette à mes repas ;
  - transformer une routine en template ;
  - copier une checklist ;
  - sauvegarder un journal comme inspiration privée.

  4. Feed Intelligent, Mais Plus Tard

  Je ne commencerais pas par un feed public global. Je le mettrais en phase 2 ou 3.

  Quand il existe, il doit être filtré par intention :

  - Nutrition ;
  - Gym ;
  - Recettes ;
  - Journaux anonymisés ;
  - Défis ;
  - Templates ;
  - Progressions.

  Pas un flux chaotique.

  Chaque post doit être une vraie ressource actionnable, pas juste du texte.

  Exemple :

  - “Recette : bowl poulet riz avocat”
  - bouton Ajouter à mes recettes
  - macros visibles
  - commentaires
  - variantes
  - sauvegarde

  Ou :

  - “Programme : 4 jours hypertrophie”
  - bouton Cloner
  - aperçu séances
  - commentaires
  - niveau : débutant/intermédiaire/avancé

  Architecture Produit Idéale

  Je structurerais la section Social comme ça :

  - Mes partages : tout ce que j’ai partagé, avec vues, expiration, révocation.
  - Partagé avec moi : ressources reçues par lien ou invitation.
  - Inspirations : contenus sauvegardés.
  - Communauté : feed public/privé plus tard.
  - Défis : objectifs partagés, par exemple 7 jours nutrition, 30 jours gym, sommeil régulier.

  Priorité De Développement

  Je ferais dans cet ordre :

  1. shared_links générique pour partager n’importe quelle ressource.
  2. Page publique read-only propre et responsive.
  3. Révocation + expiration + permissions.
  4. Commentaires optionnels sur un lien partagé.
  5. Réactions simples.
  6. Clonage de ressources : programme, recette, routine.
  9. Défis privés.
  10. Feed communautaire public, seulement quand les fondations sont solides.

  Mon Choix Final

  La meilleure version pour SmartLife serait :

  > Une section Social privée-first, centrée sur le partage de ressources utiles, avec commentaires, réactions, clonage
  > et collections, plutôt qu’un réseau social public classique.

  C’est plus pro, plus différenciant, plus sûr, et beaucoup plus aligné avec les besoins réels des utilisateurs de
  SmartLife.

Approche Claude Code :
 Mon avis honnête

  Le risque principal avec "j'aime + commentaires + partages" sur une app santé : on reproduit un Instagram fade. Les
  utilisateurs ont déjà Instagram. Ce qui tue les social features dans ces apps c'est le cold-start (feed vide =
  personne ne poste), la comparaison toxique (calories, poids visibles), et des interactions sans valeur réelle (un ❤️
  n'aide pas quelqu'un à s'améliorer).

  Ce qui fonctionne vraiment dans les apps santé sociale : Strava (partage contextualisé), MyFitnessPal (recettes
  clonables), Fitbit (défis entre amis). Le fil commun : le contenu a de la valeur au-delà du social — on peut cloner un
  programme, copier une recette, rejoindre un défi.

  ---
  Approche recommandée : "SmartLife Community"

  Philosophie : Share what you built. Clone what inspires you.

  Pas un feed de photos. Un hub de contenu interactif organisé par type, où chaque post a une utilité concrète.

  ---
  Architecture en 3 couches

  ┌─────────────────────────────────────────────────────┐
  │  LAYER 1 — FEED COMMUNAUTAIRE                       │
  │  Cartes riches par type + filtres + trending        │
  ├─────────────────────────────────────────────────────┤
  │  LAYER 2 — INTERACTIONS CONTEXTUELLES               │
  │  Réactions typées + Commentaires utiles + Clone     │
  ├─────────────────────────────────────────────────────┤
  │  LAYER 3 — PROFIL + ACCOUNTABILITY                  │
  │  Stats publiques opt-in + badges + suivis           │
  └─────────────────────────────────────────────────────┘

  ---
  Types de posts (contenu avec valeur réelle)

  ┌────────────────────┬───────────────────────────────────────────────────┬────────────────────────┐
  │        Type        │                Ce qui est partagé                 │       Action clé       │
  ├────────────────────┼───────────────────────────────────────────────────┼────────────────────────┤
  │ 💪 Programme sport │ Plan complet (jours/exercices/sets)               │ Cloner dans mon app    │
  ├────────────────────┼───────────────────────────────────────────────────┼────────────────────────┤
  │ 🍳 Recette         │ Ingrédients + macros/100g + étapes                │ Ajouter à mes aliments │
  ├────────────────────┼───────────────────────────────────────────────────┼────────────────────────┤
  │ 🍎 Journée food    │ Résumé macros + top 3 repas (pas calories brutes) │ Réaction + commentaire │
  ├────────────────────┼───────────────────────────────────────────────────┼────────────────────────┤
  │ 📚 Session étude   │ Topic + durée + score focus + ce qu'on a appris   │ Réaction               │
  ├────────────────────┼───────────────────────────────────────────────────┼────────────────────────┤
  │ 😴 Streak sommeil  │ N nuits consécutives ≥ 7h qualité ≥ 4             │ Encouragement          │
  ├────────────────────┼───────────────────────────────────────────────────┼────────────────────────┤
  │ 🏆 Personal record │ "Nouveau record : 100kg bench"                    │ 👏                     │
  └────────────────────┴───────────────────────────────────────────────────┴────────────────────────┘

  ---
  Interactions — pas de ❤️ générique

  Au lieu de "like", des réactions typées :

  💪 Inspiré    🍎 Je teste    👏 Bravo    ❓ Comment tu fais ?

  → Chaque réaction donne une info utile à l'auteur. Beaucoup moins toxique que le compteur de likes.

  ---
  Composants UI clés

  1. Feed principal (onglet "Communauté")
  - Filtres : Tout · Sport · Nutrition · Étude · Sommeil · Tendances
  - Tri : Récent · Populaire · Suivi
  - Cards riches avec preview du contenu + stats

  2. Card post (exemple programme sport)
  ┌────────────────────────────────────────┐
  │ 👤 Alex M.  •  il y a 2h              │
  │ 💪 Programme partagé                   │
  │ ─────────────────────────────────────  │
  │ "Force Upper/Lower 4j/semaine"         │
  │ 4 semaines · 4j/sem · 32 exercices    │
  │ Objectif: Prise de masse              │
  │ ─────────────────────────────────────  │
  │ [💪 12 Inspiré] [❓ 3] [💬 7]         │
  │              [Cloner ce programme →]   │
  └────────────────────────────────────────┘

  3. Commentaires orientés utilité
  - Pas de thread infini — 1 niveau de réponse
  - @mention supporté
  - Modération : signalement simple

  4. Profil public (opt-in total)
  - Bio + stats choisies (ex: "45 sessions cette année", "32 recettes partagées")
  - Badges automatiques (streak sommeil, sessions étude, programmes clonés par d'autres)
  - Contenus publiés
  - Bouton Suivre

  5. Composer modal
  - Sélection du type de contenu
  - Preview avant publication
  - Visibilité : 🌍 Public · 👥 Abonnés · 🔒 Privé
  - Tag optionnel : #keto #powerlifting #spacedrep

  ---
  Schéma DB (V31-V33)

  -- V31
  social_profiles     (user_id PK, username UNIQUE, bio, is_public, followers_count, following_count)
  social_follows      (follower_id, following_id, created_at)

  -- V32
  social_posts        (id, author_id, type ENUM, title, summary, content_data JSONB,
                       resource_type, resource_id, visibility ENUM,
                       likes_count, comments_count, clones_count, created_at)
  social_reactions    (post_id, user_id, reaction_type ENUM[INSPIRED,TRYING,BRAVO,QUESTION], created_at)
  social_saves        (post_id, user_id, created_at)
  social_clones       (post_id, user_id, created_at)  -- track ce qui est cloné

  -- V33
  social_comments     (id, post_id, author_id, parent_id, content, likes_count, created_at)
  social_comment_likes(comment_id, user_id, created_at)
  social_notifications(id, recipient_id, sender_id, type ENUM, post_id, comment_id, read, created_at)

  ---
  Plan d'implémentation en 4 sprints

  ┌────────┬───────────────────────────────────────────────────┬────────────────────────────────┐
  │ Sprint │                      Contenu                      │         Valeur livrée          │
  ├────────┼───────────────────────────────────────────────────┼────────────────────────────────┤
  │ S1     │ social_profiles + social_posts + feed + composer  │ Publier + lire le feed         │
  ├────────┼───────────────────────────────────────────────────┼────────────────────────────────┤
  │ S2     │ Réactions + commentaires + signalement            │ Interagir avec le contenu      │
  ├────────┼───────────────────────────────────────────────────┼────────────────────────────────┤
  │ S3     │ Clone programmes/recettes + saves + notifications │ La vraie valeur différenciante │
  ├────────┼───────────────────────────────────────────────────┼────────────────────────────────┤
  │ S4     │ Follows + profils publics + badges + trending     │ Rétention + viralité           │
  └────────┴───────────────────────────────────────────────────┴────────────────────────────────┘

  ---
  Ce qu'on évite volontairement

  - ❌ Compteur de calories/poids visible publiquement (comparaison toxique)
  - ❌ Algorithme "pour toi" complexe (on commence par chronologique + trending simple)
  - ❌ Photos de repas obligatoires (pas Instagram)
  - ❌ Public par défaut (toujours opt-in)

  ---