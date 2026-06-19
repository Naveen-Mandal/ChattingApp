package com.naveenmandal.backend.chat;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/chats")
@RequiredArgsConstructor
@CrossOrigin(origins = "*") 
public class ChatController {

    private final ChatService chatService;

    // FIX: Map database entity into ChatDto to completely eliminate LazyInitializationException errors
    @PostMapping
    public ResponseEntity<ChatDto> createOrGetChat(@RequestParam Long senderId, @RequestParam Long recipientId) {
        Chat chat = chatService.createOrGetChat(senderId, recipientId);
        return ResponseEntity.ok(convertToDto(chat));
    }

    @GetMapping("/user/{publicId}")
    public ResponseEntity<List<ChatDto>> getAllChatsForUser(@PathVariable String publicId) {
        List<Chat> chats = chatService.getAllChatsForUser(publicId);
        List<ChatDto> dtos = chats.stream().map(this::convertToDto).collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    private ChatDto convertToDto(Chat chat) {
        return ChatDto.builder()
                .id(chat.getId())
                .publicChatId(chat.getPublicChatId())
                .sender(new ChatDto.UserSummary(chat.getSender().getId(), chat.getSender().getPublicId(), chat.getSender().getUsername()))
                .recipient(new ChatDto.UserSummary(chat.getRecipient().getId(), chat.getRecipient().getPublicId(), chat.getRecipient().getUsername()))
                .build();
    }
}