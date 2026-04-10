package org.africalib.gallery.backend.controller;

import org.africalib.gallery.backend.dto.CancelOrderRequest;
import org.africalib.gallery.backend.entity.Cart;
import org.africalib.gallery.backend.entity.Item;
import org.africalib.gallery.backend.entity.Order;
import org.africalib.gallery.backend.entity.OrderItem;
import org.africalib.gallery.backend.repository.CartRepository;
import org.africalib.gallery.backend.repository.ItemRepository;
import org.africalib.gallery.backend.repository.OrderItemRepository;
import org.africalib.gallery.backend.repository.OrderRepository;
import org.africalib.gallery.backend.service.JwtService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
public class OrderController {
    @Autowired
    JwtService jwtService;

    @Autowired
    CartRepository cartRepository;

    @Autowired
    ItemRepository itemRepository;

    @Autowired
    OrderRepository orderRepository;

    @Autowired
    OrderItemRepository orderItemRepository;

    @PostMapping("/api/orders/checkout")
    public ResponseEntity checkout(@CookieValue(value = "token", required = false) String token) {
        if (!jwtService.isValid(token)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED);
        }

        int memberId = jwtService.getId(token);
        List<Cart> carts = cartRepository.findByMemberId(memberId);

        if (carts.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cart is empty.");
        }

        List<Integer> itemIds = carts.stream().map(Cart::getItemId).toList();
        List<Item> items = itemRepository.findByIdIn(itemIds);

        Map<Integer, Item> itemMap = items.stream().collect(Collectors.toMap(Item::getId, item -> item, (a, b) -> a));

        Order order = new Order();
        order.setMemberId(memberId);
        order.setStatus("PAID");
        order.setTotalPrice(0);
        orderRepository.save(order);

        int totalPrice = 0;
        int itemCount = 0;

        for (Cart cart : carts) {
            Item item = itemMap.get(cart.getItemId());
            if (item == null) {
                continue;
            }

            int unitPrice = item.getPrice() - (item.getPrice() * item.getDiscountPer() / 100);
            int quantity = Math.max(cart.getQuantity(), 1);
            if (item.getStock() < quantity) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Not enough stock for item: " + item.getName());
            }
            int linePrice = unitPrice * quantity;

            OrderItem orderItem = new OrderItem();
            orderItem.setOrderId(order.getId());
            orderItem.setItemId(item.getId());
            orderItem.setItemName(item.getName());
            orderItem.setUnitPrice(unitPrice);
            orderItem.setQuantity(quantity);
            orderItem.setLinePrice(linePrice);
            orderItemRepository.save(orderItem);

            item.setStock(item.getStock() - quantity);
            itemRepository.save(item);

            totalPrice += linePrice;
            itemCount += quantity;
        }

        order.setTotalPrice(totalPrice);
        orderRepository.save(order);

        cartRepository.deleteByMemberId(memberId);

        return new ResponseEntity<>(
                Map.of(
                        "orderId", order.getId(),
                        "totalPrice", totalPrice,
                        "itemCount", itemCount,
                        "status", order.getStatus()
                ),
                HttpStatus.OK
        );
    }

    @GetMapping("/api/orders")
    public ResponseEntity getOrders(@CookieValue(value = "token", required = false) String token) {
        if (!jwtService.isValid(token)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED);
        }

        int memberId = jwtService.getId(token);
        List<Order> orders = orderRepository.findByMemberIdOrderByIdDesc(memberId);
        List<Integer> orderIds = orders.stream().map(Order::getId).toList();

        List<OrderItem> allOrderItems = orderIds.isEmpty() ? List.of() : orderItemRepository.findByOrderIdIn(orderIds);
        Map<Integer, List<OrderItem>> orderItemsMap = allOrderItems.stream().collect(Collectors.groupingBy(OrderItem::getOrderId));

        List<Map<String, Object>> result = orders.stream().map(order -> {
            List<Map<String, Object>> items = orderItemsMap.getOrDefault(order.getId(), List.of()).stream()
                    .map(item -> {
                        Map<String, Object> row = new HashMap<>();
                        row.put("id", item.getId());
                        row.put("itemId", item.getItemId());
                        row.put("itemName", item.getItemName());
                        row.put("unitPrice", item.getUnitPrice());
                        row.put("quantity", item.getQuantity());
                        row.put("linePrice", item.getLinePrice());
                        return row;
                    })
                    .toList();

            Map<String, Object> orderMap = new HashMap<>();
            orderMap.put("id", order.getId());
            orderMap.put("memberId", order.getMemberId());
            orderMap.put("totalPrice", order.getTotalPrice());
            orderMap.put("status", order.getStatus());
            orderMap.put("createdAt", order.getCreatedAt());
            orderMap.put("items", items);
            return orderMap;
        }).toList();

        return new ResponseEntity<>(result, HttpStatus.OK);
    }

    @PostMapping("/api/orders/{orderId}/cancel")
    public ResponseEntity cancelOrder(
            @PathVariable("orderId") int orderId,
            @RequestBody(required = false) CancelOrderRequest request,
            @CookieValue(value = "token", required = false) String token
    ) {
        if (!jwtService.isValid(token)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED);
        }

        int memberId = jwtService.getId(token);
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));

        if (order.getMemberId() != memberId) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN);
        }

        if (!"PAID".equals(order.getStatus())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Only PAID orders can be canceled.");
        }

        List<OrderItem> orderItems = orderItemRepository.findByOrderId(orderId);
        List<Integer> itemIds = orderItems.stream().map(OrderItem::getItemId).toList();
        List<Item> items = itemRepository.findByIdIn(itemIds);
        Map<Integer, Item> itemMap = items.stream().collect(Collectors.toMap(Item::getId, item -> item, (a, b) -> a));

        for (OrderItem orderItem : orderItems) {
            Item item = itemMap.get(orderItem.getItemId());
            if (item == null) {
                continue;
            }
            item.setStock(item.getStock() + Math.max(orderItem.getQuantity(), 1));
            itemRepository.save(item);
        }

        String reason = request == null ? null : request.getReason();
        if (reason != null && !reason.isBlank()) {
            order.setStatus("CANCELED:" + reason);
        } else {
            order.setStatus("CANCELED");
        }
        orderRepository.save(order);

        return new ResponseEntity<>(Map.of("orderId", order.getId(), "status", order.getStatus()), HttpStatus.OK);
    }
}
