package com.classroomhub.config;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.env.EnvironmentPostProcessor;
import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.core.env.MapPropertySource;

import java.io.BufferedReader;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.Map;

/**
 * Loads a {@code .env} file from the project working directory (or the {@code backend/} folder
 * when run from the parent project root) into the Spring {@link org.springframework.core.env.Environment}.
 *
 * Note: {@code EnvironmentPostProcessor} is marked deprecated in Spring Boot 4.0.x but remains
 * functional. We rely on it intentionally — when Spring publishes a stable replacement we will
 * migrate. The deprecation warning is suppressed.
 */
@SuppressWarnings("removal")
public class DotenvEnvironmentPostProcessor implements EnvironmentPostProcessor {

    private static final String SOURCE_NAME = "dotenvFile";

    @Override
    public void postProcessEnvironment(ConfigurableEnvironment env, SpringApplication app) {
        Path dotenv = locateDotenv();
        if (dotenv == null) return;

        Map<String, Object> values = new HashMap<>();
        try (BufferedReader reader = Files.newBufferedReader(dotenv, StandardCharsets.UTF_8)) {
            String line;
            while ((line = reader.readLine()) != null) {
                String trimmed = line.trim();
                if (trimmed.isEmpty() || trimmed.startsWith("#")) continue;
                int eq = trimmed.indexOf('=');
                if (eq <= 0) continue;
                String key = trimmed.substring(0, eq).trim();
                String value = trimmed.substring(eq + 1).trim();
                // strip surrounding quotes if present
                if (value.length() >= 2
                        && ((value.startsWith("\"") && value.endsWith("\""))
                            || (value.startsWith("'") && value.endsWith("'")))) {
                    value = value.substring(1, value.length() - 1);
                }
                // OS env vars take precedence — only set if not already defined
                if (System.getenv(key) == null) {
                    values.put(key, value);
                }
            }
        } catch (Exception ignored) {
            return;
        }

        if (!values.isEmpty()) {
            env.getPropertySources().addLast(new MapPropertySource(SOURCE_NAME, values));
        }
    }

    private static Path locateDotenv() {
        Path cwd = Paths.get("").toAbsolutePath();
        Path direct = cwd.resolve(".env");
        if (Files.exists(direct)) return direct;
        // Allow running from project root: try backend/.env
        Path nested = cwd.resolve("backend").resolve(".env");
        if (Files.exists(nested)) return nested;
        return null;
    }
}
