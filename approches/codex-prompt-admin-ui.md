# Codex Prompt — Admin UI pour les demandes d'accès IA (SmartLife)

## Contexte

Projet SmartLife : React + TypeScript + Vite + TailwindCSS + TanStack Query.
Frontend : `frontend/src/`

Le backend expose ces endpoints admin (authentifiés, réservés aux comptes ADMIN) :

```
GET /api/admin/ai/requests
→ retourne liste de demandes PENDING :
[
  {
    "id": 1,
    "user": { "id": 2, "email": "alice@example.com", "firstName": "Alice", "lastName": "Dupont" },
    "status": "PENDING",
    "message": "Je veux l'accès pour mon suivi nutritionnel",
    "requestedAt": "2026-05-28T14:30:00"
  }
]

PUT /api/admin/ai/requests/{id}/approve
body (optionnel) : { "status": "APPROVED", "monthlyQuota": 100 }
→ approuve la demande

PUT /api/admin/ai/requests/{id}/reject
→ rejette la demande
```

Le statut IA de l'utilisateur connecté est disponible via :
```
GET /api/ai-access/status → { "status": "ADMIN", ... }
```
Il est déjà en cache TanStack Query avec la clé `['ai-access-status']`.

---

## Objectif

Ajouter un panneau admin dans `DashboardPage.tsx` visible uniquement pour les comptes ADMIN,
avec la liste des demandes en attente et les boutons Approuver / Rejeter.

---

## Fichier à modifier

`frontend/src/pages/DashboardPage.tsx` uniquement.
Ne pas créer de nouveau fichier.

---

## Étape 1 — Ajouter le panel 'admin' au Dashboard

### Type Panel

Ajouter `'admin'` au type `Panel` et à `VALID_PANELS` :

```typescript
type Panel = 'home' | 'agenda' | 'prompt' | 'tasks' | 'reminders' | 'notes' | 'contacts' | 'food' | 'diary' | 'workout' | 'admin'
const VALID_PANELS: Panel[] = [..., 'admin']
```

### Import icône

Ajouter `ShieldCheck` depuis lucide-react dans les imports existants.

### Nav item admin

Dans le tableau `navItems`, ajouter conditionnellement l'item admin **seulement si** `aiStatus?.status === 'ADMIN'` :

```typescript
...(aiStatus?.status === 'ADMIN' ? [{ id: 'admin' as Panel, label: 'Admin IA', icon: ShieldCheck }] : [])
```

L'ajouter à la fin du tableau `navItems`.

### MODULE_ACCENT et MODULE_GRADIENT

Ajouter les entrées `admin` dans ces deux objets :

```typescript
MODULE_ACCENT: { ..., admin: 'text-emerald-400' }
MODULE_GRADIENT: { ..., admin: 'from-emerald-500 via-teal-500 to-cyan-500' }
```

### Validation

```powershell
npm.cmd run build
```

---

## Étape 2 — Ajouter les queries et mutations admin

### useQuery pour les demandes en attente

```typescript
const { data: pendingRequests = [], refetch: refetchRequests } = useQuery({
  queryKey: ['admin-ai-requests'],
  queryFn: () => api.get('/admin/ai/requests').then((r) => r.data),
  enabled: aiStatus?.status === 'ADMIN',
})
```

### useMutation approve

```typescript
const approveMutation = useMutation({
  mutationFn: (id: number) =>
    api.put(`/admin/ai/requests/${id}/approve`, { status: 'APPROVED', monthlyQuota: 100 }),
  onSuccess: () => {
    toast.success('Accès approuvé.')
    refetchRequests()
  },
  onError: () => toast.error('Erreur lors de l\'approbation.'),
})
```

### useMutation reject

```typescript
const rejectMutation = useMutation({
  mutationFn: (id: number) =>
    api.put(`/admin/ai/requests/${id}/reject`),
  onSuccess: () => {
    toast.success('Demande rejetée.')
    refetchRequests()
  },
  onError: () => toast.error('Erreur lors du rejet.'),
})
```

### Validation

```powershell
npm.cmd run build
```

---

## Étape 3 — Implémenter le panneau admin

### Emplacement

Ajouter le bloc `{activePanel === 'admin' && (...)}` juste avant la fermeture du `</div>` contenant les autres panneaux.

### Interface à afficher

#### Cas : aucune demande en attente

```
┌────────────────────────────────────────┐
│  ✓  Aucune demande en attente          │
│  Tout est à jour.                      │
└────────────────────────────────────────┘
```

#### Cas : demandes présentes

En-tête :
- Titre : "Demandes d'accès IA" avec le badge nombre (ex: `3`)
- Sous-titre : "Approuvez ou rejetez les demandes d'accès au Prompt IA."

Tableau ou liste de cartes (une par demande) :

Chaque carte contient :
- Avatar initiale (première lettre de l'email) dans un cercle coloré
- Nom complet (firstName + lastName) ou email si nom absent
- Email en petit (gris)
- Message de la demande (si présent) en italique, limité à 3 lignes
- Date de la demande (formatée en français, ex: "28 mai 2026 à 14h30")
- Bouton `Approuver` → vert, appelle `approveMutation.mutate(request.id)`, disabled si pending
- Bouton `Rejeter` → rouge outlined, appelle `rejectMutation.mutate(request.id)`, disabled si pending

Appliquer dark mode et responsive (mobile = cartes empilées, desktop = grid 2 colonnes ou liste).

### Validation

```powershell
npm.cmd run build
```

---

## Contraintes

- Modifier uniquement `frontend/src/pages/DashboardPage.tsx`.
- Ne pas créer de nouveau fichier.
- Respecter dark mode (`dark:`), responsive (`sm:`, `md:`).
- Ne pas casser les autres panneaux existants.
- Le panneau admin ne doit s'afficher que si `aiStatus?.status === 'ADMIN'`.
- Le nav item "Admin IA" ne doit apparaître dans la sidebar que si ADMIN.
- Vérification finale obligatoire : `npm.cmd run build`.
