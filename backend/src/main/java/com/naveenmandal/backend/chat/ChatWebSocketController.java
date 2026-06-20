package com.naveenmandal.backend.chat;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;

@Controller
public class ChatWebSocketController {

    @MessageMapping("/typing/{chatId}")
    @SendTo("/topic/typing/{chatId}")
    public TypingStatus handleTyping(
            @DestinationVariable String chatId,
            TypingStatus status
    ) {
        return status;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TypingStatus {
        private String username;
        private boolean typing;
    }
}
