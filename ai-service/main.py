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
- Des pâtes (portion 200g cuit) = 350 kcal, 12g protéines, 65g glucides, 3g lipides
- Du riz blanc (portion 150g cuit) = 175 kcal, 3.6g protéines, 38g glucides, 0.3g lipides
- Du poulet grillé (150g) = 248 kcal, 46g protéines, 0g glucides, 5.5g lipides
- Du saumon (150g) = 280 kcal, 40g protéines, 0g glucides, 13g lipides
- Une banane moyenne = 90 kcal, 1.1g protéines, 23g glucides, 0.3g lipides
- Un yaourt nature (125g) = 75 kcal, 5g protéines, 8g glucides, 2.5g lipides
- Du pain complet (tranche 30g) = 75 kcal, 3g protéines, 13g glucides, 1g lipides
- Une pomme moyenne = 80 kcal, 0.4g protéines, 21g glucides, 0.2g lipides
- Du fromage (30g) = 120 kcal, 7g protéines, 0.5g glucides, 10g lipides
- Du lait entier (250ml) = 155 kcal, 8g protéines, 12g glucides, 8g lipides
- Des lentilles cuites (200g) = 230 kcal, 18g protéines, 40g glucides, 0.8g lipides
- Du thon en boite (100g) = 116 kcal, 26g protéines, 0g glucides, 1g lipides
- Une pizza (portion 150g) = 370 kcal, 15g protéines, 45g glucides, 14g lipides
- Des amandes (30g) = 173 kcal, 6g protéines, 6g glucides, 15g lipides
- Pour les plats composés, décompose et additionne les ingrédients principaux
- Si la quantité n'est pas précisée, utilise une portion standard adulte
- Les macros doivent être cohérentes : calories ≈ (protéines×4) + (glucides×4) + (lipides×9)
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
        print(f"Cache: {message.usage}")

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
