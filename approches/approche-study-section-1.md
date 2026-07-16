# Approche Study Tracking - SmartLife

## Probleme utilisateur

Le vrai besoin n'est pas seulement de noter "j'ai etudie 2h".

Le module Study doit aider l'utilisateur a:

- apprendre regulierement;
- savoir quoi reviser;
- rester concentre;
- visualiser sa progression;
- transformer chaque session en prochaine action claire.

Objectif produit:

> SmartLife doit devenir un assistant d'apprentissage, pas seulement un chronometre.

## Concept recommande

Créer une section `Apprentissage` organisee autour de 4 blocs.

### 1. Sessions

Chaque session d'etude contient:

- sujet ou projet;
- objectif de session;
- duree;
- score de concentration;
- difficulte;
- notes;
- ce qui a ete appris;
- prochaine action.

### 2. Sujets / plans d'apprentissage

L'utilisateur peut suivre plusieurs axes:

- Java Spring;
- React;
- Anglais;
- DSO;
- Projet SmartLife;
- memoire ou rapport.

Chaque sujet peut avoir:

- nom;
- couleur;
- objectif global;
- heures cible;
- deadline optionnelle;
- progression.

### 3. Revisions intelligentes

Apres une session, si l'utilisateur coche `A revoir`, SmartLife cree automatiquement des revisions:

- J+1;
- J+3;
- J+7;
- J+14.

La date suivante peut ensuite etre ajustee selon le niveau de maitrise.

### 4. Insights

SmartLife doit montrer des signaux utiles:

- heures etudiees cette semaine;
- streak d'apprentissage;
- meilleurs creneaux;
- concentration moyenne;
- sujets les plus travailles;
- sujets oublies;
- prochaine revision importante.

## MVP recommande

Le MVP le plus fort:

1. Creer des sujets d'apprentissage.
2. Demarrer une session.
3. Timer focus avec pause.
4. Cloturer la session avec:
   - concentration 1-5;
   - difficulte 1-5;
   - ce qui a ete appris;
   - prochaine action;
   - checkbox `A revoir`.
5. Afficher historique + stats semaine.
6. Creer une queue de revisions simples.

Ce MVP apporte de la valeur des le premier jour.

## UX principale

### Ecran Study

Premier ecran:

- carte `Session en cours`;
- bouton `Demarrer`;
- choix rapide du sujet;
- objectif de session;
- timer focus;
- notes rapides.

### Fin de session

Modal de cloture:

- Qu'as-tu appris ?
- Qu'est-ce qui etait difficile ?
- Quelle est la prochaine action ?
- Faut-il reviser ce contenu ?
- Score concentration;
- Score difficulte.

### Dashboard Study

Afficher:

- temps total semaine;
- sessions semaine;
- streak;
- concentration moyenne;
- sujets actifs;
- revisions a faire.

## Modele backend propose

### study_topics

```sql
study_topics
- id
- user_id
- name
- color
- goal
- target_hours
- deadline
- created_at
- updated_at
```

### study_sessions

```sql
study_sessions
- id
- user_id
- topic_id
- title
- started_at
- ended_at
- duration_minutes
- focus_score
- difficulty_score
- notes
- learned
- next_step
- created_at
```

### study_reviews

```sql
study_reviews
- id
- user_id
- topic_id
- session_id
- review_date
- mastery_score
- status
- notes
```

## Endpoints backend proposes

```text
GET    /api/study/topics
POST   /api/study/topics
PUT    /api/study/topics/{id}
DELETE /api/study/topics/{id}

GET    /api/study/sessions
POST   /api/study/sessions/start
PUT    /api/study/sessions/{id}/finish
DELETE /api/study/sessions/{id}

GET    /api/study/reviews
PATCH  /api/study/reviews/{id}

GET    /api/study/summary
```

## Smart Day Score

Study peut contribuer au Smart Day Score seulement si l'utilisateur active un objectif apprentissage.

Proposition:

```text
studyScore =
  session terminee aujourd'hui: 60
  objectif de duree atteint: +20
  revision faite: +10
  focus >= 4: +10
```

Si aucun objectif Study n'est actif, le score Study doit rester neutre pour ne pas penaliser l'utilisateur.

## Future IA

Plus tard, l'IA peut enrichir le module:

- transformer les notes en fiches de revision;
- generer des quiz;
- resumer une session;
- proposer un plan d'etude;
- detecter les lacunes recurrentes.

Mais le MVP doit fonctionner sans IA.

## Priorite d'implementation

### Phase Study 1

- CRUD topics;
- start/stop session;
- cloture de session;
- historique;
- stats semaine.

### Phase Study 2

- reviews;
- spaced repetition;
- next action;
- insights locaux.

### Phase Study 3

- IA quiz;
- flashcards;
- resume automatique;
- plan d'apprentissage.

## Principe cle

Chaque session doit finir par une question:

> Quelle est la prochaine action claire ?

C'est ce qui transforme Study Tracking en assistant d'apprentissage.
