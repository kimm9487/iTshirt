package org.africalib.gallery.backend.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "members")
public class Member {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @Column(length = 50, nullable = false,unique = true)
    private String email;

    @Column(length = 50)
    private String name;

    @Column(length = 100,nullable = false)
    private String password;

    @Column(length = 20, nullable = false)
    private String role = "USER";

}
