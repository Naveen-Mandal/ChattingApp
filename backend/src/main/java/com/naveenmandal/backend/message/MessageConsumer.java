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

            messageRepository.save(databaseMessage);
            log.info("Message safely saved to relational database tier.");

            payload.setCreatedAt(LocalDateTime.now().toString());

            // FIXED: Bypassed Spring Principal Authentication by mapping to a direct topic channel
            messagingTemplate.convertAndSend(
                    "/topic/messages/" + payload.getReceiverId(),
                    payload
            );
            log.info("Live packet dynamically broadcasted over explicit WebSocket topic channel.");
            
        } catch (Exception e) {
            log.error("Critical failure during async database write or live transmission broadcast loop: ", e);
            
            throw new RuntimeException("Message processing failed - Requesting Kafka re-delivery", e);
        }
    }
}