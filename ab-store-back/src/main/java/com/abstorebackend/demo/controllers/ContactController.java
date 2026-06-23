package com.abstorebackend.demo.controllers;

import com.abstorebackend.demo.dto.ContactDTO;
import com.abstorebackend.demo.services.ContactService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/contact")
@RequiredArgsConstructor
public class ContactController {

    private final ContactService contactService;

    // Public: Submit contact
    @PostMapping
    public ResponseEntity<ContactDTO> submitContact(@RequestBody ContactDTO dto) {
        return ResponseEntity.ok(contactService.submitContact(dto));
    }

    // Admin: Get all contacts
    @GetMapping
    public ResponseEntity<List<ContactDTO>> getAllContacts() {
        return ResponseEntity.ok(contactService.getAllContacts());
    }

    // Admin: Mark as read
    @PutMapping("/{id}/read")
    public ResponseEntity<ContactDTO> markAsRead(@PathVariable Long id) {
        return ResponseEntity.ok(contactService.markAsRead(id));
    }

    // Admin: Delete contact
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteContact(@PathVariable Long id) {
        contactService.deleteContact(id);
        return ResponseEntity.ok().build();
    }
}
