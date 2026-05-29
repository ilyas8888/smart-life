-- Add source_id and verified columns to food_cache
ALTER TABLE food_cache ADD COLUMN IF NOT EXISTS source_id VARCHAR(100);
ALTER TABLE food_cache ADD COLUMN IF NOT EXISTS verified BOOLEAN NOT NULL DEFAULT false;

-- Mark existing USDA entries as verified
UPDATE food_cache SET verified = true WHERE source = 'usda';

-- Index for faster verified lookups
CREATE INDEX IF NOT EXISTS idx_food_cache_verified ON food_cache (verified);

-- Seed ~100 common foods (values per 100g, source: USDA FoodData Central)
-- normalized_name = lowercase words sorted alphabetically
INSERT INTO food_cache (food_name, food_name_normalized, calories, protein_g, carbs_g, fat_g, fiber_g, source, food_type, hit_count, verified, created_at, last_used_at)
VALUES

-- PROTEINS
('Chicken breast, cooked',       'breast chicken cooked',        165, 31.0, 0.0,  3.6,  0.0,  'usda', 'SIMPLE_INGREDIENT', 0, true, NOW(), NOW()),
('Chicken thigh, cooked',        'chicken cooked thigh',         209, 26.0, 0.0,  11.0, 0.0,  'usda', 'SIMPLE_INGREDIENT', 0, true, NOW(), NOW()),
('Chicken breast, raw',          'breast chicken raw',           120, 22.5, 0.0,  2.6,  0.0,  'usda', 'SIMPLE_INGREDIENT', 0, true, NOW(), NOW()),
('Ground beef, 80% lean, cooked','beef cooked ground lean',       254, 17.2, 0.0,  20.0, 0.0,  'usda', 'SIMPLE_INGREDIENT', 0, true, NOW(), NOW()),
('Beef sirloin, cooked',         'beef cooked sirloin',          207, 26.1, 0.0,  10.6, 0.0,  'usda', 'SIMPLE_INGREDIENT', 0, true, NOW(), NOW()),
('Salmon, cooked',               'cooked salmon',                208, 20.4, 0.0,  13.0, 0.0,  'usda', 'SIMPLE_INGREDIENT', 0, true, NOW(), NOW()),
('Tuna, canned in water',        'canned tuna water',            116, 25.5, 0.0,  0.8,  0.0,  'usda', 'SIMPLE_INGREDIENT', 0, true, NOW(), NOW()),
('Egg, whole, hard-boiled',      'egg hardboiled whole',         155, 12.6, 1.1,  10.6, 0.0,  'usda', 'SIMPLE_INGREDIENT', 0, true, NOW(), NOW()),
('Egg white, raw',               'egg raw white',                52,  10.9, 0.7,  0.2,  0.0,  'usda', 'SIMPLE_INGREDIENT', 0, true, NOW(), NOW()),
('Shrimp, cooked',               'cooked shrimp',                99,  20.9, 0.0,  1.1,  0.0,  'usda', 'SIMPLE_INGREDIENT', 0, true, NOW(), NOW()),
('Turkey breast, cooked',        'breast cooked turkey',         189, 28.7, 0.0,  7.4,  0.0,  'usda', 'SIMPLE_INGREDIENT', 0, true, NOW(), NOW()),
('Cod, cooked',                  'cod cooked',                   105, 22.8, 0.0,  0.9,  0.0,  'usda', 'SIMPLE_INGREDIENT', 0, true, NOW(), NOW()),
('Sardines, canned in oil',      'canned oil sardines',          208, 24.6, 0.0,  11.5, 0.0,  'usda', 'SIMPLE_INGREDIENT', 0, true, NOW(), NOW()),
('Lentils, cooked',              'cooked lentils',               116, 9.0,  20.1, 0.4,  7.9,  'usda', 'SIMPLE_INGREDIENT', 0, true, NOW(), NOW()),
('Chickpeas, cooked',            'chickpeas cooked',             164, 8.9,  27.4, 2.6,  7.6,  'usda', 'SIMPLE_INGREDIENT', 0, true, NOW(), NOW()),
('Black beans, cooked',          'beans black cooked',           132, 8.9,  23.7, 0.5,  8.7,  'usda', 'SIMPLE_INGREDIENT', 0, true, NOW(), NOW()),
('Tofu, firm',                   'firm tofu',                    76,  8.1,  1.9,  4.8,  0.3,  'usda', 'SIMPLE_INGREDIENT', 0, true, NOW(), NOW()),
('Greek yogurt, plain, 0% fat',  '0 fat greek plain yogurt',     59,  10.2, 3.6,  0.4,  0.0,  'usda', 'SIMPLE_INGREDIENT', 0, true, NOW(), NOW()),
('Cottage cheese, 2% fat',       '2 cheese cottage fat',         90,  11.1, 3.4,  2.5,  0.0,  'usda', 'SIMPLE_INGREDIENT', 0, true, NOW(), NOW()),

