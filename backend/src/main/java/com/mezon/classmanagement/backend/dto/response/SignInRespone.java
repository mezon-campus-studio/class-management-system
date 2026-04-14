package com.mezon.classmanagement.backend.dto.response;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class SignInRespone {
    //1 loại token dùng để truy cập api hệ thống( hiệu lực ngắn)
    private String accessToken;
    //Thời gian hiệu lực lâu
    private String refreshToken;
}
