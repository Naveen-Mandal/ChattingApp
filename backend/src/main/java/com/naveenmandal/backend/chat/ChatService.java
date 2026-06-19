package com.naveenmandal.backend.chat;

import com.naveenmandal.backend.user.UserEntity;
import com.naveenmandal.backend.user.UserEntityRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ChatService {

    private final ChatRepository chatRepository;
    private final UserEntityRepository userRepository; // To validate if users exist

    @Transactional
    public Chat createOrGetChat(Long senderId, Long recipientId) {
        // 1. Check if chat already exists between these two users
        Optional<Chat> existingChat = chatRepository.findChatBetweenUserEntity(senderId, recipientId);
        if (existingChat.isPresent()) {
            return existingChat.get();
        }

        // 2. Fetch sender and recipient physical objects from DB
        UserEntity sender = userRepository.findById(senderId)
                .orElseThrow(() -> new IllegalArgumentException("Sender not found with ID: " + senderId));
        UserEntity recipient = userRepository.findById(recipientId)
                .orElseThrow(() -> new IllegalArgumentException("Recipient not found with ID: " + recipientId));

        // 3. Create a brand new unique chat room
        Chat newChat = Chat.builder()
                .publicChatId(UUID.randomUUID().toString()) // Secure token for client routing
                .sender(sender)
                .recipient(recipient)
                .build();

        return chatRepository.save(newChat);
    }

    @Transactional(readOnly = true)
    public List<Chat> getAllChatsForUser(String userPublicId) {
        return chatRepository.findAllChatsByUserEntityId(userPublicId);
    }
}