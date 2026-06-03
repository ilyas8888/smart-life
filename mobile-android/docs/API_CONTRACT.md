# API Contract — SmartLife Mobile

> ⚠️ **Source de vérité = les controllers Java du backend** (`backend/src/main/java/com/smartlife/controller/`),
> PAS ce document. Ce fichier est régénéré depuis les vrais controllers/entités (2026-05-31).
> Toute divergence → vérifier le controller, jamais l'inverse.

Base URL prod  : `https://ilyas8888-smartlife-backend.hf.space`
Base URL local : `http://10.0.2.2:8080` (émulateur) — préfixe Retrofit : `<base>/api/`
Auth header    : `Authorization: Bearer {token}` sur toutes les routes sauf `/api/auth/*`
Sérialisation  : Jackson côté backend → un getter booléen `isX()` expose la clé JSON `x`
                 (ex. `isDone` → `done`, `isPinned` → `pinned`).

📱 = endpoint consommé par l'app Android.

---

## AUTH — `/api/auth`

| Méthode | Endpoint | Body | Réponse |
|---|---|---|---|
| 📱 POST | `/auth/login` | `{email, password}` | `AuthResponse` *(ou `{step:"OTP_REQUIRED", userId}`)* |
| 📱 POST | `/auth/register` | `{email, password, firstName?, lastName?}` | `AuthResponse` *(ou `{step, userId}`)* |
| 📱 POST | `/auth/verify-otp` | `{userId, code}` | `AuthResponse` |
| 📱 POST | `/auth/refresh` | `{refreshToken}` | `{accessToken}` |
| 📱 POST | `/auth/logout` | — | `{message}` |

```
AuthResponse { token, refreshToken, email, firstName, lastName }   // ⚠️ `token`, pas `accessToken`
```

---

## SCORE — `/api/score`

| Méthode | Endpoint | Réponse |
|---|---|---|
| 📱 GET | `/score/today` | `DayScore` |

```
DayScore {
  total, band, bandLabel, insight, delta,
  modules: {
    sleep|nutrition|productivity|workout|study|mood : { score, weight, label, present }
  },
  synergies: [ { name, bonus, description } ],
  history:   [ { date, total, band } ]
}
```
⚠️ Pas de champs `totalScore`/`tasksScore`/`caloriesConsumed`… (anciennes clés fictives supprimées).

---

## TIMELINE — `/api/timeline`

| Méthode | Endpoint | Params | Réponse |
|---|---|---|---|
| 📱 GET | `/timeline` | — | `Map<date, TimelineItem[]>` |
| 📱 GET | `/timeline/month` | `year`, `month` | `Map<date, TimelineItem[]>` |

```
TimelineItem { id, type, title, description, date, time, metadata }
// completed / category sont DANS metadata, pas à la racine
```

---

## TASKS — `/api/tasks`

| Méthode | Endpoint | Body/Params | Réponse |
|---|---|---|---|
| 📱 GET | `/tasks` | — | `Task[]` |
| 📱 POST | `/tasks` | `{title, description?, status?, priority?, category?, startDate?, dueDate?}` | `Task` |
| PUT | `/tasks/{id}` | champs partiels | `Task` |
| 📱 PATCH | `/tasks/{id}/status` | `?status=TODO\|IN_PROGRESS\|DONE` | `Task` |
| 📱 DELETE | `/tasks/{id}` | — | 204 |
| GET/POST/PATCH/DELETE | `/tasks/{id}/checklist[/{itemId}]` | `{text}` / `{done?, text?}` | `ChecklistItem` |

```
Task { id, title, description, status(TODO/IN_PROGRESS/DONE), priority(LOW/MEDIUM/HIGH),
       category, startDate?, dueDate?, createdAt, updatedAt, checklist[] }
// ⚠️ `status` (enum), PAS de booléen `completed`. dueDate/startDate = LocalDateTime ISO.
```

---

## NOTES — `/api/notes`

| Méthode | Endpoint | Body | Réponse |
|---|---|---|---|
| 📱 GET | `/notes` | — | `Note[]` |
| 📱 POST | `/notes` | `{title, content, tags?, isPinned?, color?}` | `Note` |
| 📱 PATCH | `/notes/{id}/pin` | — | `Note` |
| PATCH | `/notes/{id}/color` | `?color=` | `Note` |
| PUT | `/notes/{id}` | `{title?, content?}` | `Note` |
| 📱 DELETE | `/notes/{id}` | — | 204 |

```
Note { id, title, content, tags: String[], pinned, color, createdAt, updatedAt }
```

---

## REMINDERS — `/api/reminders`

