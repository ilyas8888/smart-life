package com.smartlife.dto;

import lombok.Data;

import java.util.List;
import java.util.Map;

/**
 * Confirmation d'une suppression demandée via l'assistant IA (human-in-the-loop).
 * Le client ne renvoie QUE l'intention (type + portée), jamais d'identifiants :
 * le backend re-dérive les entités à supprimer et les scope à l'utilisateur authentifié.
 */
@Data
public class DeletionConfirmRequest {
    private List<Map<String, String>> deletions;
}
