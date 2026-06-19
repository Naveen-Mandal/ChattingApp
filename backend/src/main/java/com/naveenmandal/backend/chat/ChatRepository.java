package com.naveenmandal.backend.chat;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ChatRepository extends JpaRepository<Chat, Long> {

    @Query("SELECT c FROM Chat c WHERE c.sender.publicId = :userId OR c.recipient.publicId = :userId")
    List<Chat> findAllChatsByUserEntityId(@Param("userId") String userId);

    @Query("SELECT c FROM Chat c WHERE " +
            "(c.sender.id = :userAId AND c.recipient.id = :userBId) OR " +
            "(c.sender.id = :userBId AND c.recipient.id = :userAId)")
    Optional<Chat> findChatBetweenUserEntity(@Param("userAId") Long userAId, @Param("userBId") Long userBId);

    // FIX: Safely find existing rooms via String Public IDs without throwing parse exceptions
    @Query("SELECT c FROM Chat c WHERE " +
            "(c.sender.publicId = :userAPublicId AND c.recipient.publicId = :userBPublicId) OR " +
            "(c.sender.publicId = :userBPublicId AND c.recipient.publicId = :userAPublicId)")
    Optional<Chat> findChatByPublicIds(@Param("userAPublicId") String userAPublicId, @Param("userBPublicId") String userBPublicId);
}