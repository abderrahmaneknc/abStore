package com.abstorebackend.demo.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

@Component
public class RateLimitFilter extends OncePerRequestFilter {

    private static final int LOGIN_MAX_ATTEMPTS = 5;
    private static final int LOGIN_WINDOW_SECONDS = 900;
    private static final int RESET_MAX_ATTEMPTS = 3;
    private static final int RESET_WINDOW_SECONDS = 3600;
    private static final int PUBLIC_POST_MAX_ATTEMPTS = 30;
    private static final int PUBLIC_POST_WINDOW_SECONDS = 60;

    private final Map<String, RateLimitBucket> buckets = new ConcurrentHashMap<>();

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain) throws ServletException, IOException {
        String path = request.getRequestURI();
        String method = request.getMethod();
        String clientKey = resolveClientKey(request);

        RateLimitRule rule = resolveRule(method, path);
        if (rule != null && isRateLimited(clientKey + ":" + rule.name(), rule.maxAttempts(), rule.windowSeconds())) {
            response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
            response.getWriter().write("{\"error\":\"Too many requests. Please try again later.\"}");
            return;
        }

        filterChain.doFilter(request, response);
    }

    private RateLimitRule resolveRule(String method, String path) {
        if (HttpMethod.POST.matches(method) && "/api/auth/login".equals(path)) {
            return new RateLimitRule("login", LOGIN_MAX_ATTEMPTS, LOGIN_WINDOW_SECONDS);
        }
        if (HttpMethod.POST.matches(method) && "/api/auth/forgot-password".equals(path)) {
            return new RateLimitRule("reset", RESET_MAX_ATTEMPTS, RESET_WINDOW_SECONDS);
        }
        if (HttpMethod.PUT.matches(method) && "/api/auth/password".equals(path)) {
            return new RateLimitRule("password-change", LOGIN_MAX_ATTEMPTS, LOGIN_WINDOW_SECONDS);
        }
        if (HttpMethod.POST.matches(method) && ("/api/orders".equals(path)
                || "/api/contact".equals(path)
                || "/api/feedback".equals(path))) {
            return new RateLimitRule("public-post", PUBLIC_POST_MAX_ATTEMPTS, PUBLIC_POST_WINDOW_SECONDS);
        }
        return null;
    }

    private boolean isRateLimited(String key, int maxAttempts, int windowSeconds) {
        long now = Instant.now().getEpochSecond();
        RateLimitBucket bucket = buckets.computeIfAbsent(key, ignored -> new RateLimitBucket(now));

        synchronized (bucket) {
            if (now - bucket.windowStart >= windowSeconds) {
                bucket.windowStart = now;
                bucket.counter.set(0);
            }
            return bucket.counter.incrementAndGet() > maxAttempts;
        }
    }

    private String resolveClientKey(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");
        if (forwarded != null && !forwarded.isBlank()) {
            return forwarded.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }

    private record RateLimitRule(String name, int maxAttempts, int windowSeconds) {
    }

    private static final class RateLimitBucket {
        private volatile long windowStart;
        private final AtomicInteger counter = new AtomicInteger(0);

        private RateLimitBucket(long windowStart) {
            this.windowStart = windowStart;
        }
    }
}