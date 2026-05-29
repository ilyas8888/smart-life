# SmartLife - Plan frontend par etapes pour l'acces Prompt IA

## Objectif

Adapter le frontend SmartLife au systeme backend d'acces au Prompt IA :

- afficher le statut d'acces IA de l'utilisateur ;
- montrer les essais restants pour les comptes `FREE` ;
- bloquer proprement l'usage si l'essai est epuise ou si le compte est `BLOCKED` ;
- permettre une demande d'acces complet ;
- afficher les statuts `APPROVED`, `PREMIUM` et `ADMIN` comme des plans actifs ;
- gerer proprement les erreurs `403 AI_ACCESS_DENIED` retournees par le backend.

Backend deja disponible :

- `GET /api/ai-access/status`
- `POST /api/ai-access/request`
- `POST /api/prompt`, qui peut retourner `403` avec `error: "AI_ACCESS_DENIED"`

---

## Reponse backend attendue

`GET /api/ai-access/status` retourne une forme proche de :

```json
{
  "status": "FREE",
  "planName": "Free",
  "trialUsed": 3,
  "trialQuota": 5,
  "monthlyUsed": 0,
  "monthlyQuota": 100,
  "lastRequestStatus": "NONE"
}
```

Statuts possibles :

- `FREE`
- `APPROVED`
- `PREMIUM`
- `ADMIN`
- `BLOCKED`

Statuts de demande possibles :

- `NONE`
- `PENDING`
- `APPROVED`
- `REJECTED`

---

## Contraintes globales

- Ne modifier que :
  - `frontend/src/pages/DashboardPage.tsx`
  - `frontend/src/components/HomePanel.tsx`
- Ne pas creer de nouveau fichier.
- Ne pas modifier le backend dans ce chantier.
- Ne pas ajouter de bibliotheque.
- Utiliser TanStack Query deja present.
- Utiliser `api` existant depuis `frontend/src/api/axios.ts`.
- Utiliser uniquement les icones lucide-react deja presentes plus `Lock` si necessaire.
- Respecter le style existant Tailwind, dark mode et responsive.
- Ne pas modifier la sidebar, le header ou les autres panneaux hors zones Prompt IA.
- Verification finale obligatoire : `npm.cmd run build`.

---

## Etape 1 - Audit frontend cible

### Objectif

Lire les deux fichiers cibles et identifier precisement les zones a modifier avant toute edition.

### Fichiers a lire

- `frontend/src/pages/DashboardPage.tsx`
- `frontend/src/components/HomePanel.tsx`

### A verifier

- imports actuels ;
- presence de `useQuery` / `useMutation` ;
- mutation actuelle de `POST /api/prompt` ;
- bloc `{activePanel === 'prompt' && (...)}` ;
- card Prompt IA dans `HomePanel`.

### Validation

Aucune compilation necessaire a cette etape.

### Permission a donner

```text
Permission frontend etape 1 : auditer DashboardPage et HomePanel.
```

---

## Etape 2 - Types et statut IA dans DashboardPage

### Objectif

Ajouter dans `DashboardPage.tsx` les bases de donnees frontend necessaires sans encore remplacer l'interface.

### Fichier a modifier

- `frontend/src/pages/DashboardPage.tsx`

### Changements

- Ajouter `Lock` aux imports lucide-react si necessaire.
- Ajouter un type local `AiAccessStatus`.
- Ajouter `useQuery` pour :

```typescript
api.get('/ai-access/status')
```

- Ajouter les states :

```typescript
const [showAccessModal, setShowAccessModal] = useState(false)
const [accessMessage, setAccessMessage] = useState('')
```

- Ajouter des helpers locaux simples :
  - calcul essais restants ;
  - test acces prompt actif ;
  - label plan.

### Validation

```powershell
npm.cmd run build
```

### Permission a donner

```text
Permission frontend etape 2 : ajouter le statut IA dans DashboardPage.
```

---

## Etape 3 - Mutation de demande d'acces dans DashboardPage

### Objectif

Permettre a l'utilisateur de soumettre une demande d'acces IA depuis le dashboard.

### Fichier a modifier

- `frontend/src/pages/DashboardPage.tsx`

### Changements

- Ajouter `requestAccessMutation`.
- Appeler :

```typescript
api.post('/ai-access/request', { message })
```

- En cas de succes :
  - afficher un toast de succes ;
  - fermer la modal ;
  - vider `accessMessage` ;
  - refetch `ai-access-status`.

- En cas d'erreur :
  - afficher le message backend si disponible ;
  - sinon afficher une erreur generique.

### Validation

```powershell
npm.cmd run build
```

### Permission a donner

```text
Permission frontend etape 3 : ajouter la demande d'acces IA dans DashboardPage.
```

---

## Etape 4 - Gestion du 403 Prompt IA

### Objectif

Faire reagir l'UI proprement quand `POST /api/prompt` retourne `AI_ACCESS_DENIED`.

### Fichier a modifier

- `frontend/src/pages/DashboardPage.tsx`

### Changements

- Modifier le `onError` de `promptMutation`.
- Si HTTP `403` :
  - refetch le statut IA ;
  - afficher `Acces IA insuffisant.`
- Sinon :
  - garder une erreur generique de traitement prompt.

### Validation

```powershell
npm.cmd run build
```

### Permission a donner

```text
Permission frontend etape 4 : gerer le refus 403 du Prompt IA.
```

---

## Etape 5 - Remplacer le panneau Prompt IA du Dashboard

### Objectif

Afficher les bons etats visuels dans le panneau Prompt IA.

### Fichier a modifier

- `frontend/src/pages/DashboardPage.tsx`

