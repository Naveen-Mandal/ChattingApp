package com.naveenmandal.backend.chat;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/chats")
@RequiredArgsConstructor
@CrossOrigin(origins = "*") // Allows connection handshake from React frontend later
public class ChatController {

    private final ChatService chatService;

    // Do users ke beech conversation room init karne ke liye
    @PostMapping
    public ResponseEntity<Chat> createOrGetChat(@RequestParam Long senderId, @RequestParam Long recipientId) {
        return ResponseEntity.ok(chatService.createOrGetChat(senderId, recipientId));
    }

    // Kisi specific user ki saari active chats fetch karne ke liye
    @GetMapping("/user/{publicId}")
    public ResponseEntity<List<Chat>> getAllChatsForUser(@PathVariable String publicId) {
        return ResponseEntity.ok(chatService.getAllChatsForUser(publicId));
    }
}