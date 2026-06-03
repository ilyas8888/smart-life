package com.smartlife.config;

import com.smartlife.model.IdempotencyKey;
import com.smartlife.model.User;
import com.smartlife.repository.IdempotencyKeyRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

@Component
@RequiredArgsConstructor
public class IdempotencyInterceptor implements HandlerInterceptor {

    private static final String ATTR = "idempotency_key";
    private final IdempotencyKeyRepository idempotencyKeyRepository;

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        String key = request.getHeader("X-Idempotency-Key");
        if (key == null || key.isBlank() || !"POST".equals(request.getMethod())) return true;

        var auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !(auth.getPrincipal() instanceof User user)) return true;

        if (idempotencyKeyRepository.existsByUserIdAndKey(user.getId(), key)) {
            response.setStatus(HttpServletResponse.SC_OK);
            response.setContentType("application/json");
            response.getWriter().write("{\"idempotent\":true}");
            return false;
        }

        request.setAttribute(ATTR, key);
        return true;
    }

    @Override
    public void afterCompletion(HttpServletRequest request, HttpServletResponse response, Object handler, Exception ex) {
        String key = (String) request.getAttribute(ATTR);
        if (key == null) return;
        if (response.getStatus() < 200 || response.getStatus() >= 300) return;

        var auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !(auth.getPrincipal() instanceof User user)) return;

        try {
            idempotencyKeyRepository.save(IdempotencyKey.builder()
                    .userId(user.getId())
                    .key(key)
                    .endpoint(request.getRequestURI())
                    .build());
        } catch (DataIntegrityViolationException ignored) {
            // Race condition: another thread saved the same key first — safe to ignore
        }
    }
}
