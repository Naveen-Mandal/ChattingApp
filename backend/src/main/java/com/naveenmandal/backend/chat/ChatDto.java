package com.naveenmandal.backend.chat;

import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ChatDto {
    private Long id;
    private String publicChatId;
    private UserSummary sender;
    private UserSummary recipient;

    @Getter
    @Setter
    @AllArgsConstructor
    @NoArgsConstructor
    public static class UserSummary {
        private Long id;
        private String publicId;
        private String username;
    }
}