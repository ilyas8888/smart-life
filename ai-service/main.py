import os
import json
from datetime import datetime
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import anthropic
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="SmartLife AI Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))


class PromptPayload(BaseModel):
    prompt: str
    user_id: int


SYSTEM_PROMPT = """Tu es un assistant intelligent de gestion personnelle.
Ton rôle est d'analyser le texte libre d'un utilisateur et d'en extraire des éléments structurés.

Tu dois retourner UNIQUEMENT un JSON valide avec la structure suivante (sans markdown, sans explications):
{
  "summary": "Résumé en une phrase de ce qui a été créé",
  "tasks": [
    {"title": "...", "description": "...", "priority": "LOW|MEDIUM|HIGH"}
  ],
  "reminders": [
    {"title": "...", "description": "...", "remind_at": "YYYY-MM-DDTHH:MM:SS"}
  ],
  "notes": [
    {"title": "...", "content": "..."}
  ],
  "contacts": [
    {"name": "...", "phone": "...", "email": "...", "address": "...", "notes": "..."}
  ],
  "diary": [
    {"content": "...", "mood": "GREAT|GOOD|NEUTRAL|BAD|TERRIBLE", "tags": ["..."]}
  ],
  "food_logs": [
    {"meal_type": "BREAKFAST|LUNCH|DINNER|SNACK", "food_item": "...", "calories": null, "notes": "..."}
  ]
}

Règles:
- Extrais SEULEMENT ce qui est clairement mentionné dans le texte
- Les champs vides ou absents doivent être des listes vides []
- Pour les dates, utilise la date actuelle si elle n'est pas spécifiée
- Les numéros de téléphone et adresses vont dans contacts
- Les mémos, pensées vont dans notes
- Ce que l'utilisateur a mangé va dans food_logs
- Retourne UNIQUEMENT le JSON, rien d'autre"""


@app.post("/process")
async def process_prompt(payload: PromptPayload):
    now = datetime.now().isoformat()
    user_message = f"[Date actuelle: {now}]\n\nTexte de l'utilisateur:\n{payload.prompt}"

    try:
        message = client.messages.create(
            model="claude-sonnet-4-6",
            max_tokens=2048,
            system=[{
                "type": "text",
                "text": SYSTEM_PROMPT,
                "cache_control": {"type": "ephemeral"},
            }],
            messages=[{"role": "user", "content": user_message}],
        )

        raw_text = message.content[0].text.strip()

        # Clean potential markdown fences
        if raw_text.startswith("```"):
            raw_text = raw_text.split("```")[1]
            if raw_text.startswith("json"):
                raw_text = raw_text[4:]
        if raw_text.endswith("```"):
            raw_text = raw_text[:-3]

        result = json.loads(raw_text.strip())
        return result

    except json.JSONDecodeError as e:
        raise HTTPException(status_code=500, detail=f"AI returned invalid JSON: {e}")
    except anthropic.APIError as e:
        raise HTTPException(status_code=502, detail=f"Claude API error: {e}")


@app.get("/health")
def health():
    return {"status": "ok", "model": "claude-sonnet-4-6"}
