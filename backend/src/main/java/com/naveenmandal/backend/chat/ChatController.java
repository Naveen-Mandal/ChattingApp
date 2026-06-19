package com.naveenmandal.backend.chat;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/chats")
@RequiredArgsConstructor
@CrossOrigin(origins = "*") 
public class ChatController {

    private final ChatService chatService;

    // FIXED: Delegation directly targets clean mapped DTO response structures
    @PostMapping
    public ResponseEntity<ChatDto> createOrGetChat(@RequestParam Long senderId, @RequestParam Long recipientId) {
        ChatDto chatDto = chatService.createOrGetChat(senderId, recipientId);
        return ResponseEntity.ok(chatDto);
    }

    @GetMapping("/user/{publicId}")
    public ResponseEntity<List<ChatDto>> getAllChatsForUser(@PathVariable String publicId) {
        List<ChatDto> dtos = chatService.getAllChatsForUser(publicId);
        return ResponseEntity.ok(dtos);
    }
}