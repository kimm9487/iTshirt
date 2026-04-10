package org.africalib.gallery.backend.controller;

import org.africalib.gallery.backend.dto.CreateItemRequest;
import org.africalib.gallery.backend.entity.Item;
import org.africalib.gallery.backend.entity.Member;
import org.africalib.gallery.backend.repository.ItemRepository;
import org.africalib.gallery.backend.repository.MemberRepository;
import org.africalib.gallery.backend.service.JwtService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
public class ItemController {
    @Autowired
    ItemRepository itemRepository;

    @Autowired
    JwtService jwtService;

    @Autowired
    MemberRepository memberRepository;

    @GetMapping("/api/items")
    public List<Item> getItems() {
        return itemRepository.findAll();
    }

    @PostMapping("/api/admin/items")
    public ResponseEntity createItem(
            @RequestBody CreateItemRequest request,
            @CookieValue(value = "token", required = false) String token
    ) {
        validateAdmin(token);

        if (request.getName() == null || request.getName().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Item name is required.");
        }

        Item item = new Item();
        item.setName(request.getName());
        item.setImgPath(request.getImgPath());
        item.setPrice(request.getPrice());
        item.setDiscountPer(Math.max(request.getDiscountPer(), 0));
        item.setStock(Math.max(request.getStock(), 0));
        itemRepository.save(item);

        return new ResponseEntity<>(item, HttpStatus.CREATED);
    }

    @PatchMapping("/api/admin/items/{itemId}/stock")
    public ResponseEntity patchItemStock(
            @PathVariable("itemId") int itemId,
            @RequestBody Map<String, Integer> body,
            @CookieValue(value = "token", required = false) String token
    ) {
        validateAdmin(token);

        Item item = itemRepository.findById(itemId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));

        int stock = body.getOrDefault("stock", item.getStock());
        item.setStock(Math.max(stock, 0));
        itemRepository.save(item);

        return new ResponseEntity<>(item, HttpStatus.OK);
    }

    @PostMapping("/api/admin/upload")
    public ResponseEntity<?> uploadImage(
            @RequestPart("file") MultipartFile file,
            @CookieValue(value = "token", required = false) String token
    ) {
        validateAdmin(token);

        String contentType = file.getContentType();
        if (contentType == null || (!contentType.equals("image/jpeg") && !contentType.equals("image/png"))) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "jpg 또는 png 파일만 업로드 가능합니다.");
        }

        String ext = contentType.equals("image/jpeg") ? ".jpg" : ".png";
        String filename = UUID.randomUUID().toString() + ext;
        Path uploadDir = Paths.get("uploads");
        try {
            Files.createDirectories(uploadDir);
            Files.copy(file.getInputStream(), uploadDir.resolve(filename));
        } catch (IOException e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "파일 저장에 실패했습니다.");
        }

        return ResponseEntity.ok(Map.of("url", "/uploads/" + filename));
    }

    private void validateAdmin(String token) {
        if (!jwtService.isValid(token)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED);
        }

        int memberId = jwtService.getId(token);
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED));

        if (!"ADMIN".equalsIgnoreCase(member.getRole())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Admin role required.");
        }
    }
}
