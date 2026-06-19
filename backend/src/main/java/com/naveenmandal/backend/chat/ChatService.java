package com.naveenmandal.backend.chat;

import com.naveenmandal.backend.user.UserEntity;
import com.naveenmandal.backend.user.UserEntityRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ChatService {

    private final ChatRepository chatRepository;
    private final UserEntityRepository userRepository; 

    @Transactional
    public ChatDto createOrGetChat(Long senderId, Long recipientId) {
        // 1. Check if chat already exists between these two users
        Optional<Chat> existingChat = chatRepository.findChatBetweenUserEntity(senderId, recipientId);
        if (existingChat.isPresent()) {
            return convertToDto(existingChat.get()); // Mapped safely inside open session
        }

        // 2. Fetch sender and recipient physical objects from DB
        UserEntity sender = userRepository.findById(senderId)
                .orElseThrow(() -> new IllegalArgumentException("Sender not found with ID: " + senderId));
        UserEntity recipient = userRepository.findById(recipientId)
                .orElseThrow(() -> new IllegalArgumentException("Recipient not found with ID: " + recipientId));

        // 3. Create a brand new unique chat room
        Chat newChat = Chat.builder()
                .publicChatId(UUID.randomUUID().toString()) 
                .sender(sender)
                .recipient(recipient)
                .build();

        Chat savedChat = chatRepository.save(newChat);
        return convertToDto(savedChat);
    }

    @Transactional(readOnly = true)
    public List<ChatDto> getAllChatsForUser(String userPublicId) {
        List<Chat> chats = chatRepository.findAllChatsByUserEntityId(userPublicId);
        // Mapping elements within the active read-only transaction context
        return chats.stream().map(this::convertToDto).collect(Collectors.toList());
    }

    // FIXED: Moved internal mapper here to safely access LAZY proxies without session loss
    private ChatDto convertToDto(Chat chat) {
        return ChatDto.builder()
                .id(chat.getId())
                .publicChatId(chat.getPublicChatId())
                .sender(new ChatDto.UserSummary(
                        chat.getSender().getId(), 
                        chat.getSender().getPublicId(), 
                        chat.getSender().getUsername()
                ))
                .recipient(new ChatDto.UserSummary(
                        chat.getRecipient().getId(), 
                        chat.getRecipient().getPublicId(), 
                        chat.getRecipient().getUsername()
                ))
                .build();
    }
}