### Etats a gerer

#### 1. `BLOCKED`

- card centree ;
- icone `Lock` rouge ;
- titre : `Acces desactive` ;
- message : `Votre acces au Prompt IA a ete desactive.` ;
- aucun bouton d'action.

#### 2. `FREE` avec essais restants

- formulaire prompt normal ;
- badge amber : `X essais restants` ;
- lien ou bouton discret : `Demander l'acces complet`.

#### 3. `FREE` epuise + demande `PENDING`

- card centree ;
- titre : `Demande en cours de revision` ;
- message d'attente ;
- aucun bouton d'envoi prompt.

#### 4. `FREE` epuise + pas de demande pending

- card centree ;
- icone `Lock` ;
- titre : `Essai gratuit epuise` ;
- message avec nombre d'essais utilises ;
- bouton `Demander l'acces complet` ;
- si `lastRequestStatus === 'REJECTED'`, afficher une note indiquant que l'utilisateur peut refaire une demande.

#### 5. `APPROVED`, `PREMIUM`, `ADMIN`

- formulaire prompt normal ;
- badge plan :
  - `Pro` pour `APPROVED`
  - `Premium` pour `PREMIUM`
  - `Admin` pour `ADMIN`
- compteur mensuel discret pour `APPROVED` et `PREMIUM`.

### Validation

```powershell
npm.cmd run build
```

### Permission a donner

```text
Permission frontend etape 5 : remplacer le panneau Prompt IA du Dashboard.
```

---

## Etape 6 - Ajouter la modal de demande d'acces

### Objectif

Ajouter une modal professionnelle et claire pour demander l'acces complet.

### Fichier a modifier

- `frontend/src/pages/DashboardPage.tsx`

### Comportement

La modal s'affiche si :

```typescript
showAccessModal === true
```

### Contenu

- titre : `Demander l'acces au Prompt IA`
- description courte :
  - `L'assistant IA transforme vos phrases en taches, repas, sport et journal.`
- liste de capacites :
  - creer des taches et rappels ;
  - logger repas et nutrition ;
  - enregistrer seances sport ;
  - ecrire dans le journal.
- textarea optionnel :
  - `Pourquoi souhaitez-vous l'acces ? (optionnel)`
- bouton :
  - `Envoyer la demande`
- bouton :
  - `Annuler`

### Interaction

- clic overlay ferme la modal ;
- bouton annuler ferme la modal ;
- bouton envoyer appelle `requestAccessMutation.mutate(accessMessage)` ;
- bouton envoyer disabled pendant pending.

### Validation

```powershell
npm.cmd run build
```

### Permission a donner

```text
Permission frontend etape 6 : ajouter la modal de demande d'acces IA.
```

---

## Etape 7 - Statut IA dans HomePanel

### Objectif

Rendre la card Prompt IA du HomePanel coherente avec le statut utilisateur.

### Fichier a modifier

- `frontend/src/components/HomePanel.tsx`

### Changements

- Ajouter `Lock` aux imports lucide-react si necessaire.
- Ajouter `useQuery` pour `GET /ai-access/status`.
- Ajouter les memes helpers simples si utiles :
  - essais restants ;
  - prompt disponible ;
  - label plan.

### Validation

```powershell
npm.cmd run build
```

### Permission a donner

```text
Permission frontend etape 7 : ajouter le statut IA dans HomePanel.
```

---

## Etape 8 - Remplacer la card Prompt IA du HomePanel

### Objectif

Adapter la card d'accueil selon l'etat IA.

### Fichier a modifier

- `frontend/src/components/HomePanel.tsx`

### Etats a gerer

#### `FREE` avec essais restants

- card gradient actuelle conservee ;
- badge amber : `X essais restants` ;
- bouton : `Utiliser le Prompt IA`.

#### `FREE` epuise ou `BLOCKED`

- card legerement grisee ;
- icone `Lock` pres du titre ;
- bouton : `Demander l'acces` ;
- navigation vers `prompt`.

#### Demande `PENDING`

- card gradient conservee ;
- remplacer bouton par texte/statut non cliquable :
  - `Demande en cours de revision`.

#### `APPROVED`, `PREMIUM`, `ADMIN`

- card gradient conservee ;
- badge vert :
  - `Pro`
  - `Premium`
  - `Admin`
- bouton normal :
  - `Utiliser le Prompt IA`.

### Validation

```powershell
npm.cmd run build
```

### Permission a donner

```text
Permission frontend etape 8 : remplacer la card Prompt IA du HomePanel.
```

---

## Etape 9 - Revue finale frontend

### Objectif

Verifier les diffs, la coherence UI et la compilation finale.

### Verifications

```powershell
git diff -- frontend/src/pages/DashboardPage.tsx frontend/src/components/HomePanel.tsx
npm.cmd run build
```

### Points a verifier manuellement dans le code

- pas de nouveau fichier ;
- pas de modification hors `DashboardPage.tsx` et `HomePanel.tsx` ;
- pas de logique de securite seulement frontend : le backend reste l'autorite ;
- bouton prompt actif uniquement quand l'etat le permet ;
- modal accessible et fermable ;
- `403 AI_ACCESS_DENIED` gere proprement.

### Permission a donner

```text
Permission frontend etape 9 : faire la revue finale frontend.
```

---

## Commandes Git prevues apres validation complete

Ne pas executer sans demande explicite.

```powershell
git add frontend/src/pages/DashboardPage.tsx frontend/src/components/HomePanel.tsx
git commit -m "feat(ai): surface prompt access status in frontend"
git push origin main
gh workflow run deploy-frontend.yml --ref main
```
