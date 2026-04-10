package org.africalib.gallery.backend.repository;

import org.africalib.gallery.backend.entity.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface OrderItemRepository extends JpaRepository<OrderItem, Integer> {
    List<OrderItem> findByOrderIdIn(List<Integer> orderIds);
    List<OrderItem> findByOrderId(int orderId);
}
