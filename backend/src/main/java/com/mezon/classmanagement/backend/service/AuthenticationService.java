package com.mezon.classmanagement.backend.service;

import com.mezon.classmanagement.backend.dto.request.SignInRequest;
import com.mezon.classmanagement.backend.dto.response.SignInRespone;
import com.mezon.classmanagement.backend.repository.UserRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class AuthenticationService {
    AuthenticationManager authenticationManager;
    UserRepository userRepository;
    JwtService jwtService;

    public SignInRespone SignIn(SignInRequest request){

        long ACCESS_TOKEN_EXPIRY_MINUTES = 15;

        long REFRESH_TOKEN_EXPIRY_DAYS = 7;


        UsernamePasswordAuthenticationToken authenticationToken = new UsernamePasswordAuthenticationToken(request.getUserName() , request.getPassWord());
        authenticationManager.authenticate(authenticationToken);

        var user = userRepository.findByUsername(request.getUserName())
                .orElseThrow(() -> new RuntimeException("User not found"));


        String accessToken = jwtService.generateAccessToken(user.getUsername());
        String refreshToken = jwtService.generateRefreshToken(user.getUsername());

        //Trả về token
        return SignInRespone.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .build();
    }
}
