Approche Claude complète — Feature Gating "Pro"

  ---
  1. Modèle de données

  Migration V17 :
  -- Plan sur l'utilisateur
  ALTER TABLE users ADD COLUMN plan VARCHAR(20) DEFAULT 'FREE';
  ALTER TABLE users ADD COLUMN plan_expires_at TIMESTAMP;

  -- Table des demandes d'accès
  CREATE TABLE plan_requests (
      id BIGSERIAL PRIMARY KEY,
      user_id BIGINT NOT NULL REFERENCES users(id),
      status VARCHAR(20) DEFAULT 'PENDING',  -- PENDING | APPROVED | REJECTED
      message TEXT,                           -- message optionnel du user
      reviewed_by BIGINT REFERENCES users(id),
      requested_at TIMESTAMP DEFAULT NOW(),
      reviewed_at TIMESTAMP
  );

  Plans : FREE | PRO | ADMIN

  ---
  2. Backend — enforcement + workflow

  Annotation custom :
  // Sur le contrôleur PromptController
  @RequiresPlan("PRO")
  @PostMapping("/api/prompt")
  public PromptResponse process(...) { ... }

  3 endpoints nouveaux :
  POST /api/plan/request        → user demande l'accès PRO
  GET  /api/admin/plan-requests → admin voit les demandes en attente
  PUT  /api/admin/plan-requests/{id}/approve|reject → admin statue

  Réponse d'erreur standardisée quand accès refusé :
  { "error": "PLAN_UPGRADE_REQUIRED", "currentPlan": "FREE", "requiredPlan": "PRO" }
  → Le frontend intercepte ce code spécifique et déclenche le bon modal.

  ---
  3. Frontend — UX progressive

  3 états visuels clairs :

  État FREE (jamais demandé)
  ┌─────────────────────────────────┐
  │  ✨ Assistant IA         [PRO]  │
  │                                 │
  │  Décrivez votre journée...      │
  │  (désactivé, cursor: not-allowed│
  │                                 │
  │  [ Débloquer l'accès →  ]       │
  └─────────────────────────────────┘

  État PENDING (demande envoyée)
  ┌─────────────────────────────────┐
  │  ✨ Assistant IA         [PRO]  │
  │                                 │
  │  ⏳ Votre demande est en cours  │
  │     de révision. Vous recevrez  │
  │     une notification dès        │
  │     l'approbation.              │
  └─────────────────────────────────┘

  État PRO (approuvé)
  ┌─────────────────────────────────┐
  │  ✨ Assistant IA         ✓ Pro  │
  │                                 │
  │  Décrivez votre journée...      │
  │  [ Envoyer ]                    │
  └─────────────────────────────────┘

  Modal "Débloquer" (quand le user clique) :
  - Liste des avantages PRO (IA, suggestions avancées, etc.)
  - Champ optionnel : "Pourquoi voulez-vous l'accès ?" (contexte pour toi)
  - Bouton "Envoyer ma demande"
  - Confirmation : "Demande envoyée ✓ — réponse sous 24-48h"

  ---
  4. Workflow admin

  Panel admin (page /admin accessible uniquement si plan=ADMIN) :

  Demandes en attente (3)
  ┌──────────────┬───────────┬────────────────────────┬───────────┐
  │ Utilisateur  │ Demandé   │ Message                │ Action    │
  ├──────────────┼───────────┼────────────────────────┼───────────┤
  │ alice@...    │ il y a 2h │ "J'utilise pour suivi  │ ✓  ✗      │
  │              │           │  nutritionnel perso"   │           │
  │ bob@...      │ il y a 5h │ —                      │ ✓  ✗      │
  └──────────────┴───────────┴────────────────────────┴───────────┘

  Un clic → approve/reject → email automatique à l'utilisateur.

  ---
  5. Notifications email

  ┌───────────────────┬────────────────────────────────────────┐
  │     Événement     │             Email envoyé à             │
  ├───────────────────┼────────────────────────────────────────┤
  │ Nouvelle demande  │ Toi (admin)                            │
  ├───────────────────┼────────────────────────────────────────┤
  │ Demande approuvée │ L'utilisateur                          │
  ├───────────────────┼────────────────────────────────────────┤
  │ Demande rejetée   │ L'utilisateur (avec message optionnel) │
  └───────────────────┴────────────────────────────────────────┘

  ---
  6. Évolutivité future

  Tout est prêt pour brancher Stripe plus tard :
  - plan_expires_at déjà en place → abonnement mensuel
  - plan_requests devient l'historique des souscriptions
  - Le check @RequiresPlan reste identique — seul le déclencheur change (paiement au lieu d'approbation manuelle)

  ---
  Résumé du travail :

  ┌─────────────────────────────────────────┬─────────┐
  │                 Couche                  │ Effort  │
  ├─────────────────────────────────────────┼─────────┤
  │ Migration V17                           │ ~10 min │
  ├─────────────────────────────────────────┼─────────┤
  │ Backend (annotation + 3 endpoints)      │ ~1h     │
  ├─────────────────────────────────────────┼─────────┤
  │ Frontend (badge + modal + état pending) │ ~1h30   │
  ├─────────────────────────────────────────┼─────────┤
  │ Admin panel                             │ ~1h     │
  ├─────────────────────────────────────────┼─────────┤
  │ Emails                                  │ ~30 min │
  └─────────────────────────────────────────┴─────────┘

  
 Approche codex Recommandée

  Créer une notion de AI Access par utilisateur :

  - FREE : pas d’accès complet, mais accès limité à quelques essais.
  - APPROVED : accès gratuit parce que tu as approuvé le compte manuellement.
  - PREMIUM : accès payant.
  - ADMIN : accès illimité pour toi.
  - BLOCKED : IA désactivée pour abus ou test.

  Ensuite, au lieu d’un simple bouton bloqué, tu rends l’expérience plus professionnelle :

  Quand l’utilisateur n’a pas accès :

  - le bouton Prompt IA reste visible ;
  - il peut cliquer ;
  - une modal s’ouvre avec :
      - “Assistant IA SmartLife”
      - exemples de ce que ça peut faire : créer tâches, notes, repas, sport, rappels ;
      - son statut actuel : Essai gratuit utilisé, Accès non activé, etc. ;
      - bouton Demander l'accès ou Passer Premium.

  Quand l’utilisateur est en essai :

  - il a par exemple 5 prompts IA gratuits.
  - après chaque prompt : 4 essais restants.
  - après épuisement : accès bloqué avec upgrade/request.

  Quand l’utilisateur est approuvé :

  - accès complet, mais avec rate limit raisonnable, par exemple 30 prompts / jour.

  Quand l’utilisateur est premium :

  - plus de quota, ou quota élevé : 300 prompts / mois.

  Modèle Pro

  Côté base de données, ajoute sur users ou une table dédiée :

  ai_access_status: FREE | APPROVED | PREMIUM | ADMIN | BLOCKED
  ai_monthly_quota
  ai_monthly_used
  ai_trial_used
  ai_access_expires_at

  Encore mieux : une table séparée user_ai_entitlements :

  user_id
  status
  plan_name
  monthly_quota
  used_this_month
  approved_by
  approved_at
  expires_at

  C’est plus propre si tu veux évoluer vers Stripe plus tard.

  Expérience Utilisateur

  Je ferais ça comme une fonctionnalité premium élégante :

  - Dans le dashboard, le prompt IA est affiché avec un petit badge :
      - IA
      - Premium
      - ou 3 essais restants
  - Si l’accès est refusé, ne montre pas une erreur brute.
  - Affiche une modal claire :
      - “L’assistant IA est une fonctionnalité avancée.”
      - “Il transforme vos phrases en actions, repas, notes et séances.”
      - bouton Demander l'accès
      - bouton futur Activer Premium

  Tu peux même ajouter une file d’attente simple :

  ai_access_requests
  - user_id
  - message
  - status: PENDING | APPROVED | REJECTED
  - created_at

  Comme ça, l’utilisateur clique Demander l'accès, et toi tu approuves depuis admin ou directement en base.

  Approche Créative

  Tu peux appeler ça SmartLife Copilot ou Smart Assistant.

  Au lieu de vendre “un prompt IA”, tu vends des résultats :

  - “Transformer une idée en tâches”
  - “Analyser un repas”
  - “Créer une séance sport”
  - “Résumer ma journée”
  - “Planifier ma semaine”

  Et chaque action consomme 1 crédit IA.

  Exemple :

  - Free : 5 crédits offerts
  - Premium : 300 crédits / mois
  - Approved : 100 crédits / mois
  - Admin : illimité

  C’est plus intuitif qu’un blocage technique.

  Priorité Technique

  Je recommande cette implémentation en 3 étapes :

  1. Backend : ajouter contrôle d’accès avant /api/prompt et endpoints IA nutrition/sport si nécessaire.
  2. Frontend : afficher statut IA, crédits restants, modal d’accès.
  3. Admin simple : endpoint pour approuver un utilisateur ou modifier son quota.

  La règle importante : le contrôle doit être backend, pas seulement frontend. Le frontend améliore l’expérience, mais
  le backend doit refuser réellement les appels IA non autorisés.
