package com.classroomhub.domain.chat.dto;

import com.classroomhub.domain.chat.entity.ConversationSettings;

public record ConversationSettingsResponse(
        String bubbleColor,
        String wallpaper
) {
    public static ConversationSettingsResponse from(ConversationSettings s) {
        return new ConversationSettingsResponse(s.getBubbleColor(), s.getWallpaper());
    }

    public static ConversationSettingsResponse empty() {
        return new ConversationSettingsResponse(null, null);
    }
}
