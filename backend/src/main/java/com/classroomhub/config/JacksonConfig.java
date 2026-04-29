package com.classroomhub.config;

import com.classroomhub.common.security.XssStringDeserializer;
import com.fasterxml.jackson.databind.module.SimpleModule;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class JacksonConfig {

    /**
     * Spring Boot auto-registers any Module bean into the global ObjectMapper.
     * This module replaces the default String deserializer with XssStringDeserializer,
     * which strips HTML/script tags from every incoming JSON String field.
     */
    @Bean
    public SimpleModule xssSanitizerModule() {
        SimpleModule module = new SimpleModule("XssSanitizer");
        module.addDeserializer(String.class, new XssStringDeserializer());
        return module;
    }
}
