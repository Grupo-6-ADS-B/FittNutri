package fitt_nutri.example.demo.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.MDC;
import org.springframework.stereotype.Component;

@Component
public class SecurityAuditLogger {

    private static final Logger log = LoggerFactory.getLogger("SECURITY_AUDIT");

    public void loginSuccess(String email) {
        log.info("[SECURITY] event=LOGIN_SUCCESS email={} ip={} requestId={}",
                email, MDC.get("ip"), MDC.get("requestId"));
    }

    public void loginFailure(String email, String reason) {
        log.warn("[SECURITY] event=LOGIN_FAILURE email={} reason={} ip={} requestId={}",
                email, reason, MDC.get("ip"), MDC.get("requestId"));
    }

    public void accessDenied(String email, String resource) {
        log.warn("[SECURITY] event=ACCESS_DENIED email={} resource={} ip={} requestId={}",
                email, resource, MDC.get("ip"), MDC.get("requestId"));
    }

    public void rateLimited(String email) {
        log.warn("[SECURITY] event=RATE_LIMITED email={} ip={} requestId={}",
                email, MDC.get("ip"), MDC.get("requestId"));
    }
}
