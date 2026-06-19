package com.naveenmandal.backend.message;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/messages")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class MessageController {

    private final MessageProducer messageProducer;
    private final MessageRepository messageRepository; // FIXED: Injected for DB reads

    @PostMapping("/send")
    public ResponseEntity<String> sendMessage(@RequestBody MessageDto messageDto) {
        messageProducer.sendMessageToQueue(messageDto);
        return ResponseEntity.ok("Message accepted and queued for asynchronous processing.");
    }

    // FIXED: Added HTTP GET endpoint to fetch chat history dynamically
    @GetMapping("/chat/{chatId}")
    public ResponseEntity<List<MessageDto>> getMessages(@PathVariable Long chatId) {
        List<Message> messages = messageRepository.findByChatIdOrderByIdAsc(chatId);
        
        // Map Entities to DTOs to ensure clean JSON transmission
        List<MessageDto> dtos = messages.stream().map(msg -> MessageDto.builder()
                .publicChatId(msg.getChat().getPublicChatId())
                .senderId(msg.getSenderId())
                .receiverId(msg.getReceiverId())
                .content(msg.getContent())
                .type(msg.getType().name())
                .createdAt(msg.getCreatedAt() != null ? msg.getCreatedAt().toString() : null)
                .build()
        ).collect(Collectors.toList());

        return ResponseEntity.ok(dtos);
    }
}