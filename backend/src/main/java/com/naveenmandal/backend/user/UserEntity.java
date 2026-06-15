package com.naveenmandal.backend.user;


import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "user_entity")
public class UserEntity {
    @Id
    @GeneratedValue( strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "public_id", unique = true, nullable = false)
    private String publicId;

    @Column(nullable = false)
    private String username;

    @Column(name = "profile_pic_url")
    private String profilePicURL;

    private String status;  //active, offline, custom status.


    @Column(nullable = false, unique = true)
    private String email;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "last_seen", nullable = false)
    private LocalDateTime lastSeen;


    @PrePersist  //it will run this method just before inserting data into db.
    protected void onCreated(){
        this.createdAt = LocalDateTime.now();
        this.lastSeen = LocalDateTime.now();
    }
}
