package com.smartlife.dto;

import lombok.Data;

import java.util.List;
import java.util.Map;

@Data
public class PromptResponse {
    private String summary;
    private List<Map<String, Object>> tasksCreated;
    private List<Map<String, Object>> remindersCreated;
    private List<Map<String, Object>> notesCreated;
    private List<Map<String, Object>> contactsCreated;
    private List<Map<String, Object>> foodLogsCreated;
    private List<Map<String, Object>> diaryEntriesCreated;
    private List<Map<String, Object>> workoutsCreated;
    private String rawAiResponse;
}
