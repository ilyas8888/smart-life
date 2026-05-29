# SmartLife - Plan d'execution par etapes

## Objectif

Mettre en place un controle d'acces backend pour le Prompt IA SmartLife afin de preparer une fonctionnalite premium.

Le systeme doit permettre :

- un essai gratuit limite ;
- des comptes approuves manuellement ;
- un futur plan premium ;
- un statut admin ;
- un blocage explicite en cas d'abus ;
- un controle strict cote backend sur `POST /api/prompt`.

Note technique : le projet utilise actuellement Java 17 dans `backend/pom.xml`. Ne pas basculer vers Java 21 dans ce chantier.

---

## Statuts IA

Statuts prevus pour `user_ai_entitlements.status` :

- `FREE` : essai gratuit limite, par defaut 5 prompts.
- `APPROVED` : acces approuve manuellement, par defaut 100 credits/mois.
- `PREMIUM` : acces payant futur, par defaut 300 credits/mois.
- `ADMIN` : acces illimite.
- `BLOCKED` : aucun acces.

---

## Etape 1 - Migration base de donnees

### Objectif

Creer les tables necessaires sans toucher au code metier.

### Fichier a creer

- `backend/src/main/resources/db/migration/V17__ai_entitlements.sql`

### Tables

- `user_ai_entitlements`
- `ai_access_requests`

### SQL prevu

```sql
CREATE TABLE user_ai_entitlements (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL DEFAULT 'FREE',
    plan_name VARCHAR(50) DEFAULT 'Free',
    trial_quota INT NOT NULL DEFAULT 5,
    trial_used INT NOT NULL DEFAULT 0,
    monthly_quota INT DEFAULT 100,
    monthly_used INT NOT NULL DEFAULT 0,
    approved_by BIGINT REFERENCES users(id),
    approved_at TIMESTAMP,
    expires_at TIMESTAMP,
    reset_at TIMESTAMP DEFAULT DATE_TRUNC('month', NOW()) + INTERVAL '1 month',
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE ai_access_requests (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    message TEXT,
    reviewed_by BIGINT REFERENCES users(id),
    requested_at TIMESTAMP NOT NULL DEFAULT NOW(),
    reviewed_at TIMESTAMP
);
```

### Validation

```powershell
mvn -q -DskipTests compile
```

### Permission a donner

```text
Permission etape 1 : creer la migration V17 AI access.
```

---

## Etape 2 - Modeles et repositories

### Objectif

Ajouter la couche JPA proprement.

### Fichiers a creer

- `backend/src/main/java/com/smartlife/model/UserAiEntitlement.java`
- `backend/src/main/java/com/smartlife/model/AiAccessRequest.java`
- `backend/src/main/java/com/smartlife/repository/UserAiEntitlementRepository.java`
- `backend/src/main/java/com/smartlife/repository/AiAccessRequestRepository.java`

### Regles

- Utiliser Lombok comme le reste du projet.
- Garder les classes dans le package `com.smartlife`.
- Ne pas modifier les entites existantes sauf necessite de compilation.
- Mapper `user_id` avec une relation vers `User`.
- Garder `approvedBy` et `reviewedBy` comme `Long` pour rester simple.

### Validation

```powershell
mvn -q -DskipTests compile
```

### Permission a donner

```text
Permission etape 2 : creer les modeles et repositories AI access.
```

---

## Etape 3 - Service metier des credits

### Objectif

Centraliser toute la logique d'acces IA.

### Fichier a creer

- `backend/src/main/java/com/smartlife/service/AiEntitlementService.java`

### Responsabilites

- creer automatiquement un entitlement `FREE` si l'utilisateur n'en a pas ;
- retourner le statut IA exploitable par le frontend ;
- verifier l'acces ;
- consommer 1 credit ;
- reset le quota mensuel quand `reset_at` est depasse ;
- soumettre une demande d'acces ;
- lister les demandes pending ;
- approuver une demande ;
- rejeter une demande ;
- verifier qu'un utilisateur est `ADMIN`.

### Choix de premiere version

Pour la V1, le credit est consomme avant l'appel IA.

Raison : implementation plus simple et controle immediat du cout.

Amelioration future possible : systeme `reserve -> confirm -> refund` pour rendre le credit si l'appel IA echoue.

### Validation

```powershell
mvn -q -DskipTests compile
```

### Permission a donner

```text
Permission etape 3 : creer le service AiEntitlementService.
```

---

## Etape 4 - Exception et reponse backend propre

### Objectif

Retourner une erreur claire quand l'utilisateur n'a plus acces au Prompt IA.

### Fichiers

- creer `backend/src/main/java/com/smartlife/exception/AiAccessDeniedException.java`
- modifier `backend/src/main/java/com/smartlife/exception/GlobalExceptionHandler.java`

### Reponse attendue

```json
{
  "error": "AI_ACCESS_DENIED",
  "currentStatus": "FREE",
  "trialUsed": 5,
  "trialQuota": 5,
  "monthlyUsed": 0,
  "monthlyQuota": 100
}
```

### Validation

```powershell
mvn -q -DskipTests compile
```

### Permission a donner

```text
Permission etape 4 : ajouter l'exception AI access et son handler.
```

---

## Etape 5 - Endpoints utilisateur

### Objectif

Preparer l'experience frontend sans modifier le frontend maintenant.

