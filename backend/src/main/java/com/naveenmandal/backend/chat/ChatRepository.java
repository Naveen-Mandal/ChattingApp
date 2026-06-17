package com.naveenmandal.backend.chat;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ChatRepository extends JpaRepository<Chat, Long> {

    // 1. Ek specific user ki saari active chats nikalne ke liye
    @Query("SELECT c FROM Chat c WHERE c.sender.publicId = :userId OR c.recipient.publicId = :userId")
    List<Chat> findAllChatsByUserEntityId(@Param("userId") String userId);

    // 2. Check karne ke liye ki kya do users ke beech pehle se chat room exist karta hai
    @Query("SELECT c FROM Chat c WHERE " +
            "(c.sender.id = :userAId AND c.recipient.id = :userBId) OR " +
            "(c.sender.id = :userBId AND c.recipient.id = :userAId)")
    Optional<Chat> findChatBetweenUserEntity(@Param("userAId") Long userAId, @Param("userBId") Long userBId);
}