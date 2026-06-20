package com.naveenmandal.backend.message;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class MessageService {

    private final MessageRepository messageRepository;
    private final com.naveenmandal.backend.chat.ChatRepository chatRepository;
    private final org.springframework.messaging.simp.SimpMessagingTemplate messagingTemplate;

    public List<Message> getMessagesByChatId(Long chatId, Pageable pageable) {
        // FIXED: Repository returns Page<Message>, .getContent() extracts List<Message>
        return messageRepository.findByChatIdOrderByCreatedAtDesc(chatId, pageable).getContent();
    }

    @org.springframework.transaction.annotation.Transactional
    public void markMessagesAsRead(Long chatId, String userId) {
        List<Message> unreadMessages = messageRepository.findByChatIdAndReceiverIdAndStatusNot(
                chatId, userId, MessageStatus.SEEN
        );
        
        if (!unreadMessages.isEmpty()) {
            unreadMessages.forEach(msg -> msg.setStatus(MessageStatus.SEEN));
            messageRepository.saveAll(unreadMessages);
        }

        // Broadcast status update to the sender of the messages (so their ticks turn blue)
        chatRepository.findById(chatId).ifPresent(chat -> {
            String senderId = chat.getSender().getPublicId().equals(userId)
                    ? chat.getRecipient().getPublicId()
                    : chat.getSender().getPublicId();

            messagingTemplate.convertAndSend(
                    "/topic/status/" + senderId,
                    java.util.Map.of(
                            "type", "READ_RECEIPT",
                            "publicChatId", chat.getPublicChatId(),
                            "status", "SEEN"
                    )
            );
        });
    }
}