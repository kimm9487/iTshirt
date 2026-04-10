package org.africalib.gallery.backend.repository;
import org.africalib.gallery.backend.entity.Member;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MemberRepository extends JpaRepository<Member,Integer> {
    Member findByEmail(String email);
    boolean existsByEmail(String email);

}