-- GRAINS & STARCHES
('Rice, white, cooked',          'cooked rice white',            130, 2.7,  28.2, 0.3,  0.4,  'usda', 'SIMPLE_INGREDIENT', 0, true, NOW(), NOW()),
('Rice, brown, cooked',          'brown cooked rice',            123, 2.7,  25.6, 1.0,  1.6,  'usda', 'SIMPLE_INGREDIENT', 0, true, NOW(), NOW()),
('Pasta, cooked',                'cooked pasta',                 158, 5.8,  30.9, 0.9,  1.8,  'usda', 'SIMPLE_INGREDIENT', 0, true, NOW(), NOW()),
('Bread, white',                 'bread white',                  265, 9.0,  49.2, 3.2,  2.7,  'usda', 'SIMPLE_INGREDIENT', 0, true, NOW(), NOW()),
('Bread, whole wheat',           'bread wheat whole',            247, 12.7, 41.3, 4.2,  7.0,  'usda', 'SIMPLE_INGREDIENT', 0, true, NOW(), NOW()),
('Oats, rolled, cooked',         'cooked oats rolled',           71,  2.5,  12.0, 1.5,  1.7,  'usda', 'SIMPLE_INGREDIENT', 0, true, NOW(), NOW()),
('Quinoa, cooked',               'cooked quinoa',                120, 4.4,  21.9, 1.9,  2.8,  'usda', 'SIMPLE_INGREDIENT', 0, true, NOW(), NOW()),
('Potato, boiled',               'boiled potato',                87,  1.9,  20.1, 0.1,  1.8,  'usda', 'SIMPLE_INGREDIENT', 0, true, NOW(), NOW()),
('Sweet potato, cooked',         'cooked potato sweet',          86,  1.6,  20.1, 0.1,  3.0,  'usda', 'SIMPLE_INGREDIENT', 0, true, NOW(), NOW()),
('Couscous, cooked',             'cooked couscous',              112, 3.8,  23.2, 0.2,  1.4,  'usda', 'SIMPLE_INGREDIENT', 0, true, NOW(), NOW()),
('Corn, yellow, cooked',         'corn cooked yellow',           96,  3.4,  20.9, 1.5,  2.4,  'usda', 'SIMPLE_INGREDIENT', 0, true, NOW(), NOW()),

-- VEGETABLES
('Broccoli, raw',                'broccoli raw',                 34,  2.8,  6.6,  0.4,  2.6,  'usda', 'SIMPLE_INGREDIENT', 0, true, NOW(), NOW()),
('Spinach, raw',                 'raw spinach',                  23,  2.9,  3.6,  0.4,  2.2,  'usda', 'SIMPLE_INGREDIENT', 0, true, NOW(), NOW()),
('Tomato, raw',                  'raw tomato',                   18,  0.9,  3.9,  0.2,  1.2,  'usda', 'SIMPLE_INGREDIENT', 0, true, NOW(), NOW()),
('Carrot, raw',                  'carrot raw',                   41,  0.9,  9.6,  0.2,  2.8,  'usda', 'SIMPLE_INGREDIENT', 0, true, NOW(), NOW()),
('Onion, raw',                   'onion raw',                    40,  1.1,  9.3,  0.1,  1.7,  'usda', 'SIMPLE_INGREDIENT', 0, true, NOW(), NOW()),
('Garlic, raw',                  'garlic raw',                   149, 6.4,  33.1, 0.5,  2.1,  'usda', 'SIMPLE_INGREDIENT', 0, true, NOW(), NOW()),
('Bell pepper, red, raw',        'bell pepper raw red',          31,  1.0,  6.0,  0.3,  2.1,  'usda', 'SIMPLE_INGREDIENT', 0, true, NOW(), NOW()),
('Cucumber, raw',                'cucumber raw',                 15,  0.7,  3.6,  0.1,  0.5,  'usda', 'SIMPLE_INGREDIENT', 0, true, NOW(), NOW()),
('Lettuce, raw',                 'lettuce raw',                  17,  1.2,  3.3,  0.3,  2.1,  'usda', 'SIMPLE_INGREDIENT', 0, true, NOW(), NOW()),
('Zucchini, raw',                'raw zucchini',                 17,  1.2,  3.1,  0.3,  1.0,  'usda', 'SIMPLE_INGREDIENT', 0, true, NOW(), NOW()),
('Cauliflower, raw',             'cauliflower raw',              25,  1.9,  5.0,  0.3,  2.0,  'usda', 'SIMPLE_INGREDIENT', 0, true, NOW(), NOW()),
('Mushrooms, raw',               'mushrooms raw',                22,  3.1,  3.3,  0.3,  1.0,  'usda', 'SIMPLE_INGREDIENT', 0, true, NOW(), NOW()),
('Eggplant, raw',                'eggplant raw',                 25,  1.0,  5.9,  0.2,  3.0,  'usda', 'SIMPLE_INGREDIENT', 0, true, NOW(), NOW()),
('Green beans, cooked',          'beans cooked green',           35,  1.9,  7.9,  0.1,  3.4,  'usda', 'SIMPLE_INGREDIENT', 0, true, NOW(), NOW()),
('Asparagus, cooked',            'asparagus cooked',             22,  2.4,  4.1,  0.2,  2.1,  'usda', 'SIMPLE_INGREDIENT', 0, true, NOW(), NOW()),
('Peas, cooked',                 'cooked peas',                  84,  5.4,  15.6, 0.2,  5.5,  'usda', 'SIMPLE_INGREDIENT', 0, true, NOW(), NOW()),
('Kale, raw',                    'kale raw',                     49,  4.3,  8.8,  0.9,  3.6,  'usda', 'SIMPLE_INGREDIENT', 0, true, NOW(), NOW()),
('Celery, raw',                  'celery raw',                   16,  0.7,  3.0,  0.2,  1.6,  'usda', 'SIMPLE_INGREDIENT', 0, true, NOW(), NOW()),

