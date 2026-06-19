package com.naveenmandal.backend.message;

import com.naveenmandal.backend.chat.Chat;
import com.naveenmandal.backend.chat.ChatRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
public class MessageConsumer {

    private final MessageRepository messageRepository;
    private final ChatRepository chatRepository;
    private final SimpMessagingTemplate messagingTemplate;

    @KafkaListener(topics = "chat-messages", groupId = "chat-group")
    @Transactional
    public void consumeChatMessage(MessageDto payload) {
        log.info("Kafka Consumer intercepted message package for chat room: {}", payload.getPublicChatId());

        try {
            // Use findChatByPublicIds to handle UUID strings cleanly
            Chat chat = chatRepository.findChatByPublicIds(
                    payload.getSenderId(), 
                    payload.getReceiverId()
            ).orElseThrow(() -> new IllegalArgumentException("Target chat room missing"));

            Message databaseMessage = Message.builder()
                    .chat(chat)
                    .senderId(payload.getSenderId())
                    .receiverId(payload.getReceiverId())
                    .content(payload.getContent())
                    .type(MessageType.valueOf(payload.getType()))
                    .status(MessageStatus.SENT)
                    .build();

            Message savedMessage = messageRepository.save(databaseMessage);
            log.info("Message safely saved to relational database tier via Virtual Thread execution.");

            // FIX: Enforce uniform server-side timestamps across the active client network layers
            payload.setCreatedAt(LocalDateTime.now().toString());

            messagingTemplate.convertAndSendToUser(
                    payload.getReceiverId(),
                    "/queue/messages",
                    payload
            );
            log.info("Live packet dynamically broadcasted over WebSocket mesh to user socket channel.");
            
        } catch (Exception e) {
            log.error("Critical failure during async database write or live transmission broadcast loop: ", e);
        }
    }
}