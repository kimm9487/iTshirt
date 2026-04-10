package org.africalib.gallery.backend.service;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Service;

import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

@Service("jwtService")

public class JwtServiceImpl implements JwtService {

    private final Key secretKey;

    public JwtServiceImpl() {
        this.secretKey = Keys.secretKeyFor(SignatureAlgorithm.HS256);
    }

    @Override
    public String getToken(String key, Object value) {
        Date expTime = new Date();
        expTime.setTime(expTime.getTime() + 1000 * 60 * 5);

        Map<String, Object> map = new HashMap<>();
        map.put(key, value);

        JwtBuilder builder = Jwts.builder().setHeader(createHeaderMap())
                .setClaims(map)
                .setExpiration(expTime)
                .signWith(secretKey, SignatureAlgorithm.HS256);

        return builder.compact();
    }

    @Override
    public Claims getClaims(String token) {
        if (token != null && !"".equals(token)) {
            try {
                Claims claims = Jwts.parserBuilder().setSigningKey(secretKey).build().parseClaimsJws(token).getBody();
                return claims;

            } catch (ExpiredJwtException e) {
                // 만료됨
            } catch (JwtException e) {
                // 유효하지 않음
            }
        }
        return null;
    }

    @Override
    public boolean isValid(String token) {
        return this.getClaims(token) !=null;
    }

    @Override
    public int getId(String token) {
        Claims claims  = this.getClaims(token);

        if(claims!=null){
            return Integer.parseInt(claims.get("id").toString());
        }
        return 0;
    }

    private Map<String, Object> createHeaderMap() {
        Map<String, Object> headerMap = new HashMap<>();
        headerMap.put("typ", "JWT");
        headerMap.put("alg", "HS256");
        return headerMap;
    }
}
