package com.naveenmandal.backend.config;

import org.apache.kafka.clients.admin.NewTopic;
import org.apache.kafka.clients.consumer.ConsumerConfig;
import org.apache.kafka.clients.producer.ProducerConfig;
import org.apache.kafka.common.serialization.StringDeserializer;
import org.apache.kafka.common.serialization.StringSerializer;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.annotation.EnableKafka;
import org.springframework.kafka.config.ConcurrentKafkaListenerContainerFactory;
import org.springframework.kafka.config.TopicBuilder;
import org.springframework.kafka.core.*;

import java.util.HashMap;
import java.util.Map;

@Configuration
@EnableKafka
public class KafkaConfig {

    @Value("${spring.kafka.bootstrap-servers}")
    private String bootstrapServers;

    @Value("${kafka.security.protocol:PLAINTEXT}")
    private String securityProtocol;

    @Value("${kafka.sasl.mechanism:}")
    private String saslMechanism;

    @Value("${kafka.username:}")
    private String kafkaUsername;

    @Value("${kafka.password:}")
    private String kafkaPassword;

    // Reads the Aiven CA Certificate string from Render environment variables
    @Value("${KAFKA_CA_CERT:}")
    private String caCert;

    private Map<String, Object> commonConfig() {
        Map<String, Object> props = new HashMap<>();
        props.put("bootstrap.servers", bootstrapServers);
        
        if (!"PLAINTEXT".equalsIgnoreCase(securityProtocol)) {
            props.put("security.protocol", securityProtocol);
            
            if (saslMechanism != null && !saslMechanism.isEmpty()) {
                props.put("sasl.mechanism", saslMechanism);
            }
            
            if (kafkaUsername != null && !kafkaUsername.isEmpty() && kafkaPassword != null && !kafkaPassword.isEmpty()) {
                props.put("sasl.jaas.config",
                        "org.apache.kafka.common.security.scram.ScramLoginModule required username=\""
                        + kafkaUsername + "\" password=\"" + kafkaPassword + "\";");
            }
            
            if (caCert != null && !caCert.isEmpty()) {
                props.put("ssl.truststore.certificates", caCert.trim());
                props.put("ssl.truststore.type", "PEM"); // 👈 ADD THIS LINE
            }
        }
        return props;
    }

    @Bean
    public KafkaAdmin kafkaAdmin() {
        return new KafkaAdmin(commonConfig());
    }
    @Bean
    public NewTopic messageTopic() {
        return TopicBuilder.name("chat-messages")
                .partitions(2)
                .replicas(2)
                .build();
    }

    @Bean
    public ProducerFactory<String, Object> producerFactory() {
        Map<String, Object> props = commonConfig();
        props.put(ProducerConfig.KEY_SERIALIZER_CLASS_CONFIG, StringSerializer.class);
        props.put(ProducerConfig.VALUE_SERIALIZER_CLASS_CONFIG,
                "org.springframework.kafka.support.serializer.JsonSerializer");
        props.put(ProducerConfig.ACKS_CONFIG, "all");
        return new DefaultKafkaProducerFactory<>(props);
    }

    @Bean
    public KafkaTemplate<String, Object> kafkaTemplate() {
        return new KafkaTemplate<>(producerFactory());
    }

    @Bean
    public ConsumerFactory<String, Object> consumerFactory() {
        Map<String, Object> props = commonConfig();
        props.put(ConsumerConfig.GROUP_ID_CONFIG, "chat-group");
        props.put(ConsumerConfig.AUTO_OFFSET_RESET_CONFIG, "earliest");
        props.put(ConsumerConfig.KEY_DESERIALIZER_CLASS_CONFIG, StringDeserializer.class);
        props.put(ConsumerConfig.VALUE_DESERIALIZER_CLASS_CONFIG,
                "org.springframework.kafka.support.serializer.JsonDeserializer");
        props.put("spring.json.trusted.packages", "*");
        props.put("spring.json.value.default.type",
                "com.naveenmandal.backend.message.MessageDto");
        return new DefaultKafkaConsumerFactory<>(props);
    }

    @Bean
    public ConcurrentKafkaListenerContainerFactory<String, Object> kafkaListenerContainerFactory() {
        ConcurrentKafkaListenerContainerFactory<String, Object> factory =
                new ConcurrentKafkaListenerContainerFactory<>();
        factory.setConsumerFactory(consumerFactory());
        return factory;
    }
}