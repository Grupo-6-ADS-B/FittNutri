package fitt_nutri.example.demo.security.jwt;

import fitt_nutri.example.demo.service.UserDetailsImpl;
import io.jsonwebtoken.*;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.security.Key;
import java.util.Date;

@Component
public class JwtUtils {

    @Value("${projeto.jwtSecret}")
    private String jwtSecret;

    @Value("${projeto.jwtExpirationMs}")
    private int jwtExpirationMs;

    public String generateTokenFromUserDetailsImpl(UserDetailsImpl userdetail) {
    return Jwts.builder().setSubject(userdetail.getUsername()).
            setIssuedAt(new Date()).
            setExpiration(new Date(new Date().getTime() + jwtExpirationMs)).
            signWith(getSignInKey(), SignatureAlgorithm.HS512).compact();
    }

    public Key getSignInKey() {
        SecretKey key = Keys.hmacShaKeyFor(Decoders.BASE64.decode(jwtSecret));
        return key;
    }

    public boolean ValidateJwtToken(String authToken) {
        try {
            Jwts.parserBuilder().setSigningKey(getSignInKey()).build().parseClaimsJws(authToken);
            return true;
        } catch (MalformedJwtException e) {
            System.out.println("Token inválido: " + e.getMessage());
        } catch (ExpiredJwtException e) {
            System.out.println("Token expirado: " + e.getMessage());
        } catch (UnsupportedJwtException e) {
            System.out.println("Token não suportado: " + e.getMessage());
        } catch (IllegalArgumentException e){
            System.out.println("Token argumento inválido: " + e.getMessage());
        }
        return false;
    }
}