| Méthode | Endpoint | Body/Params | Réponse |
|---|---|---|---|
| 📱 GET | `/reminders` | `?includeDone=false` | `Reminder[]` |
| 📱 POST | `/reminders` | `{title, description?, remindAt, priority?}` | `Reminder` |
| PATCH | `/reminders/{id}/done` | — | `Reminder` |
| PUT | `/reminders/{id}` | `{title?, description?, remindAt?, priority?}` | `Reminder` |
| 📱 DELETE | `/reminders/{id}` | — | 204 |

```
Reminder { id, title, description, remindAt, recurring, recurrenceRule, done, priority, createdAt }
// ⚠️ `remindAt` (pas dateTime), `done` (pas completed), `recurrenceRule` (pas recurrence).
// remindAt = LocalDateTime ISO complet (ex: 2026-05-31T14:00:00).
```

---

## FOOD LOGS — `/api/food-logs`

| Méthode | Endpoint | Body/Params | Réponse |
|---|---|---|---|
| GET | `/food-logs` | — | `FoodLog[]` (tout l'historique) |
| 📱 GET | `/food-logs/today` | — | `FoodLog[]` (aujourd'hui) |
| 📱 POST | `/food-logs` | `{foodItem, mealType?, quantity, calories?, proteinG?, carbsG?, fatG?}` | `FoodLog` |
| 📱 GET | `/food-logs/summary/today` | — | `NutritionSummary` |
| 📱 DELETE | `/food-logs/{id}` | — | 204 |
| POST | `/food-logs/quick-add` `/from-prompt` | — | `FoodLog[]` |
| GET | `/food-logs/suggestions` | `?q&limit` | `{custom, frequent, catalog, related, manual}` |

```
FoodLog { id, foodItem, quantity(String, ex "100g"), mealType(BREAKFAST/LUNCH/DINNER/SNACK),
          calories?, proteinG?, carbsG?, fatG?, fiberG?, logDate, loggedAt }
NutritionSummary { totalCalories, totalProteinG, totalCarbsG, totalFatG, totalFiberG, mealCount, meals[] }
// ⚠️ `foodItem` (pas foodName), `quantity` String, macros suffixées `G`. logDate fixé = today côté serveur.
// Pas de caloriesGoal côté backend (défaut local mobile = 2000).
```

---

## WORKOUTS — `/api/workouts`

| Méthode | Endpoint | Body | Réponse |
|---|---|---|---|
| 📱 GET | `/workouts` | — | `WorkoutSession[]` |
| 📱 POST | `/workouts` | `{title, durationMinutes?, caloriesBurned?, notes?, planDayId?, exercises[]?}` | `WorkoutSession` |
| POST | `/workouts/from-prompt` | `{prompt}` | `WorkoutSession` |
| 📱 DELETE | `/workouts/{id}` | — | 204 |

```
WorkoutSession { id, title, sessionDate, durationMinutes, caloriesBurned?, notes?, planDayId?, exercises[], createdAt }
// ⚠️ `title` (pas type), `durationMinutes` (pas duration), `caloriesBurned` (pas calories), `sessionDate` (pas date).
```

### WORKOUT PLANS — `/api/workout-plans`
`GET /` → `WorkoutPlan[] { id, name, goal, weeks, daysPerWeek, status, startDate, days[], createdAt }` ;
`POST /`, `GET|PUT|DELETE /{id}`, `PATCH /{id}/status`, `GET /{id}/progress`.

---

## SLEEP — `/api/sleep-logs`

| Méthode | Endpoint | Body/Params | Réponse |
|---|---|---|---|
| 📱 GET | `/sleep-logs` | `?from&to` (optionnels) | `SleepLog[]` |
| 📱 POST | `/sleep-logs` | `{bedtime, wakeTime, quality, energy?, wakeUps?, factors?, notes?}` | `SleepLog` (201) |
| PUT | `/sleep-logs/{id}` | idem | `SleepLog` |
| 📱 DELETE | `/sleep-logs/{id}` | — | 204 |

```
SleepLog { id, sleepDate, bedtime, wakeTime, durationMinutes, quality(1-5), energy?, wakeUps, factors[], notes?, createdAt }
// ⚠️ `bedtime` (minuscule), `durationMinutes` (pas duration en heures), `sleepDate` (pas date).
// bedtime/wakeTime = LocalDateTime ISO. Le backend EXIGE wakeTime > bedtime (sinon 400 WAKE_BEFORE_BED)
//   → si nuit, dater le coucher la veille.
```

---

## STUDY — `/api/study`

| Méthode | Endpoint | Body | Réponse |
|---|---|---|---|
| 📱 GET | `/study/topics` | — | `StudyTopic[]` |
| 📱 POST | `/study/topics` | `{name, color?, goal?, targetHours?, deadline?}` | `StudyTopic` (201) |
| PUT/DELETE | `/study/topics/{id}` | — | — |
| 📱 GET | `/study/sessions` | — | `StudySession[]` |
| 📱 POST | `/study/sessions/start` | `{title, topicId?, startedAt?}` | `StudySession` (201) |
| 📱 PUT | `/study/sessions/{id}/finish` | `{endedAt, focusScore?, difficultyScore?, notes?, createReview?}` | `StudySession` |
| DELETE | `/study/sessions/{id}` | — | 204 |
| GET | `/study/reviews` `?dueOnly` · PATCH `/study/reviews/{id}` · GET `/study/summary` | — | — |

```
StudyTopic   { id, name, color, goal?, targetHours?, deadline?, createdAt }
StudySession { id, topic{id,name,...}, title, startedAt, endedAt?, durationMinutes?, focusScore?, ... }
// ⚠️ PAS de POST /study/sessions : créer = start puis finish.
//    totalSessions/totalMinutes N'EXISTENT PAS → à dériver des sessions côté client.
//    `topic` est imbriqué (pas topicId/topicName plats). durationMinutes (pas duration).
```

---

## PROFILE — `/api/profile`

| Méthode | Endpoint | Body | Réponse |
|---|---|---|---|
| 📱 GET | `/profile/me` | — | `UserProfile` (avec `badges[]`) |
| 📱 PUT | `/profile/me` | `{firstName?, lastName?, bio?, username?, avatarColor?}` | `UserProfile` |
| GET | `/profile/{username}` · `/profile/by-id/{userId}` | — | profil public |
| PUT/DELETE | `/profile/me/avatar` · GET `/profile/avatar/{userId}` | `{avatarData}` | — |
| GET | `/profile/me/posts` | — | post[] |

```
UserProfile { id, username, displayName, initials, firstName?, lastName?, bio?,
              avatarColor, hasAvatar, createdAt, email, badges[] }
Badge { type, name, description, emoji, color, earned, earnedAt? }
// ⚠️ Routes en /me (pas /profile). Pas de /profile/badges : les badges sont DANS /me.
//    Pas de publicProfileEnabled. firstName/lastName peuvent être null → utiliser displayName/initials.
```

---

## SOCIAL — `/api/social`

| Méthode | Endpoint | Body/Params | Réponse |
|---|---|---|---|
| 📱 GET | `/social/posts` | `?page=0&type=` | `SocialPost[]` ⚠️ **List brute, pas une Page** |
| GET | `/social/saved` | — | `SocialPost[]` |
| 📱 POST | `/social/posts` | `{resourceType, resourceId, title?, caption?}` | `SocialPost` (201) |
| 📱 DELETE | `/social/posts/{id}` | — | 204 |
| 📱 POST | `/social/posts/{id}/react` | `{type}` | `{removed, type}` |
| 📱 GET | `/social/posts/{id}/comments` | — | `SocialComment[]` |
| 📱 POST | `/social/posts/{id}/comments` | `{content, parentId?}` | `SocialComment` (201) |
| DELETE | `/social/comments/{id}` | — | 204 |
| 📱 POST | `/social/posts/{id}/save` | — | `{saved}` |

```
SocialPost {
  id, author { userId, name, initials, username, avatarColor, hasAvatar },
  resourceType, resourceId, title?, caption?, preview {…},
  reactions { INSPIRED, TRYING, BRAVO, HOW }, myReaction?,
  reactionsCount, commentsCount, savesCount, isSaved, createdAt, timeAgo
}
SocialComment { id, postId, parentId?, author {…}, content, createdAt, timeAgo, replies[] }

// ⚠️ Un post PARTAGE UNE RESSOURCE existante de l'utilisateur, pas un texte libre.
//    resourceType ∈ { NOTE, FOOD_LOG, WORKOUT_PLAN, SLEEP_LOG, STUDY_SESSION, JOURNAL } (doit lui appartenir).
//    Réactions: INSPIRED / TRYING / BRAVO / HOW (pas LIKE/LOVE/FIRE).
//    Routes /posts/{id}/react|comments|save (pas /social/{id}/…).
```

---

## AI

| Méthode | Endpoint | Body | Réponse |
|---|---|---|---|
| 📱 POST | `/api/prompt` | `{prompt}` | `PromptResponse` |
| 📱 GET | `/api/ai-access/status` | — | `AiAccessStatus` |
| POST | `/api/ai-access/request` | `{message?}` | `{result}` |

```
PromptResponse { summary, tasksCreated[], remindersCreated[], notesCreated[],
                 contactsCreated[], foodLogsCreated[], diaryEntriesCreated[], workoutsCreated[], rawAiResponse }
AiAccessStatus { status(FREE/APPROVED/PREMIUM/ADMIN/BLOCKED), planName,
                 trialUsed, trialQuota, monthlyUsed, monthlyQuota(-1=illimité),
                 resetAt, expiresAt, lastRequestStatus }
// ⚠️ Route `/api/prompt` (pas /prompt/process). Réponse en `*Created` (pas tasks/reminders).
//    Pas de canUseAi/creditsUsed/creditsLimit → à dériver côté client depuis status + quotas.
```
