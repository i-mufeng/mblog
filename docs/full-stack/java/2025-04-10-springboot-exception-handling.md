---
title: Spring Boot 统一异常处理最佳实践
description: 使用 @ControllerAdvice 和 @ExceptionHandler 实现优雅的全局异常处理
categories:
  - JAVA 学习笔记
tags:
  - JAVA
  - Spring Boot
  - 异常处理
  - 最佳实践
outline: [2,3]
date: 2025-04-10
---

# Spring Boot 统一异常处理最佳实践

> 统一异常处理是后端开发的基础能力，它能让代码更优雅、错误响应更规范、调试更高效。

<!-- more -->

## 一、为什么需要统一异常处理

### 1.1 没有统一处理的问题

```java
// ❌ 每个 Controller 都要 try-catch，代码冗余
@GetMapping("/user/{id}")
public Result<User> getUser(@PathVariable Long id) {
    try {
        User user = userService.getById(id);
        if (user == null) {
            return Result.fail("用户不存在");
        }
        return Result.success(user);
    } catch (Exception e) {
        log.error("查询用户失败", e);
        return Result.fail("系统错误");
    }
}
```

### 1.2 统一处理后的效果

```java
// ✅ Controller 只关注业务逻辑
@GetMapping("/user/{id}")
public Result<User> getUser(@PathVariable Long id) {
    User user = userService.getById(id);
    if (user == null) {
        throw new BusinessException("用户不存在");
    }
    return Result.success(user);
}
```

## 二、@ControllerAdvice 注解详解

`@ControllerAdvice` 是 Spring 3.2 引入的注解，用于定义全局的异常处理器、数据绑定器和模型属性。

```java
@RestControllerAdvice
public class GlobalExceptionHandler {
    
    @ExceptionHandler(BusinessException.class)
    public Result<?> handleBusinessException(BusinessException e) {
        return Result.fail(e.getMessage());
    }
    
    @ExceptionHandler(Exception.class)
    public Result<?> handleException(Exception e) {
        log.error("系统异常", e);
        return Result.fail("系统繁忙，请稍后重试");
    }
}
```

**@ControllerAdvice 的作用范围：**

```java
// 所有 Controller
@RestControllerAdvice

// 指定包
@RestControllerAdvice(basePackages = "com.example.controller")

// 指定注解
@RestControllerAdvice(annotations = RestController.class)
```

## 三、自定义异常类设计

### 3.1 基础异常类

```java
/**
 * 业务异常基类
 */
@Getter
public class BusinessException extends RuntimeException {
    
    private final int code;
    
    public BusinessException(String message) {
        super(message);
        this.code = 500;
    }
    
    public BusinessException(int code, String message) {
        super(message);
        this.code = code;
    }
    
    public BusinessException(IErrorCode errorCode) {
        super(errorCode.getMessage());
        this.code = errorCode.getCode();
    }
}
```

### 3.2 错误码枚举

```java
/**
 * 错误码接口
 */
public interface IErrorCode {
    int getCode();
    String getMessage();
}

/**
 * 系统错误码
 */
public enum SysErrorCode implements IErrorCode {
    SUCCESS(200, "操作成功"),
    BAD_REQUEST(400, "请求参数错误"),
    UNAUTHORIZED(401, "未登录或登录已过期"),
    FORBIDDEN(403, "没有操作权限"),
    NOT_FOUND(404, "资源不存在"),
    SYSTEM_ERROR(500, "系统错误");
    
    private final int code;
    private final String message;
    
    SysErrorCode(int code, String message) {
        this.code = code;
        this.message = message;
    }
    
    @Override
    public int getCode() { return code; }
    
    @Override
    public String getMessage() { return message; }
}
```

### 3.3 业务异常子类

```java
/**
 * 参数校验异常
 */
public class ValidationException extends BusinessException {
    public ValidationException(String message) {
        super(400, message);
    }
}

/**
 * 权限异常
 */
public class ForbiddenException extends BusinessException {
    public ForbiddenException() {
        super(SysErrorCode.FORBIDDEN);
    }
}

/**
 * 资源不存在异常
 */
public class NotFoundException extends BusinessException {
    public NotFoundException(String resource) {
        super(404, resource + "不存在");
    }
}
```

## 四、全局异常处理器实现

