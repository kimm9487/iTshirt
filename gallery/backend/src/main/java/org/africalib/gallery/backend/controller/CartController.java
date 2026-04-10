package org.africalib.gallery.backend.controller;

import org.africalib.gallery.backend.entity.Cart;
import org.africalib.gallery.backend.entity.Item;
import org.africalib.gallery.backend.repository.CartRepository;
import org.africalib.gallery.backend.repository.ItemRepository;
import org.africalib.gallery.backend.service.JwtService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
public class CartController {
    @Autowired
    JwtService jwtService;

    @Autowired
    CartRepository cartRepository;

    @Autowired
    ItemRepository itemRepository;

    @GetMapping("/api/cart/items")
    public ResponseEntity getCartItems(@CookieValue(value = "token", required = false) String token) {
        if (!jwtService.isValid(token)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED);
        }
        int memberId = jwtService.getId(token);
        List<Cart> carts = cartRepository.findByMemberId(memberId);
        List<Integer> itemIds = carts.stream().map(Cart::getItemId).toList();
        List<Item> items = itemRepository.findByIdIn(itemIds);
        Map<Integer, Item> itemMap = items.stream().collect(Collectors.toMap(Item::getId, item -> item, (a, b) -> a));

        List<Map<String, Object>> response = carts.stream().map(cart -> {
            Item item = itemMap.get(cart.getItemId());
            if (item == null) {
                return null;
            }

            return Map.of(
                    "itemId", item.getId(),
                    "name", item.getName(),
                    "imgPath", item.getImgPath(),
                    "price", item.getPrice(),
                    "discountPer", item.getDiscountPer(),
                    "quantity", cart.getQuantity()
            );
        }).filter(row -> row != null).toList();

        return new ResponseEntity<>(response, HttpStatus.OK);
    }


    @PostMapping("/api/cart/items/{itemId}")
    public ResponseEntity<Void> pushCartItem(
            @PathVariable("itemId") int itemId,
            @CookieValue(value = "token", required = false) String token
    ) {
        if (!jwtService.isValid(token)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED);
        }
        int memberId = jwtService.getId(token);
        Cart cart = cartRepository.findByMemberIdAndItemId(memberId, itemId);

        if (cart == null) {
            Cart newCart = new Cart();
            newCart.setMemberId(memberId);
            newCart.setItemId(itemId);
            newCart.setQuantity(1);
            cartRepository.save(newCart);
        } else {
            cart.setQuantity(cart.getQuantity() + 1);
            cartRepository.save(cart);
        }
        return new ResponseEntity<>(HttpStatus.OK);
    }

    @PatchMapping("/api/cart/items/{itemId}")
    public ResponseEntity<Void> patchCartItemQuantity(
            @PathVariable("itemId") int itemId,
            @RequestBody Map<String, Integer> body,
            @CookieValue(value = "token", required = false) String token
    ) {
        if (!jwtService.isValid(token)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED);
        }

        int memberId = jwtService.getId(token);
        int quantity = body.getOrDefault("quantity", 0);
        Cart cart = cartRepository.findByMemberIdAndItemId(memberId, itemId);

        if (quantity <= 0) {
            if (cart != null) {
                cartRepository.delete(cart);
            }
            return new ResponseEntity<>(HttpStatus.OK);
        }

        if (cart == null) {
            Cart newCart = new Cart();
            newCart.setMemberId(memberId);
            newCart.setItemId(itemId);
            newCart.setQuantity(quantity);
            cartRepository.save(newCart);
        } else {
            cart.setQuantity(quantity);
            cartRepository.save(cart);
        }

        return new ResponseEntity<>(HttpStatus.OK);
    }

    @DeleteMapping("/api/cart/items/{itemId}")
    public ResponseEntity<Void> deleteCartItem(
            @PathVariable("itemId") int itemId,
            @CookieValue(value = "token", required = false) String token
    ) {
        if (!jwtService.isValid(token)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED);
        }

        int memberId = jwtService.getId(token);
        cartRepository.deleteByMemberIdAndItemId(memberId, itemId);
        return new ResponseEntity<>(HttpStatus.OK);
    }

    @DeleteMapping("/api/cart/items")
    public ResponseEntity<Void> clearCartItems(@CookieValue(value = "token", required = false) String token) {
        if (!jwtService.isValid(token)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED);
        }

        int memberId = jwtService.getId(token);
        cartRepository.deleteByMemberId(memberId);
        return new ResponseEntity<>(HttpStatus.OK);
    }
}
