package com.naveenmandal.backend.message;

import com.naveenmandal.backend.chat.Chat;
import com.naveenmandal.backend.chat.ChatRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class MessageConsumer {

    private final MessageRepository messageRepository;
    private final ChatRepository chatRepository;

    @KafkaListener(topics = "chat-messages", groupId = "chat-group")
    @Transactional
    public void consumeChatMessage(MessageDto payload) {
        log.info("Kafka Consumer intercepted message package for chat room: {}", payload.getPublicChatId());

        try {
            // 1. Resolve relationship mapping reference
            Chat chat = chatRepository.findChatBetweenUserEntity(
                    Long.parseLong(payload.getSenderId()),
                    Long.parseLong(payload.getReceiverId())
            ).orElseThrow(() -> new IllegalArgumentException("Target chat room lifecycle context missing"));

            // 2. Transpile DTO frame to Database Relational Entity
            Message databaseMessage = Message.builder()
                    .chat(chat)
                    .senderId(payload.getSenderId())
                    .receiverId(payload.getReceiverId())
                    .content(payload.getContent())
                    .type(MessageType.valueOf(payload.getType()))
                    .status(MessageStatus.SENT)
                    .build();

            // 3. Persist transaction (Handled via application.yml Batch size allocation)
            messageRepository.save(databaseMessage);
            log.info("Message safely decoupled and saved to relational engine.");

        } catch (Exception e) {
            log.error("Critical failure during async database write loop processing: ", e);
            // In product companies, failed items are pushed to a Dead Letter Topic (DLT) here
        }
    }
}