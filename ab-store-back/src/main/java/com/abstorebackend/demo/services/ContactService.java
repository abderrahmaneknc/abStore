package com.abstorebackend.demo.services;
import com.abstorebackend.demo.dto.ContactDTO;
import java.util.List;

public interface ContactService {
    ContactDTO submitContact(ContactDTO dto);
    List<ContactDTO> getAllContacts();
    ContactDTO markAsRead(Long id);
    void deleteContact(Long id);
}