```java
@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {
    
    /**
     * 业务异常
     */
    @ExceptionHandler(BusinessException.class)
    public Result<?> handleBusinessException(BusinessException e) {
        log.warn("业务异常: {}", e.getMessage());
        return Result.fail(e.getCode(), e.getMessage());
    }
    
    /**
     * 参数校验异常 - @Valid
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public Result<?> handleValidException(MethodArgumentNotValidException e) {
        String message = e.getBindingResult().getFieldErrors().stream()
                .map(FieldError::getDefaultMessage)
                .collect(Collectors.joining(", "));
        log.warn("参数校验失败: {}", message);
        return Result.fail(400, message);
    }
    
    /**
     * 参数校验异常 - @RequestParam
     */
    @ExceptionHandler(MissingServletRequestParameterException.class)
    public Result<?> handleMissingParams(MissingServletRequestParameterException e) {
        log.warn("缺少请求参数: {}", e.getParameterName());
        return Result.fail(400, "缺少参数: " + e.getParameterName());
    }
    
    /**
     * 请求方法不支持
     */
    @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
    public Result<?> handleMethodNotSupported(HttpRequestMethodNotSupportedException e) {
        return Result.fail(405, "不支持" + e.getMethod() + "请求");
    }
    
    /**
     * JSON 解析异常
     */
    @ExceptionHandler(HttpMessageNotReadableException.class)
    public Result<?> handleJsonParseError(HttpMessageNotReadableException e) {
        log.warn("JSON 解析失败: {}", e.getMessage());
        return Result.fail(400, "请求体格式错误");
    }
    
    /**
     * 系统异常
     */
    @ExceptionHandler(Exception.class)
    public Result<?> handleException(Exception e) {
        log.error("系统异常", e);
        return Result.fail(500, "系统繁忙，请稍后重试");
    }
}
```

## 五、异常响应格式封装

### 5.1 统一响应类

```java
@Data
public class Result<T> {
    
    private int code;
    private String message;
    private T data;
    
    public static <T> Result<T> success(T data) {
        Result<T> result = new Result<>();
        result.setCode(200);
        result.setMessage("操作成功");
        result.setData(data);
        return result;
    }
    
    public static <T> Result<T> fail(String message) {
        return fail(500, message);
    }
    
    public static <T> Result<T> fail(int code, String message) {
        Result<T> result = new Result<>();
        result.setCode(code);
        result.setMessage(message);
        return result;
    }
}
```

### 5.2 JSON 响应示例

```json
{
    "code": 400,
    "message": "用户名不能为空",
    "data": null
}
```

## 六、生产环境注意事项

### 6.1 敏感信息保护

```java
@ExceptionHandler(Exception.class)
public Result<?> handleException(HttpServletRequest request, Exception e) {
    log.error("系统异常, 请求路径: {}", request.getRequestURI(), e);
    
    // 生产环境不暴露具体错误信息
    if (isProduction()) {
        return Result.fail(500, "系统繁忙，请稍后重试");
    }
    return Result.fail(500, e.getMessage());
}
```

### 6.2 异常监控集成

```java
@ExceptionHandler(Exception.class)
public Result<?> handleException(Exception e) {
    log.error("系统异常", e);
    
    // 上报到监控系统（如 Sentry、钉钉告警等）
    alarmService.sendExceptionAlarm(e);
    
    return Result.fail(500, "系统繁忙，请稍后重试");
}
```

### 6.3 异步异常处理

```java
@Configuration
public class AsyncConfig implements AsyncConfigurer {
    
    @Override
    public AsyncUncaughtExceptionHandler getAsyncUncaughtExceptionHandler() {
        return (ex, method, params) -> {
            log.error("异步方法异常, method: {}", method.getName(), ex);
            // 上报监控
        };
    }
}
```

## 七、总结

| 场景 | 异常类型 | HTTP 状态码 |
|------|----------|-------------|
| 业务逻辑错误 | BusinessException | 200 或自定义 |
| 参数校验失败 | MethodArgumentNotValidException | 400 |
| 未登录 | UnauthorizedException | 401 |
| 无权限 | ForbiddenException | 403 |
| 资源不存在 | NotFoundException | 404 |
| 系统错误 | Exception | 500 |

:::tip 最佳实践
1. 自定义异常继承 RuntimeException
2. 使用错误码枚举统一管理错误码
3. 生产环境不暴露堆栈信息
4. 集成监控系统及时发现问题
5. Controller 层不做 try-catch，交给全局处理器
:::
