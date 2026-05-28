package com.smartlife.exception;

import lombok.Getter;

@Getter
public class AiAccessDeniedException extends RuntimeException {

    private final String currentStatus;
    private final int trialUsed;
    private final int trialQuota;
    private final int monthlyUsed;
    private final Integer monthlyQuota;

    public AiAccessDeniedException(String currentStatus, int trialUsed, int trialQuota,
                                   int monthlyUsed, Integer monthlyQuota) {
        super("AI access denied");
        this.currentStatus = currentStatus;
        this.trialUsed = trialUsed;
        this.trialQuota = trialQuota;
        this.monthlyUsed = monthlyUsed;
        this.monthlyQuota = monthlyQuota;
    }
}
