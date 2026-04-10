package org.africalib.gallery.backend.controller;

import io.jsonwebtoken.Claims;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import org.africalib.gallery.backend.entity.Member;
import org.africalib.gallery.backend.repository.MemberRepository;
import org.africalib.gallery.backend.service.JwtService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.Map;

@RestController
public class AccountController {
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    @Autowired
    MemberRepository memberRepository;

    @Autowired
    JwtService jwtService;

    @PostMapping("/api/account/login")
    public ResponseEntity login(@RequestBody Map<String, String> params,
                                HttpServletResponse res) {
        Member member = memberRepository.findByEmail(params.get("email"));

        if (member != null && passwordEncoder.matches(params.get("password"), member.getPassword())) {
            int id = member.getId();
            String token = jwtService.getToken("id", id);
            res.addCookie(createLoginCookie(token));

            return new ResponseEntity<>(id, HttpStatus.OK);
        }

        throw new ResponseStatusException(HttpStatus.NOT_FOUND);

    }

    @GetMapping("/api/account/check")
    public ResponseEntity check(@CookieValue(value = "token", required = false) String token) {
        Claims claims = jwtService.getClaims(token);

        if (claims != null) {
            int id = Integer.parseInt(claims.get("id").toString());
            return new ResponseEntity<>(id, HttpStatus.OK);
        }


        return new ResponseEntity<>(null, HttpStatus.OK);
    }

    @PostMapping("/api/account/signup")
    public ResponseEntity signup(@RequestBody Map<String, String> params, HttpServletResponse res) {
        String email = params.get("email");
        String password = params.get("password");
        String name = params.get("name");

        if (email == null || email.isBlank() || password == null || password.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email and password are required.");
        }

        if (memberRepository.existsByEmail(email)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already exists.");
        }

        Member member = new Member();
        member.setEmail(email);
        member.setPassword(passwordEncoder.encode(password));
        member.setName(name);
        if ("admin@itshirt.com".equalsIgnoreCase(email)) {
            member.setRole("ADMIN");
        } else {
            member.setRole("USER");
        }
        memberRepository.save(member);

        String token = jwtService.getToken("id", member.getId());
        res.addCookie(createLoginCookie(token));

        return new ResponseEntity<>(member.getId(), HttpStatus.CREATED);
    }

    @PostMapping("/api/account/logout")
    public ResponseEntity<Void> logout(HttpServletResponse res) {
        Cookie cookie = new Cookie("token", "");
        cookie.setHttpOnly(true);
        cookie.setPath("/");
        cookie.setMaxAge(0);
        res.addCookie(cookie);
        return new ResponseEntity<>(HttpStatus.OK);
    }

    @GetMapping("/api/account/me")
    public ResponseEntity me(@CookieValue(value = "token", required = false) String token) {
        if (!jwtService.isValid(token)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED);
        }

        int id = jwtService.getId(token);
        Member member = memberRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));

        return new ResponseEntity<>(
                Map.of(
                        "id", member.getId(),
                        "email", member.getEmail(),
                    "name", member.getName() == null ? "" : member.getName(),
                    "role", member.getRole() == null ? "USER" : member.getRole()
                ),
                HttpStatus.OK
        );
    }

    private Cookie createLoginCookie(String token) {
        Cookie cookie = new Cookie("token", token);
        cookie.setHttpOnly(true);
        cookie.setPath("/");
        cookie.setMaxAge(60 * 60);
        return cookie;
    }
}
