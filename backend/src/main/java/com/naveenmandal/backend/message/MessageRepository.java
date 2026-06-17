package com.naveenmandal.backend.message;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {

    //find all messages for any specific chat id;
    List<Message> findByChatIdOrderByIdAsc(Long chatId);
}
