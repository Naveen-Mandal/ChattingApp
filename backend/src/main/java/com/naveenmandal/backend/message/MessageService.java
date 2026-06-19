package com.naveenmandal.backend.message;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class MessageService {

    private final MessageRepository messageRepository;

    public List<Message> getMessagesByChatId(Long chatId, Pageable pageable) {
        // FIXED: Repository returns Page<Message>, .getContent() extracts List<Message>
        return messageRepository.findByChatIdOrderByCreatedAtDesc(chatId, pageable).getContent();
    }
}