### Fichier a creer

- `backend/src/main/java/com/smartlife/controller/AiAccessController.java`

### Endpoints

- `GET /api/ai-access/status`
- `POST /api/ai-access/request`

### Comportement

`GET /status` retourne :

- statut courant ;
- nom du plan ;
- credits trial utilises/restants ;
- credits mensuels utilises/restants ;
- derniere demande d'acces.

`POST /request` :

- cree une demande d'acces ;
- refuse une deuxieme demande si une demande `PENDING` existe deja.

### Validation

```powershell
mvn -q -DskipTests compile
```

### Permission a donner

```text
Permission etape 5 : creer les endpoints utilisateur AI access.
```

---

## Etape 6 - Endpoints admin

### Objectif

Permettre d'approuver ou rejeter les demandes sans toucher directement a la base.

### Fichier a creer

- `backend/src/main/java/com/smartlife/controller/AdminAiController.java`

### Endpoints

- `GET /api/admin/ai/requests`
- `PUT /api/admin/ai/requests/{id}/approve`
- `PUT /api/admin/ai/requests/{id}/reject`

### Regle admin

Le controle admin doit etre reel :

- autoriser uniquement si l'utilisateur courant a `user_ai_entitlements.status = ADMIN` ;
- sinon retourner `403`.

### Initialisation admin

Apres migration, il faudra promouvoir ton compte manuellement en base :

```sql
INSERT INTO user_ai_entitlements (user_id, status, plan_name, monthly_quota)
VALUES (<TON_USER_ID>, 'ADMIN', 'Admin', NULL)
ON CONFLICT (user_id)
DO UPDATE SET status = 'ADMIN', plan_name = 'Admin', monthly_quota = NULL;
```

### Validation

```powershell
mvn -q -DskipTests compile
```

### Permission a donner

```text
Permission etape 6 : creer les endpoints admin avec controle ADMIN reel.
```

---

## Etape 7 - Enforcement sur le Prompt IA

### Objectif

Bloquer reellement l'usage couteux du Prompt IA cote backend.

### Fichier a modifier

- `backend/src/main/java/com/smartlife/controller/PromptController.java`

### Action

Injecter `AiEntitlementService`, puis appeler :

```java
entitlementService.checkAndConsume(user);
```

avant :

```java
aiService.processPrompt(...)
```

### Portee V1

Proteger uniquement :

- `POST /api/prompt`

Ne pas toucher encore :

- `FoodLogController`
- autocomplete nutrition
- ajout repas IA
- ajout sport IA

Ces fonctions pourront etre integrees plus tard dans un systeme de credits plus large.

### Validation

```powershell
mvn -q -DskipTests compile
mvn test
```

### Permission a donner

```text
Permission etape 7 : activer le controle d'acces sur POST /api/prompt.
```

---

## Etape 8 - Revue finale et commandes Git

### Objectif

Verifier le diff, compiler, tester, puis preparer les commandes de commit/deploiement.

### Verifications

```powershell
git diff --stat
git diff --check
mvn -q -DskipTests compile
mvn test
```

### Fichiers attendus

Crees :

- `backend/src/main/resources/db/migration/V17__ai_entitlements.sql`
- `backend/src/main/java/com/smartlife/model/UserAiEntitlement.java`
- `backend/src/main/java/com/smartlife/model/AiAccessRequest.java`
- `backend/src/main/java/com/smartlife/repository/UserAiEntitlementRepository.java`
- `backend/src/main/java/com/smartlife/repository/AiAccessRequestRepository.java`
- `backend/src/main/java/com/smartlife/exception/AiAccessDeniedException.java`
- `backend/src/main/java/com/smartlife/service/AiEntitlementService.java`
- `backend/src/main/java/com/smartlife/controller/AiAccessController.java`
- `backend/src/main/java/com/smartlife/controller/AdminAiController.java`

Modifies :

- `backend/src/main/java/com/smartlife/exception/GlobalExceptionHandler.java`
- `backend/src/main/java/com/smartlife/controller/PromptController.java`

Normalement pas necessaire :

- `backend/src/main/java/com/smartlife/config/SecurityConfig.java`

Raison : les routes `/api/ai-access/**` et `/api/admin/ai/**` sont deja protegees par `.anyRequest().authenticated()` si elles ne sont pas dans `permitAll`.

### Permission a donner

```text
Permission etape 8 : faire la revue finale et donner les commandes Git.
```

---

## Contraintes globales

- Ne pas modifier les migrations V1 a V16.
- Ne pas modifier `AiService.java` dans ce chantier.
- Ne pas modifier `FoodLogController.java` dans ce chantier.
- Ne pas modifier le frontend dans ce chantier.
- Ne pas creer de tests unitaires sauf demande explicite.
- Ne pas committer ni pousser sans demande explicite.
- Preserver les fichiers non suivis existants du workspace.

---

## Ordre d'execution recommande

1. Etape 1 - Migration base de donnees
2. Etape 2 - Modeles et repositories
3. Etape 3 - Service metier des credits
4. Etape 4 - Exception et reponse backend propre
5. Etape 5 - Endpoints utilisateur
6. Etape 6 - Endpoints admin
7. Etape 7 - Enforcement sur le Prompt IA
8. Etape 8 - Revue finale et commandes Git
