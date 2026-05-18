import os
import json
from datetime import datetime
from fastapi import FastAPI, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import anthropic
import secrets
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="SmartLife AI Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8080"],
    allow_methods=["POST"],
    allow_headers=["Content-Type", "X-Internal-Key"],
)

client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))
INTERNAL_SECRET = os.getenv("AI_INTERNAL_SECRET", "")


class PromptPayload(BaseModel):
    prompt: str
    user_id: int
    cached_foods: list[dict] | None = None


class FoodExtractPayload(BaseModel):
    foods: list[dict]
    meal_type: str = "SNACK"
    cached_foods: list[dict] | None = None


class FoodPromptPayload(BaseModel):
    prompt: str
    meal_type: str | None = None
    cached_foods: list[dict] | None = None


class WorkoutPromptPayload(BaseModel):
    prompt: str


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
  "workouts": [
    {
      "title": "Nom de la séance (ex: Muscu jambes, Course à pied, Yoga)",
      "duration_minutes": 60,
      "calories_burned": 400,
      "notes": "...",
      "exercises": [
        {"name": "Squat", "sets": 4, "reps": 12, "weight_kg": 80.0, "duration_seconds": null},
        {"name": "Course", "sets": null, "reps": null, "weight_kg": null, "duration_seconds": 1800}
      ]
    }
  ],
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
- Pour les workouts: extraire si l'utilisateur mentionne sport, gym, musculation, course, yoga, natation, vélo, marche sportive, etc.
- Estimer calories_burned selon l'activité et la durée si non précisée (course 10km/h = ~600kcal/h, muscu = ~300kcal/h, yoga = ~200kcal/h)
- Retourne UNIQUEMENT le JSON, rien d'autre"""


@app.post("/process")
async def process_prompt(payload: PromptPayload, x_internal_key: str = Header(default="")):
    if not INTERNAL_SECRET or not secrets.compare_digest(x_internal_key, INTERNAL_SECRET):
        raise HTTPException(status_code=403, detail="Forbidden")
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


FOOD_NUTRIENT_SYSTEM_PROMPT = """Tu es un expert en nutrition. Pour chaque aliment listé, retourne ses valeurs nutritionnelles précises.
Retourne UNIQUEMENT un JSON valide avec cette structure:
{
  "food_logs": [
    {
      "meal_type": "BREAKFAST|LUNCH|DINNER|SNACK",
      "food_item": "Nom exact de l'aliment",
      "quantity": "portion utilisée (ex: 150g, 1 unité, 1 bol)",
      "calories": 300,
      "protein_g": 12.5,
      "carbs_g": 45.0,
      "fat_g": 8.0,
      "fiber_g": 3.5,
      "notes": "",
      "nutrition_details": {
        "vitamine_c": "10mg",
        "calcium": "120mg",
        "fer": "2mg",
        "potassium": "300mg",
        "sodium": "200mg"
      }
    }
  ]
}
Règles:
- calories ≈ (protéines×4) + (glucides×4) + (lipides×9)
- Si la quantité n'est pas précisée, utilise une portion standard adulte
- Un œuf = 70kcal, sandwich = 350kcal, poulet 150g = 248kcal, riz 150g cuit = 175kcal, banane = 90kcal
- Retourne UNIQUEMENT le JSON, rien d'autre"""


def _parse_ai_food_response(raw_text: str, meal_type: str | None = None) -> dict:
    if raw_text.startswith("```"):
        raw_text = raw_text.split("```")[1]
        if raw_text.startswith("json"):
            raw_text = raw_text[4:]
    if raw_text.endswith("```"):
        raw_text = raw_text[:-3]
    result = json.loads(raw_text.strip())
    if meal_type:
        for fl in result.get("food_logs", []):
            fl["meal_type"] = meal_type
    return result


@app.post("/extract-food")
async def extract_food(payload: FoodExtractPayload, x_internal_key: str = Header(default="")):
    if not INTERNAL_SECRET or not secrets.compare_digest(x_internal_key, INTERNAL_SECRET):
        raise HTTPException(status_code=403, detail="Forbidden")

    foods_text = "\n".join(
        f"- {f.get('name', '')}" + (f" ({f.get('quantity')})" if f.get("quantity") else "")
        for f in payload.foods
    )
    user_content = f"Type de repas: {payload.meal_type}\n\nAliments à analyser:\n{foods_text}"

    if payload.cached_foods:
        cache_lines = "\n".join(
            f"- {c.get('name')}: {c.get('calories')}kcal, P:{c.get('protein_g')}g, G:{c.get('carbs_g')}g, L:{c.get('fat_g')}g"
            for c in payload.cached_foods
        )
        user_content = (
            "[VALEURS DÉJÀ CONNUES — utilise-les exactement si l'aliment correspond]\n"
            f"{cache_lines}\n\n{user_content}"
        )

    try:
        message = client.messages.create(
            model="claude-sonnet-4-6",
            max_tokens=1024,
            system=FOOD_NUTRIENT_SYSTEM_PROMPT,
            messages=[{"role": "user", "content": user_content}],
        )
        return _parse_ai_food_response(message.content[0].text.strip(), payload.meal_type)
    except json.JSONDecodeError as e:
        raise HTTPException(status_code=500, detail=f"AI returned invalid JSON: {e}")
    except anthropic.APIError as e:
        raise HTTPException(status_code=502, detail=f"Claude API error: {e}")


