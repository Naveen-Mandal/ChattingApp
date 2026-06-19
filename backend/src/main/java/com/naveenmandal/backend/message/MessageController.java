package com.naveenmandal.backend.message;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/messages")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class MessageController {

    private final MessageProducer messageProducer;

    // HTTP Post wrapper that delegates the message handling directly to Kafka topic queues
    @PostMapping("/send")
    public ResponseEntity<String> sendMessage(@RequestBody MessageDto messageDto) {

        // Asynchronously drops the payload into the Kafka cluster
        messageProducer.sendMessageToQueue(messageDto);

        // Instantly returns 200 OK without blocking the server thread for DB I/O write latency
        return ResponseEntity.ok("Message accepted and queued for asynchronous processing.");
    }
}