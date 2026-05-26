# SmartLife — Plateforme de gestion personnelle intelligente

[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=smart-life&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=smart-life)

Application web full-stack permettant de gérer sa vie quotidienne via un prompt en langage naturel analysé par Claude (Anthropic). 8 modules intégrés : tâches, rappels, notes, contacts, alimentation, agenda, journal personnel et sport.

**Live demo** : [https://ilyas8888.github.io/smart-life/](https://ilyas8888.github.io/smart-life/)

---

## Fonctionnalités

- **Prompt IA** : décrivez votre journée en texte libre — l'IA extrait et crée automatiquement tâches, rappels, notes, contacts et entrées alimentaires
- **Tâches** : Kanban board (À faire / En cours / Terminé)
- **Rappels** : avec date/heure et statut
- **Notes** : prise de notes rapide
- **Contacts** : carnet d'adresses personnel
- **Alimentation** : journal alimentaire avec macros (calories, protéines, glucides, lipides)
- **Agenda** : vue bullet-journal de la semaine
- **Journal personnel** : entrées quotidiennes avec sélecteur d'humeur
- **Sport** : suivi des séances (exercices, séries, reps, poids, durée)
- **Dashboard** : accueil avec stats en temps réel (tâches, rappels, calories, sport semaine, notes, journal)
- **Dark / Light mode**
- **Auth sécurisée** : JWT (access 15 min + refresh 7 jours), logout réel, OTP email à l'inscription

---

## Stack technique

| Couche | Technologie |
|---|---|
| Frontend | React 18 + TypeScript + Vite + TailwindCSS + TanStack Query |
| Backend | Java 17 / Spring Boot 3.2.5 + Spring Security + JPA + Flyway |
| IA | Python 3.13 / FastAPI + SDK Anthropic (Claude Sonnet 4.6) |
| Base de données | PostgreSQL 15 (Neon en production) |
| Auth | JWT custom + OTP email + OAuth2 Keycloak |

---

## Architecture

```
smart-life/
├── frontend/          React/Vite — GitHub Pages
├── backend/           Spring Boot — Hugging Face Spaces (Docker)
├── ai-service/        FastAPI — Hugging Face Spaces (Docker)
└── .github/workflows/ CI/CD GitHub Actions
```

Le frontend appelle le backend Spring Boot (`/api/*`). Le backend délègue l'analyse du prompt au service Python via un header d'authentification interne (`X-Internal-Key`). Le service Python appelle l'API Claude avec prompt caching pour réduire les coûts.

---

## Déploiement

| Service | Plateforme | URL |
|---|---|---|
| Frontend | GitHub Pages | https://ilyas8888.github.io/smart-life/ |
| Backend | Hugging Face Spaces (Docker) | https://ilyas8888-smartlife-backend.hf.space |
| AI Service | Hugging Face Spaces (Docker) | https://ilyas8888-smartlife-ai-service.hf.space |
| Database | Neon PostgreSQL | — |

Le déploiement est automatisé via GitHub Actions (`deploy-frontend.yml`, `deploy-backend.yml`, `deploy-ai-service.yml`).

---

## Sécurité

- OAuth2 / OpenID Connect via Keycloak (SSO en parallèle du login local)
- Refresh tokens en base avec révocation explicite (logout réel)
- Tokens d'accès révoqués par hash SHA-256 (blacklist DB)
- Rate limiting : 10 req/min par utilisateur sur le endpoint IA (Bucket4j)
- OTP email obligatoire à l'inscription (vérification d'adresse)
- Audit logs : chaque action de connexion tracée avec IP
- Service IA non exposé publiquement (port interne uniquement)
- Validation `@Valid` sur tous les DTOs entrants

---

## Lancer en local

**Prérequis** : Java 17, Node 20, Python 3.13, PostgreSQL 15, Maven

```bash
# Backend
cd backend
mvn spring-boot:run "-Dspring-boot.run.profiles=local"

# Frontend
cd frontend
npm install
npm run dev

# AI Service
cd ai-service
pip install -r requirements.txt
uvicorn main:app --port 8001
```

Variables d'environnement requises (backend) : `MAIL_USERNAME`, `MAIL_PASSWORD`, `JWT_SECRET`, `AI_INTERNAL_SECRET`.  
Variable requise (AI service) : `ANTHROPIC_API_KEY`.

---

## Auteur

Étudiant en dernière année de génie informatique.