@app.post("/extract-food-from-prompt")
async def extract_food_from_prompt(payload: FoodPromptPayload, x_internal_key: str = Header(default="")):
    if not INTERNAL_SECRET or not secrets.compare_digest(x_internal_key, INTERNAL_SECRET):
        raise HTTPException(status_code=403, detail="Forbidden")

    meal_hint = f"Type de repas suggéré: {payload.meal_type}\n\n" if payload.meal_type else ""
    user_content = f"{meal_hint}Description du repas:\n{payload.prompt}"

    if payload.cached_foods:
        cache_lines = "\n".join(
            f"- {c.get('name')}: {c.get('calories')}kcal, P:{c.get('protein_g')}g, G:{c.get('carbs_g')}g, L:{c.get('fat_g')}g"
            for c in payload.cached_foods
        )
        user_content = (
            "[VALEURS DÉJÀ CONNUES — utilise-les exactement si l'aliment correspond]\n"
            f"{cache_lines}\n\n{user_content}"
        )

    try:
        message = client.messages.create(
            model="claude-sonnet-4-6",
            max_tokens=1024,
            system=FOOD_NUTRIENT_SYSTEM_PROMPT,
            messages=[{"role": "user", "content": user_content}],
        )
        return _parse_ai_food_response(message.content[0].text.strip(), payload.meal_type)
    except json.JSONDecodeError as e:
        raise HTTPException(status_code=500, detail=f"AI returned invalid JSON: {e}")
    except anthropic.APIError as e:
        raise HTTPException(status_code=502, detail=f"Claude API error: {e}")


WORKOUT_SYSTEM_PROMPT = """Tu es un coach sportif expert. Analyse la description d'une séance de sport et retourne les données structurées.
Retourne UNIQUEMENT un JSON valide :
{
  "workout": {
    "title": "Nom de la séance (ex: Muscu dos/biceps, Course à pied 5km, Yoga matinal)",
    "duration_minutes": 45,
    "calories_burned": 300,
    "notes": "",
    "exercises": [
      {"name": "Squat", "sets": 4, "reps": 12, "weight_kg": 80.0, "duration_seconds": null},
      {"name": "Course", "sets": null, "reps": null, "weight_kg": null, "duration_seconds": 1800}
    ]
  }
}
Règles :
- Estime calories_burned si non précisé : muscu ≈ 5kcal/min, course ≈ 10kcal/min, vélo ≈ 8kcal/min, yoga ≈ 3kcal/min, natation ≈ 9kcal/min
- Les exercices sont optionnels (liste vide [] si non mentionnés)
- Retourne UNIQUEMENT le JSON, rien d'autre"""


@app.post("/extract-workout-from-prompt")
async def extract_workout_from_prompt(payload: WorkoutPromptPayload, x_internal_key: str = Header(default="")):
    if not INTERNAL_SECRET or not secrets.compare_digest(x_internal_key, INTERNAL_SECRET):
        raise HTTPException(status_code=403, detail="Forbidden")
    try:
        message = client.messages.create(
            model="claude-sonnet-4-6",
            max_tokens=1024,
            system=WORKOUT_SYSTEM_PROMPT,
            messages=[{"role": "user", "content": f"Séance décrite : {payload.prompt}"}],
        )
        raw_text = message.content[0].text.strip()
        if raw_text.startswith("```"):
            raw_text = raw_text.split("```")[1]
            if raw_text.startswith("json"):
                raw_text = raw_text[4:]
        if raw_text.endswith("```"):
            raw_text = raw_text[:-3]
        return json.loads(raw_text.strip())
    except json.JSONDecodeError as e:
        raise HTTPException(status_code=500, detail=f"AI returned invalid JSON: {e}")
    except anthropic.APIError as e:
        raise HTTPException(status_code=502, detail=f"Claude API error: {e}")


@app.get("/health")
def health():
    return {"status": "ok", "model": "claude-sonnet-4-6"}
