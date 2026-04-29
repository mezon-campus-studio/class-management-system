package com.classroomhub.common.security;

import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.databind.DeserializationContext;
import com.fasterxml.jackson.databind.deser.std.StdDeserializer;
import org.jsoup.Jsoup;
import org.jsoup.safety.Safelist;

import java.io.IOException;

/**
 * Strips all HTML/script tags from every incoming String field automatically.
 * Registered globally via JacksonConfig — no per-field annotation needed.
 *
 * Fields that must NOT be sanitized (passwords, tokens) should be annotated
 * with @JsonDeserialize(using = com.fasterxml.jackson.databind.deser.std.StringDeserializer.class)
 * to bypass this deserializer.
 *
 * Example:
 *   Input:  "<script>alert(1)</script>Hello"  → Output: "Hello"
 *   Input:  "<b>Bold</b> text"               → Output: "Bold text"
 *   Input:  "Tom & Jerry"                    → Output: "Tom & Jerry"  (& preserved)
 */
public class XssStringDeserializer extends StdDeserializer<String> {

    public XssStringDeserializer() {
        super(String.class);
    }

    @Override
    public String deserialize(JsonParser p, DeserializationContext ctxt) throws IOException {
        String value = p.getValueAsString();
        if (value == null || value.isBlank()) {
            return value;
        }
        return Jsoup.clean(value, Safelist.none());
    }
}
