package com.naveenmandal.backend;

import com.naveenmandal.backend.security.JwtService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpHeaders;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
public class JwtSecurityTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JwtService jwtService;

    @Test
    public void testGetUsersUnauthenticated() throws Exception {
        mockMvc.perform(get("/api/users"))
                .andDo(print())
                .andExpect(status().isForbidden());
    }

    @Test
    public void testGetUsersAuthenticated() throws Exception {
        // Generate a token for a mock user (it doesn't need to exist if we only check parsing, or does it?)
        // Wait, CustomUserDetailsService will load by email, so the user MUST exist in DB!
        // We'll see if the filter fails on loading user details.
        String token = jwtService.generateToken("mandal@example.com");
        
        mockMvc.perform(get("/api/users")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + token))
                .andDo(print());
    }
}
