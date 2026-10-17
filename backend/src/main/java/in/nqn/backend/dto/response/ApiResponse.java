package in.nqn.backend.dto.response;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ApiResponse<T> {
    private boolean status;
    private String message;
    private T data;
    private LocalDateTime timestamp;

    public static <T> ApiResponse<T> success(T data, String message) {
        return new ApiResponse<>(true,message,data,LocalDateTime.now());
    }

    public static <T> ApiResponse<T> error(T data, String message) {
        return new ApiResponse<>(false,message,null,LocalDateTime.now());
    }
}
