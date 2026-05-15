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
    cached_foods: list[dict] | None = None


SYSTEM_PROMPT = """Tu es un assistant intelligent de gestion personnelle ET un expert en nutrition.
Ton rôle est d'analyser le texte libre d'un utilisateur et d'en extraire des éléments structurés.

Tu dois retourner UNIQUEMENT un JSON valide avec la structure suivante (sans markdown, sans explications):
{
  "summary": "Résumé en une phrase de ce qui a été créé",
  "tasks": [{"title": "...", "description": "...", "priority": "LOW|MEDIUM|HIGH"}],
  "reminders": [{"title": "...", "description": "...", "remind_at": "YYYY-MM-DDTHH:MM:SS"}],
  "notes": [{"title": "...", "content": "..."}],
  "contacts": [{"name": "...", "phone": "...", "email": "...", "address": "...", "notes": "..."}],
  "diary": [{"content": "...", "mood": "GREAT|GOOD|NEUTRAL|BAD|TERRIBLE", "tags": ["..."]}],
  "food_logs": [
    {
      "meal_type": "BREAKFAST|LUNCH|DINNER|SNACK",
      "food_item": "Nom de l'aliment avec quantité estimée",
      "quantity": "ex: 2 unités, 150g, 1 portion",
      "calories": 300,
      "protein_g": 12.5,
      "carbs_g": 45.0,
      "fat_g": 8.0,
      "fiber_g": 3.5,
      "notes": "...",
      "nutrition_details": {
        "vitamine_a": "150mcg",
        "vitamine_c": "10mg",
        "vitamine_d": "2mcg",
        "vitamine_b12": "1.4mcg",
        "calcium": "120mg",
        "fer": "2mg",
        "potassium": "300mg",
        "sodium": "200mg",
        "magnesium": "30mg"
      }
    }
  ]
}

Règles nutrition:
- Estime les valeurs nutritionnelles moyennes pour des quantités typiques
- Un œuf moyen = 70 kcal, 6g protéines, 0.5g glucides, 5g lipides
- Un sandwich standard = 350 kcal, 15g protéines, 40g glucides, 12g lipides
- Des pâtes (portion) = 350 kcal, 12g protéines, 65g glucides, 3g lipides
- Inclure les vitamines et minéraux les plus pertinents pour l'aliment
- Les champs vides ou absents doivent être des listes vides []
- Retourne UNIQUEMENT le JSON, rien d'autre"""


@app.post("/process")
async def process_prompt(payload: PromptPayload):
    now = datetime.now().isoformat()
    user_content = payload.prompt
    if payload.cached_foods:
        cache_lines = "\n".join(
            f"- {food.get('name')}: {food.get('calories')}kcal, P:{food.get('protein_g')}g, G:{food.get('carbs_g')}g, L:{food.get('fat_g')}g, Fibres:{food.get('fiber_g')}g"
            for food in payload.cached_foods
        )
        user_content = (
            "[DONNÉES NUTRITIONNELLES DÉJÀ CONNUES — utilise ces valeurs exactes si l'aliment correspond, ne recalcule pas]\n"
            f"{cache_lines}\n\n"
            f"[PROMPT UTILISATEUR]\n{payload.prompt}"
        )
    user_message = f"[Date actuelle: {now}]\n\nTexte de l'utilisateur:\n{user_content}"

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
            extra_headers={"anthropic-beta": "prompt-caching-2024-07-31"},
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
