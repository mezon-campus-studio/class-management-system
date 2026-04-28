package com.classroomhub.common.security;

public record StompPrincipal(String name) implements java.security.Principal {
    @Override
    public String getName() {
        return name;
    }
}
