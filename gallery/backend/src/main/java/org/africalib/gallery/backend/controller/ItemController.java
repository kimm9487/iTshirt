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
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;

@RestController
public class ItemController {
    @Autowired
    ItemRepository itemRepository;

    @Autowired
    JwtService jwtService;

    @Autowired
    MemberRepository memberRepository;

//    @CrossOrigin(origins = "http://localhost:3000")
    @GetMapping("/api/items")
    public List<Item> getItems() {
        List<Item> items = itemRepository.findAll();
        return items;
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
