  ---
  Approche finale déduite — "SmartLife Together"

  Ce que les deux approches confirment ensemble

  Les deux rejettent le modèle Instagram classique et convergent sur un seul principe :

  ▎ Le contenu doit avoir une utilité concrète. Le social n'est que le vecteur.

  ---
  Architecture unifiée (5 zones)

  Section "Together"
  ├── 📤 Mes Partages        → liens créés, collections, expiration, révocation
  ├── 📥 Partagé avec moi    → ressources reçues via lien ou invitation
  ├── 🌍 Communauté          → feed filtré, cartes actionnables, réactions, clonage
  ├── 🔖 Inspirations        → contenu sauvegardé
  └── 🏁 Défis               → challenges privés/publics avec invite_code

  ---
  Décisions clés tirées des deux approches

  ┌─────────────────┬───────────────────────────────────────────────────┬───────────────────────────────────────────┐
  │    Décision     │                   Choix retenu                    │                  Raison                   │
  ├─────────────────┼───────────────────────────────────────────────────┼───────────────────────────────────────────┤
  │ Point de départ │ Liens partageables (Codex)                        │ Résout cold-start, valeur immédiate sans  │
  │                 │                                                   │ communauté                                │
  ├─────────────────┼───────────────────────────────────────────────────┼───────────────────────────────────────────┤
  │ Réactions       │ Typées (Claude) : Inspiré / Je teste / Bravo /    │ Plus utile qu'un ❤️ générique             │
  │                 │ Comment tu fais                                   │                                           │
  ├─────────────────┼───────────────────────────────────────────────────┼───────────────────────────────────────────┤
  │ Action          │ Clone / "Utiliser dans mon plan" (les deux)       │ Différenciateur produit réel              │
  │ principale      │                                                   │                                           │
  ├─────────────────┼───────────────────────────────────────────────────┼───────────────────────────────────────────┤
  │ Données         │ Masquage opt-in des calories/poids (Codex)        │ Privacy + anti-comparaison toxique        │
  │ sensibles       │                                                   │                                           │
  ├─────────────────┼───────────────────────────────────────────────────┼───────────────────────────────────────────┤
  │ Feed            │ Plus tard, filtré par type (les deux)             │ Éviter le flux chaotique dès le début     │
  ├─────────────────┼───────────────────────────────────────────────────┼───────────────────────────────────────────┤
  │ Collections     │ Grouper plusieurs ressources ensemble (Codex)     │ Plus pro qu'un post isolé                 │
  ├─────────────────┼───────────────────────────────────────────────────┼───────────────────────────────────────────┤
  │ Acquisition     │ Bouton "Créer mon compte" sur vue publique        │ Viralité organique                        │
  │                 │ (Claude)                                          │                                           │
  └─────────────────┴───────────────────────────────────────────────────┴───────────────────────────────────────────┘

  ---
  Roadmap définitive — 4 sprints

  ┌────────┬─────────────────────────────────────────────────────────────────┬──────────────────────────────────────┐
  │ Sprint │                             Contenu                             │          Ce que ça débloque          │
  ├────────┼─────────────────────────────────────────────────────────────────┼──────────────────────────────────────┤
  │ S1     │ shared_links + page publique read-only + révocation +           │ Partager avec coach, ami,            │
  │        │ expiration + masquage données sensibles                         │ nutritionniste — sans app            │
  ├────────┼─────────────────────────────────────────────────────────────────┼──────────────────────────────────────┤
  │ S2     │ "Partagé avec moi" entre users + Collections + Clonage          │ Collaboration réelle entre           │
  │        │ programme/recette                                               │ utilisateurs SmartLife               │
  ├────────┼─────────────────────────────────────────────────────────────────┼──────────────────────────────────────┤
  │ S3     │ Feed communauté filtré + Réactions typées + Commentaires +      │ Social layer complet                 │
  │        │ Inspirations                                                    │                                      │
  ├────────┼─────────────────────────────────────────────────────────────────┼──────────────────────────────────────┤
  │ S4     │ Profil public opt-in + Badges + Défis de groupe (invite_code) + │ Rétention + acquisition virale       │
  │        │  Smart Day Score anonymisé                                      │                                      │
  └────────┴─────────────────────────────────────────────────────────────────┴──────────────────────────────────────┘

  ---
  Schéma DB consolidé (V31→V34)

  -- V31 : Fondation partage privé
  shared_links (id, owner_id, resource_type, resource_id, token UUID, title,
                permissions JSONB, mask_calories BOOL, expires_at, revoked,
                view_count, created_at)

  -- V32 : Communauté
  social_profiles  (user_id PK, username UNIQUE, bio, avatar_url, is_public,
                    followers_count, following_count)
  social_posts     (id, author_id, type ENUM, title, summary, content_data JSONB,
                    resource_type, resource_id, visibility ENUM,
                    reactions_count, comments_count, clones_count, saves_count, created_at)
  social_collections (id, owner_id, title, description, visibility, item_count, created_at)
  social_collection_items (collection_id, resource_type, resource_id, order_index)

  -- V33 : Interactions
  social_reactions     (post_id, user_id, type ENUM[INSPIRED,TRYING,BRAVO,HOW], created_at)
  social_clones        (post_id, user_id, cloned_resource_id, created_at)
  social_saves         (post_id, user_id, created_at)
  social_comments      (id, post_id, author_id, parent_id, content, likes_count, created_at)
  social_comment_likes (comment_id, user_id, created_at)
  social_follows       (follower_id, following_id, created_at)

  -- V34 : Défis + Notifications
  challenges              (id, creator_id, title, type, target, start_date, end_date,
                           invite_code, is_public, participant_count)
  challenge_participants  (challenge_id, user_id, joined_at, progress, completed)
  social_notifications    (id, recipient_id, sender_id, type ENUM, ref_id, read, created_at)

  ---


