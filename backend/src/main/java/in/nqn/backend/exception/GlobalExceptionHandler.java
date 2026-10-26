package in.nqn.backend.exception;

import in.nqn.backend.dto.response.ApiResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.ErrorResponse;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

import java.sql.SQLException;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    // SQLSTATE do trigger tự định nghĩa bằng SIGNAL (thông điệp nghiệp vụ, an toàn để trả cho client)
    private static final String SQLSTATE_NGHIEP_VU = "45000";
    private static final int MYSQL_DUPLICATE_KEY = 1062;
    private static final int MYSQL_ROW_IS_REFERENCED = 1451;

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ApiResponse<Void>> handleResourceNotFound(ResourceNotFoundException ex) {
        return error(HttpStatus.NOT_FOUND, ex.getMessage());
    }

    @ExceptionHandler(DuplicateResourceException.class)
    public ResponseEntity<ApiResponse<Void>> handleDuplicateResource(DuplicateResourceException ex) {
        return error(HttpStatus.CONFLICT, ex.getMessage());
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ApiResponse<Void>> handleIllegalArgument(IllegalArgumentException ex) {
        return error(HttpStatus.BAD_REQUEST, ex.getMessage());
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Void>> handleValidationException(MethodArgumentNotValidException ex) {
        String errorMessage = ex.getBindingResult().getFieldErrors().stream()
                .map(err -> err.getDefaultMessage())
                .findFirst()
                .orElse("Dữ liệu đầu vào không hợp lệ!");
        return error(HttpStatus.BAD_REQUEST, errorMessage);
    }

    @ExceptionHandler({HttpMessageNotReadableException.class, MethodArgumentTypeMismatchException.class})
    public ResponseEntity<ApiResponse<Void>> handleUnreadable(Exception ex) {
        return error(HttpStatus.BAD_REQUEST, "Dữ liệu gửi lên sai định dạng (kiểm tra kiểu số và định dạng ngày)!");
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ApiResponse<Void>> handleDataIntegrity(DataIntegrityViolationException ex) {
        SQLException sql = findSqlException(ex);
        if (sql != null && SQLSTATE_NGHIEP_VU.equals(sql.getSQLState())) {
            return error(HttpStatus.BAD_REQUEST, sql.getMessage());
        }
        int code = sql != null ? sql.getErrorCode() : 0;
        if (code == MYSQL_ROW_IS_REFERENCED) {
            return error(HttpStatus.CONFLICT, "Không thể xóa: dữ liệu đang được sử dụng bởi chuyến xe khác!");
        }
        if (code == MYSQL_DUPLICATE_KEY) {
            return error(HttpStatus.CONFLICT, "Dữ liệu bị trùng với bản ghi đã có (CCCD, bằng lái hoặc biển số)!");
        }
        log.warn("Vi phạm ràng buộc dữ liệu", ex);
        return error(HttpStatus.CONFLICT, "Dữ liệu vi phạm ràng buộc toàn vẹn của hệ thống!");
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Void>> handleGeneralException(Exception ex) {
        // Lỗi nghiệp vụ từ trigger có thể được Spring bọc thành ngoại lệ khác DataIntegrityViolationException
        SQLException sql = findSqlException(ex);
        if (sql != null && SQLSTATE_NGHIEP_VU.equals(sql.getSQLState())) {
            return error(HttpStatus.BAD_REQUEST, sql.getMessage());
        }
        // Lỗi chuẩn của Spring MVC (sai phương thức HTTP, sai đường dẫn...) giữ nguyên mã trạng thái
        if (ex instanceof ErrorResponse er) {
            return ResponseEntity.status(er.getStatusCode())
                    .body(ApiResponse.error("Yêu cầu không hợp lệ: " + er.getBody().getDetail()));
        }
        log.error("Lỗi không xác định", ex);
        return error(HttpStatus.INTERNAL_SERVER_ERROR, "Đã xảy ra lỗi hệ thống, vui lòng thử lại sau!");
    }

    private static SQLException findSqlException(Throwable ex) {
        for (Throwable t = ex; t != null; t = t.getCause()) {
            if (t instanceof SQLException sql) {
                return sql;
            }
        }
        return null;
    }

    private static ResponseEntity<ApiResponse<Void>> error(HttpStatus status, String message) {
        return ResponseEntity.status(status).body(ApiResponse.error(message));
    }
}
