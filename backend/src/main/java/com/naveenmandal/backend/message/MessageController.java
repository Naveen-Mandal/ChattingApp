package com.naveenmandal.backend.message;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
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
                .build()
        ).collect(Collectors.toList());

        return ResponseEntity.ok(dtos);
    }
}