package com.naveenmandal.backend.message;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/messages")
@RequiredArgsConstructor
@Slf4j
public class MessageController {

    private final MessageProducer messageProducer;
    private final MessageService messageService;

    @PostMapping("/send")
    public ResponseEntity<Void> sendMessage(@RequestBody MessageDto messageDto) {
        log.info("Queuing message from sender: {}", messageDto.getSenderId());
        messageProducer.sendMessageToQueue(messageDto);
        return ResponseEntity.accepted().build();
    }

    @GetMapping("/chat/{chatId}")
    @Transactional(readOnly = true)
    public ResponseEntity<List<MessageDto>> getMessages(
            @PathVariable Long chatId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size
    ) {
        log.info("Fetching history for chat: {} | Page: {}", chatId, page);
        
        List<Message> messages = messageService.getMessagesByChatId(chatId, PageRequest.of(page, size));

        List<MessageDto> dtos = messages.stream().map(msg -> MessageDto.builder()
                .publicChatId(msg.getChat().getPublicChatId())
                .senderId(msg.getSenderId())
                .receiverId(msg.getReceiverId())
                .content(msg.getContent())
                // FIXED: Convert String to MessageType Enum
                .type(msg.getType() != null ? msg.getType() : MessageType.TEXT) 
                .createdAt(msg.getCreatedAt() != null ? msg.getCreatedAt().toString() : null)
                .status(msg.getStatus())
                .build()
        ).collect(Collectors.toList());

        // Reverse to ensure history is ordered chronologically (oldest to newest) on UI
        java.util.Collections.reverse(dtos);

        return ResponseEntity.ok(dtos);
    }

    @PostMapping("/chat/{chatId}/read")
    public ResponseEntity<Void> markMessagesAsRead(
            @PathVariable Long chatId,
            @RequestParam String userId
    ) {
        log.info("Marking messages as read in chat: {} for user: {}", chatId, userId);
        messageService.markMessagesAsRead(chatId, userId);
        return ResponseEntity.ok().build();
    }
}