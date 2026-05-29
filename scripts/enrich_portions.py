import json
import re
import time
import urllib.parse
import urllib.request
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
V19_PATH = ROOT / "backend/src/main/resources/db/migration/V19__food_cache_enhancements.sql"
OUTPUT_PATH = ROOT / "backend/src/main/resources/db/migration/V23__enrich_portions.sql"
API_KEY = "DEMO_KEY"
SEARCH_URL = "https://api.nal.usda.gov/fdc/v1/foods/search"
DETAIL_URL = "https://api.nal.usda.gov/fdc/v1/food/{fdc_id}"


def read_foods_from_v19():
    text = V19_PATH.read_text(encoding="utf-8")
    pattern = re.compile(r"\('((?:[^']|'')*)'\s*,\s*'((?:[^']|'')*)'", re.MULTILINE)
    return [
        (food_name.replace("''", "'"), normalized.replace("''", "'"))
        for food_name, normalized in pattern.findall(text)
    ]


def get_json(url, params):
    query = urllib.parse.urlencode(params)
    with urllib.request.urlopen(f"{url}?{query}", timeout=20) as response:
        return json.loads(response.read().decode("utf-8"))


def search_fdc_id(food_name):
    data = get_json(SEARCH_URL, {
        "query": food_name,
        "dataType": "Foundation,SR Legacy",
        "pageSize": 3,
        "api_key": API_KEY,
    })
    for food in data.get("foods", []):
        fdc_id = food.get("fdcId")
        if fdc_id:
            return fdc_id
    return None


def fetch_food_detail(fdc_id):
    return get_json(DETAIL_URL.format(fdc_id=fdc_id), {"api_key": API_KEY})


def map_unit(description):
    desc = description.lower()
    for key in ("large", "medium", "small", "whole", "fruit", "egg", "clove", "slice", "piece"):
        if key in desc:
            return key
    if "cup" in desc:
        return "cup"
    if "tablespoon" in desc or "tbsp" in desc:
        return "tbsp"
    if "teaspoon" in desc or "tsp" in desc:
        return "tsp"
    if "bowl" in desc:
        return "bowl"
    if "serving" in desc:
        return "serving"
    return None


def portion_label(portion):
    amount = portion.get("amount")
    description = (
        portion.get("portionDescription")
        or portion.get("modifier")
        or ""
    ).strip()
    measure_unit = portion.get("measureUnit") or {}
    unit_name = (measure_unit.get("name") or "").strip()

    parts = []
    if amount:
        parts.append(str(int(amount) if float(amount).is_integer() else amount))
    if description:
        parts.append(description)
    elif unit_name:
        parts.append(unit_name)
    return " ".join(parts).strip() or "portion USDA"


def extract_usda_portions(detail):
    portions = {}
    for portion in detail.get("foodPortions", []):
        grams = portion.get("gramWeight")
        if not grams:
            continue
        label = portion_label(portion)
        unit = map_unit(label)
        if not unit or unit in portions:
            continue
        portions[unit] = {
            "grams": round(float(grams), 1),
            "label": label,
            "source": "usda",
            "confidence": 0.95,
        }
    return portions


def default_portions(food_name, normalized):
    text = f"{food_name} {normalized}".lower()
    liquids = ("milk", "juice", "coffee", "oil", "sauce")
    leaves = ("spinach", "lettuce", "kale", "herb")
    round_fruits_vegetables = (
        "apple", "banana", "orange", "strawberry", "blueberry", "avocado", "mango",
        "grapes", "watermelon", "pineapple", "pear", "kiwi", "dates", "tomato",
        "onion", "carrot", "potato", "garlic", "pepper", "cucumber", "zucchini",
        "mushroom", "eggplant", "cauliflower", "broccoli", "celery",
    )

    if any(word in text for word in leaves):
        unit, grams = "cup", 30
    elif any(word in text for word in liquids):
        unit, grams = "cup", 240
    elif "egg" in text:
        unit, grams = "egg", 50
    elif "bread" in text:
        unit, grams = "slice", 28
    elif any(word in text for word in round_fruits_vegetables):
        unit, grams = "piece", 100
    else:
        unit, grams = "serving", 100

    return {
        unit: {
            "grams": grams,
            "label": "estimé",
            "source": "default",
            "confidence": 0.2,
        }
    }


def sql_quote(value):
    return value.replace("'", "''")


def build_update(normalized, portions):
    portions_json = json.dumps(portions, ensure_ascii=False, sort_keys=True)
    return (
        "UPDATE food_cache\n"
        "SET nutrition_details = COALESCE(nutrition_details,'{}'::jsonb) ||\n"
        f"    jsonb_build_object('portions', '{sql_quote(portions_json)}'::jsonb)\n"
        f"WHERE food_name_normalized = '{sql_quote(normalized)}' AND source = 'usda';"
    )


def main():
    foods = read_foods_from_v19()
    updates = []
    usda_count = 0
    fallback_count = 0

    for food_name, normalized in foods:
        portions = {}
        try:
            fdc_id = search_fdc_id(food_name)
            time.sleep(0.3)
            if fdc_id:
                detail = fetch_food_detail(fdc_id)
                time.sleep(0.3)
                portions = extract_usda_portions(detail)
        except Exception as exc:
            print(f"[WARN] USDA lookup failed for {food_name}: {exc}")

        if portions:
            usda_count += 1
        else:
            portions = default_portions(food_name, normalized)
            fallback_count += 1

        updates.append(build_update(normalized, portions))

    OUTPUT_PATH.write_text("\n\n".join(updates) + "\n", encoding="utf-8")
    print(f"Generated {OUTPUT_PATH}")
    print(f"USDA enriched: {usda_count}")
    print(f"Fallback defaults: {fallback_count}")


if __name__ == "__main__":
    main()
