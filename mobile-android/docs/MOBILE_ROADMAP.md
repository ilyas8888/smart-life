# Mobile Roadmap — SmartLife Android

## Phase 0 — Contrat API ✅ DONE
- [x] API_CONTRACT.md complet
- [x] MOBILE_ROADMAP.md
- [x] DESIGN_RULES.md

## Phase 1 — Fondation ✅ DONE
- [x] Dépendances Gradle (Hilt, Retrofit, Room, DataStore, Navigation, Coil)
- [x] Thème SmartLife dark (Color.kt, Theme.kt)
- [x] Core network (ApiClient, ApiService, AuthInterceptor)
- [x] Core datastore (TokenDataStore)
- [x] Navigation (AppNavHost, BottomNavBar, Screen)
- [x] Auth feature (LoginScreen, RegisterScreen, AuthViewModel)
- [x] Home screen minimal (HomeScreen, HomeViewModel, SmartDayScoreCard)

## Phase 2 — MVP TODO
- [ ] Tasks (TasksScreen, TaskDetailSheet, Room cache)
- [ ] Reminders (RemindersScreen, ReminderSheet)
- [ ] Notes (NotesScreen, NoteEditorSheet)
- [ ] Agenda (AgendaScreen, TimelineScreen)
- [ ] Food (FoodScreen, AddFoodSheet, NutritionSummaryCard)
- [ ] Room database v1 (lecture + sync au démarrage)

## Phase 3 — Santé TODO
- [ ] Workout (WorkoutScreen, AddWorkoutSheet)
- [ ] Sleep (SleepScreen, SleepLogSheet, SleepCoachCard)
- [ ] Study (StudyScreen, StudySessionSheet, FlashcardScreen)
- [ ] Profile (ProfileScreen, EditProfileSheet, BadgesGrid)
- [ ] Deep links (smartlife://tasks/{id}, smartlife://social/posts/{id})

## Phase 4 — Social + IA TODO
- [ ] Social feed (SocialScreen, PostCard, CommentsSheet, CreatePostSheet)
- [ ] WebSocket STOMP notifications (krossbow)
- [ ] AI prompt (AiPromptSheet, AiStatusBanner)

## Phase 5 — Finition TODO
- [ ] Firebase FCM (FcmService, push-token backend)
- [ ] Offline writes v2 (WorkManager, SyncWorker, OfflineQueue)
- [ ] Accessibilité (contentDescription, semantics, TalkBack)
- [ ] Tests (JUnit, MockWebServer, Compose UI Tests)
- [ ] Icône + Splash Screen
- [ ] Signature release (keystore)
- [ ] Publication Play Store
