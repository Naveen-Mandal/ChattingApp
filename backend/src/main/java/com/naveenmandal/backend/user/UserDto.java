package com.naveenmandal.backend.user;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserDto {
    private Long id;
    private String publicId;
    private String username;
    private String profilePicURL;
    private String status;
    private String email;
    private String createdAt;
    private String lastSeen;

    public static UserDto fromEntity(UserEntity entity) {
        if (entity == null) {
            return null;
        }
        return UserDto.builder()
                .id(entity.getId())
                .publicId(entity.getPublicId())
                .username(entity.getUsername())
                .profilePicURL(entity.getProfilePicURL())
                .status(entity.getStatus())
                .email(entity.getEmail())
                .createdAt(entity.getCreatedAt() != null ? entity.getCreatedAt().toString() : null)
                .lastSeen(entity.getLastSeen() != null ? entity.getLastSeen().toString() : null)
                .build();
    }
}
