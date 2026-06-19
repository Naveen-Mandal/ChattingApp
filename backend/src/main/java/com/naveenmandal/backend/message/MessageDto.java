package com.naveenmandal.backend.message;

import lombok.*;
import java.io.Serializable;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class MessageDto implements Serializable {
    private String publicChatId;
    private String senderId;
    private String receiverId;
    private String content;
    private String type; // TEXT, IMAGE, etc.
}