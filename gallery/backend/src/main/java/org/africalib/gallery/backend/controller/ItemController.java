package org.africalib.gallery.backend.controller;

import org.africalib.gallery.backend.dto.CreateItemRequest;
import org.africalib.gallery.backend.entity.Item;
import org.africalib.gallery.backend.entity.Member;
import org.africalib.gallery.backend.repository.ItemRepository;
import org.africalib.gallery.backend.repository.MemberRepository;
import org.africalib.gallery.backend.service.JwtService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
public class ItemController {
    @Autowired
    ItemRepository itemRepository;

    @Autowired
    JwtService jwtService;

    @Autowired
    MemberRepository memberRepository;

    @GetMapping("/api/items")
    public List<Map<String, Object>> getItems() {
        return itemRepository.findAll().stream().map(item -> {
            Map<String, Object> row = new java.util.HashMap<>();
            row.put("id", item.getId());
            row.put("name", item.getName());
            row.put("category", item.getCategory() == null ? "" : item.getCategory());
            row.put("imgPath", item.getImgPath() == null ? "" : item.getImgPath());
            row.put("imageUrl", item.getImageData() == null ? "" : "/api/items/" + item.getId() + "/image");
            row.put("price", item.getPrice());
            row.put("discountPer", item.getDiscountPer());
            row.put("stock", item.getStock());
            return row;
        }).collect(Collectors.toList());
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
        item.setCategory(request.getCategory());
        item.setImgPath(request.getImgPath());
        item.setImageData(null);
        item.setImageContentType(null);
        item.setPrice(request.getPrice());
        item.setDiscountPer(Math.max(request.getDiscountPer(), 0));
        item.setStock(Math.max(request.getStock(), 0));
        itemRepository.save(item);

        return new ResponseEntity<>(item, HttpStatus.CREATED);
    }

    @PostMapping(value = "/api/admin/items", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> createItemWithImage(
            @RequestParam("name") String name,
            @RequestParam(value = "category", defaultValue = "") String category,
            @RequestParam("price") int price,
            @RequestParam(value = "discountPer", defaultValue = "0") int discountPer,
            @RequestParam("stock") int stock,
            @RequestParam(value = "file", required = false) MultipartFile file,
            @CookieValue(value = "token", required = false) String token
    ) {
        validateAdmin(token);

        if (name == null || name.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Item name is required.");
        }

        Item item = new Item();
        item.setName(name);
        item.setCategory(category);
        item.setPrice(price);
        item.setDiscountPer(Math.max(discountPer, 0));
        item.setStock(Math.max(stock, 0));

        if (file != null && !file.isEmpty()) {
            String contentType = file.getContentType();
            if (contentType == null || (!contentType.equals("image/jpeg") && !contentType.equals("image/png"))) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "jpg 또는 png 파일만 업로드 가능합니다.");
            }

            try {
                item.setImageData(file.getBytes());
                item.setImageContentType(contentType);
                item.setImgPath("");
            } catch (IOException e) {
                throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "파일 저장에 실패했습니다.");
            }
        } else {
            item.setImgPath("");
            item.setImageData(null);
            item.setImageContentType(null);
        }

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

    @GetMapping("/api/items/{itemId}/image")
    public ResponseEntity<byte[]> getItemImage(@PathVariable("itemId") int itemId) {
        Item item = itemRepository.findById(itemId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));

        if (item.getImageData() == null || item.getImageData().length == 0) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND);
        }

        String contentType = item.getImageContentType() == null ? MediaType.APPLICATION_OCTET_STREAM_VALUE : item.getImageContentType();
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .body(item.getImageData());
    }

        @PutMapping(value = "/api/admin/items/{itemId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
        public ResponseEntity<?> updateItem(
                @PathVariable("itemId") int itemId,
                @RequestParam("name") String name,
                @RequestParam(value = "category", defaultValue = "") String category,
                @RequestParam("price") int price,
                @RequestParam(value = "discountPer", defaultValue = "0") int discountPer,
                @RequestParam(value = "file", required = false) MultipartFile file,
                @CookieValue(value = "token", required = false) String token
        ) {
            validateAdmin(token);

            Item item = itemRepository.findById(itemId)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));

            if (name == null || name.isBlank()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Item name is required.");
            }

            item.setName(name);
            item.setCategory(category);
            item.setPrice(price);
            item.setDiscountPer(Math.max(discountPer, 0));

            if (file != null && !file.isEmpty()) {
                String contentType = file.getContentType();
                if (contentType == null || (!contentType.equals("image/jpeg") && !contentType.equals("image/png"))) {
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "jpg 또는 png 파일만 업로드 가능합니다.");
                }
                try {
                    item.setImageData(file.getBytes());
                    item.setImageContentType(contentType);
                    item.setImgPath("");
                } catch (IOException e) {
                    throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "파일 저장에 실패했습니다.");
                }
            }

            itemRepository.save(item);
            return ResponseEntity.ok(item);
        }

        @DeleteMapping("/api/admin/items/{itemId}")
        public ResponseEntity<Void> deleteItem(
                @PathVariable("itemId") int itemId,
                @CookieValue(value = "token", required = false) String token
        ) {
            validateAdmin(token);
            itemRepository.findById(itemId)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
            itemRepository.deleteById(itemId);
            return ResponseEntity.noContent().build();
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
