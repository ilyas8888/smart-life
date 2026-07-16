 ---
  Cas 1 — Problème côté backend Spring Boot

  HF Space backend → Settings → Variables : ajouter ou mettre à jour :

  OTEL_SDK_DISABLED = true

  Puis Restart le Space. Aucun redéploiement de code — l'SDK OTel se désactive entièrement au démarrage.

  ---
  Cas 2 — Problème côté AI Service FastAPI

  Dans ai-service/Dockerfile, le CMD actuel est :

  CMD ["opentelemetry-instrument", "uvicorn", "main:app", ...]

  Pour rollback, retirer opentelemetry-instrument :

  CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "7860"]

  Commit + push → redéploiement HF Space AI service.

  ---
  Cas 3 — Rollback total (les deux)

  1. OTEL_SDK_DISABLED=true sur HF Space backend → Restart
  2. Revert Dockerfile AI service → push

  ---
  Phase 5.4 est documentée — aucun fichier à modifier, c'est une procédure opérationnelle.

  ---