-- FRUITS
('Apple, raw',                   'apple raw',                    52,  0.3,  13.8, 0.2,  2.4,  'usda', 'SIMPLE_INGREDIENT', 0, true, NOW(), NOW()),
('Banana, raw',                  'banana raw',                   89,  1.1,  22.8, 0.3,  2.6,  'usda', 'SIMPLE_INGREDIENT', 0, true, NOW(), NOW()),
('Orange, raw',                  'orange raw',                   47,  0.9,  11.8, 0.1,  2.4,  'usda', 'SIMPLE_INGREDIENT', 0, true, NOW(), NOW()),
('Strawberry, raw',              'raw strawberry',               32,  0.7,  7.7,  0.3,  2.0,  'usda', 'SIMPLE_INGREDIENT', 0, true, NOW(), NOW()),
('Blueberry, raw',               'blueberry raw',                57,  0.7,  14.5, 0.3,  2.4,  'usda', 'SIMPLE_INGREDIENT', 0, true, NOW(), NOW()),
('Avocado, raw',                 'avocado raw',                  160, 2.0,  8.5,  14.7, 6.7,  'usda', 'SIMPLE_INGREDIENT', 0, true, NOW(), NOW()),
('Mango, raw',                   'mango raw',                    60,  0.8,  15.0, 0.4,  1.6,  'usda', 'SIMPLE_INGREDIENT', 0, true, NOW(), NOW()),
('Grapes, raw',                  'grapes raw',                   69,  0.7,  18.1, 0.2,  0.9,  'usda', 'SIMPLE_INGREDIENT', 0, true, NOW(), NOW()),
('Watermelon, raw',              'raw watermelon',               30,  0.6,  7.6,  0.2,  0.4,  'usda', 'SIMPLE_INGREDIENT', 0, true, NOW(), NOW()),
('Pineapple, raw',               'pineapple raw',                50,  0.5,  13.1, 0.1,  1.4,  'usda', 'SIMPLE_INGREDIENT', 0, true, NOW(), NOW()),
('Pear, raw',                    'pear raw',                     57,  0.4,  15.2, 0.1,  3.1,  'usda', 'SIMPLE_INGREDIENT', 0, true, NOW(), NOW()),
('Kiwi, raw',                    'kiwi raw',                     61,  1.1,  14.7, 0.5,  3.0,  'usda', 'SIMPLE_INGREDIENT', 0, true, NOW(), NOW()),
('Dates, dried',                 'dates dried',                  282, 2.5,  75.0, 0.4,  8.0,  'usda', 'SIMPLE_INGREDIENT', 0, true, NOW(), NOW()),

