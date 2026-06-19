package com.naveenmandal.backend.message;

import lombok.*;

@Data
@Builder // <--- Yeh annotation builder error hatati hai
@NoArgsConstructor
@AllArgsConstructor
public class MessageDto {
    private String publicChatId;
    private String senderId;
    private String receiverId;
    private String content;
    private MessageType type;
    private String createdAt;
}