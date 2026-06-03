# Design Rules — SmartLife Android

## Palette — Material 3 Dark

| Rôle M3 | Hex | Usage |
|---|---|---|
| background | #0D1117 | Fond principal |
| surface | #161B22 | Cards, sheets |
| surfaceVariant | #1E2533 | Input backgrounds |
| primary | #6366F1 | Boutons, accents principaux |
| onPrimary | #FFFFFF | Texte sur primary |
| secondary | #8B5CF6 | Accents secondaires |
| onSecondary | #FFFFFF | Texte sur secondary |
| tertiary | #38BDF8 | Info, liens |
| onBackground | #E6EDF3 | Texte principal |
| onSurface | #C9D1D9 | Texte secondaire |
| outline | #30363D | Bordures |
| error | #F85149 | Erreurs |

## Typographie

- Famille : Roboto (défaut Android)
- Title Large : 22sp, W600
- Title Medium : 18sp, W600
- Body Large : 16sp, W400
- Body Medium : 14sp, W400
- Label Small : 11sp, W500

## Espacements

- Padding screen : 16dp
- Gap entre cards : 12dp
- Corner radius card : 16dp
- Corner radius button : 12dp
- Corner radius input : 12dp
- Bottom bar height : 80dp

## Comportements

- Dark mode forcé (pas de mode clair)
- Pas de dynamic color (Material You désactivé)
- Swipe droite → compléter une tâche
- Appui long → éditer un élément
- Bouton retour : ferme la sheet ou revient à l'écran précédent
- FAB (Floating Action Button) : sur TasksScreen, NotesScreen, FoodScreen
- Bottom sheet : pour toutes les créations/éditions
- Haptic feedback sur validation (VibrationEffect.EFFECT_CLICK)

## Navigation

Bottom bar 5 items :
1. Home (Maison) — icône : Home
2. Agenda — icône : CalendarDays
3. Ajouter (+) — icône : Plus (central, plus grand, couleur primary)
4. Social — icône : Users
5. Profil — icône : User

Bouton + central → ModalBottomSheet avec 8 options :
tâche / rappel / repas / sport / note / sommeil / étude / prompt IA

## États vides

Chaque liste vide affiche :
- Icône Lucide centrée, couleur onSurface/50%
- Texte explicatif (ex : "Aucune tâche pour aujourd'hui")
- Bouton "Ajouter" si pertinent

## Accessibilité

- contentDescription sur toutes les icônes
- Taille minimale tap target : 48dp
- Contraste texte/fond minimum 4.5:1
- Pas de couleur seule pour véhiculer l'info