-- DAIRY
('Milk, whole',                  'milk whole',                   61,  3.2,  4.8,  3.3,  0.0,  'usda', 'SIMPLE_INGREDIENT', 0, true, NOW(), NOW()),
('Milk, skim',                   'milk skim',                    35,  3.4,  5.0,  0.1,  0.0,  'usda', 'SIMPLE_INGREDIENT', 0, true, NOW(), NOW()),
('Yogurt, plain, whole milk',    'milk plain whole yogurt',      61,  3.5,  4.7,  3.3,  0.0,  'usda', 'SIMPLE_INGREDIENT', 0, true, NOW(), NOW()),
('Cheese, cheddar',              'cheddar cheese',               403, 24.9, 1.3,  33.1, 0.0,  'usda', 'SIMPLE_INGREDIENT', 0, true, NOW(), NOW()),
('Cheese, mozzarella',           'cheese mozzarella',            280, 27.5, 2.2,  17.1, 0.0,  'usda', 'SIMPLE_INGREDIENT', 0, true, NOW(), NOW()),
('Butter, unsalted',             'butter unsalted',              717, 0.9,  0.1,  81.1, 0.0,  'usda', 'SIMPLE_INGREDIENT', 0, true, NOW(), NOW()),
('Cream cheese',                 'cheese cream',                 342, 5.9,  4.1,  33.8, 0.0,  'usda', 'SIMPLE_INGREDIENT', 0, true, NOW(), NOW()),
('Parmesan, grated',             'grated parmesan',              431, 37.9, 4.1,  28.6, 0.0,  'usda', 'SIMPLE_INGREDIENT', 0, true, NOW(), NOW()),

-- FATS, OILS & NUTS
('Olive oil',                    'oil olive',                    884, 0.0,  0.0,  100.0,0.0,  'usda', 'SIMPLE_INGREDIENT', 0, true, NOW(), NOW()),
('Sunflower oil',                'oil sunflower',                884, 0.0,  0.0,  100.0,0.0,  'usda', 'SIMPLE_INGREDIENT', 0, true, NOW(), NOW()),
('Almonds, raw',                 'almonds raw',                  579, 21.2, 21.6, 49.9, 12.5, 'usda', 'SIMPLE_INGREDIENT', 0, true, NOW(), NOW()),
('Walnuts, raw',                 'raw walnuts',                  654, 15.2, 13.7, 65.2, 6.7,  'usda', 'SIMPLE_INGREDIENT', 0, true, NOW(), NOW()),
('Cashews, raw',                 'cashews raw',                  553, 18.2, 30.2, 43.9, 3.3,  'usda', 'SIMPLE_INGREDIENT', 0, true, NOW(), NOW()),
('Peanut butter, smooth',        'butter peanut smooth',         588, 24.9, 20.1, 50.4, 6.0,  'usda', 'SIMPLE_INGREDIENT', 0, true, NOW(), NOW()),
('Chia seeds',                   'chia seeds',                   486, 16.5, 42.1, 30.7, 34.4, 'usda', 'SIMPLE_INGREDIENT', 0, true, NOW(), NOW()),
('Flaxseeds',                    'flaxseeds',                    534, 18.3, 28.9, 42.2, 27.3, 'usda', 'SIMPLE_INGREDIENT', 0, true, NOW(), NOW()),

-- CONDIMENTS & OTHER
('Honey',                        'honey',                        304, 0.3,  82.4, 0.0,  0.2,  'usda', 'SIMPLE_INGREDIENT', 0, true, NOW(), NOW()),
('Sugar, white',                 'sugar white',                  387, 0.0,  100.0,0.0,  0.0,  'usda', 'SIMPLE_INGREDIENT', 0, true, NOW(), NOW()),
('Dark chocolate, 70%',          '70 chocolate dark',            598, 7.8,  45.9, 42.6, 10.9, 'usda', 'SIMPLE_INGREDIENT', 0, true, NOW(), NOW()),
('Hummus',                       'hummus',                       177, 7.9,  14.3, 10.7, 6.0,  'usda', 'PREPARED_DISH',    0, true, NOW(), NOW()),
('Tomato sauce',                 'sauce tomato',                 35,  1.5,  7.9,  0.4,  1.5,  'usda', 'SIMPLE_INGREDIENT', 0, true, NOW(), NOW()),
('Soy sauce',                    'sauce soy',                    60,  5.7,  5.6,  0.1,  0.8,  'usda', 'SIMPLE_INGREDIENT', 0, true, NOW(), NOW()),
('Orange juice',                 'juice orange',                 45,  0.7,  10.4, 0.2,  0.2,  'usda', 'SIMPLE_INGREDIENT', 0, true, NOW(), NOW()),
('Soy milk',                     'milk soy',                     54,  3.3,  6.3,  1.8,  0.6,  'usda', 'SIMPLE_INGREDIENT', 0, true, NOW(), NOW()),
('Coffee, black',                'black coffee',                 2,   0.3,  0.0,  0.0,  0.0,  'usda', 'SIMPLE_INGREDIENT', 0, true, NOW(), NOW()),
('Oat milk',                     'milk oat',                     47,  1.0,  7.0,  1.5,  0.3,  'usda', 'SIMPLE_INGREDIENT', 0, true, NOW(), NOW())

ON CONFLICT (food_name_normalized) DO NOTHING;
