package org.africalib.gallery.backend.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CreateItemRequest {
    private String name;
    private String imgPath;
    private int price;
    private int discountPer;
    private int stock;
}
