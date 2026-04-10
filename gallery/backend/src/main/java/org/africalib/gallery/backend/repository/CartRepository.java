package org.africalib.gallery.backend.repository;

import org.africalib.gallery.backend.entity.Cart;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CartRepository extends JpaRepository<Cart,Integer> {

    List<Cart> findByMemberId(int memberId);
    Cart findByMemberIdAndItemId(int memberId,int itemId);
    Optional<Cart> findOptionalByMemberIdAndItemId(int memberId, int itemId);
    void deleteByMemberIdAndItemId(int memberId, int itemId);
    void deleteByMemberId(int memberId);

}
