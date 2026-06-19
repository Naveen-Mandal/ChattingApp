package com.naveenmandal.backend.message;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class MessageProducer {

    private static final String TOPIC = "chat-messages";
    private final KafkaTemplate<String, Object> kafkaTemplate;

    public void sendMessageToQueue(MessageDto messageDto) {
        log.info("Publishing message to Kafka topic '{}' from sender: {}", TOPIC, messageDto.getSenderId());

        // Asynchronously pushes payload using the senderId as partition key for orderly processing
        kafkaTemplate.send(TOPIC, messageDto.getSenderId(), messageDto);
    }
}