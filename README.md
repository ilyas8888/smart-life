# SmartLife

## Description / Description

**FR**  
SmartLife est une plateforme intelligente de gestion personnelle. L'utilisateur saisit une demande en langage naturel, puis Claude AI (Sonnet 4.6) analyse le texte et le transforme en donnees structurees : taches, rappels, contacts, notes, journal alimentaire et historique des interactions IA.

**EN**  
SmartLife is an intelligent personal management platform. The user writes a free-text prompt, then Claude AI (Sonnet 4.6) analyzes it and converts it into structured data: tasks, reminders, contacts, notes, food diary entries, and AI interaction history.

## Tech Stack / Technologies

**Backend**
- Java 17
- Spring Boot 3.2
- Spring Security with JWT authentication
- Flyway database migrations

**Frontend**
- React 18
- TypeScript
- Vite
- TailwindCSS

**AI Service**
- Python 3.13
- FastAPI
- Claude API

**Infrastructure**
- PostgreSQL 15
- Docker
- Docker Compose

## Architecture / Architecture

```text
+------------------+      +----------------------+      +----------------------+
| React Frontend   | ---> | Spring Boot Backend  | ---> | Python/FastAPI AI   |
| Vite + Tailwind  |      | REST API + JWT       |      | Claude integration  |
+------------------+      +----------------------+      +----------+-----------+
          |                         |                              |
          |                         v                              v
          |              +----------------------+        +----------------------+
          +------------> | PostgreSQL 15        |        | Claude API           |
                         | Data persistence     |        | Sonnet 4.6           |
                         +----------------------+        +----------------------+
```

## Features / Fonctionnalites

**FR**
- Traitement de prompts en langage naturel avec Claude AI
- Creation automatique de taches, rappels, contacts, notes et entrees de journal alimentaire
- Tableau Kanban pour la gestion des taches
- Rappels avec dates d'echeance
- Gestion des contacts
- Notes avec option d'epinglage
- Historique des prompts et reponses IA
- Authentification securisee avec JWT

**EN**
- Natural language prompt processing with Claude AI
- Automatic creation of tasks, reminders, contacts, notes, and food diary entries
- Kanban task board
- Reminders with due dates
- Contact management
- Notes with pin support
- AI prompt and response history
- Secure JWT authentication

## Getting Started / Demarrage

### Prerequisites / Prerequis

- Java 17
- Maven
- Node.js and npm
- Python 3.13
- Docker and Docker Compose
- Anthropic API key

### Environment Setup / Configuration `.env`

Create a `.env` file at the project root:

```env
ANTHROPIC_API_KEY=your_anthropic_api_key
POSTGRES_DB=smartlife
POSTGRES_USER=smartlife
POSTGRES_PASSWORD=smartlife
JWT_SECRET=your_jwt_secret
```

### Docker Compose

Run the full stack:

```bash
docker compose up --build
```

Stop the stack:

```bash
docker compose down
```

### Local Development / Developpement local

Backend Spring Boot:

```bash
cd backend
mvn spring-boot:run
```

AI service FastAPI:

```bash
cd ai-service
py -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
py -m uvicorn main:app --reload
```

Frontend React:

```bash
cd frontend
npm install
npm run dev
```

Build frontend:

```bash
cd frontend
npm run build
```

Run backend checks:

```bash
cd backend
mvn -q -DskipTests compile
```

## Screenshots / Captures d'ecran

Screenshots will be added here.

| Dashboard | AI Prompt Processing | Kanban Board |
| --- | --- | --- |
| Placeholder | Placeholder | Placeholder |

## Author / Auteur

Junior developer - Computer Engineering student, final year.

Developpeur junior - Etudiant en derniere annee de genie informatique.

## License / Licence

MIT License.
