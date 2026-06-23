package com.abstorebackend.demo.services.impl;

import com.abstorebackend.demo.dto.ContactDTO;
import com.abstorebackend.demo.entities.Contact;
import com.abstorebackend.demo.exceptions.ResourceNotFoundException;
import com.abstorebackend.demo.repositories.ContactRepository;
import com.abstorebackend.demo.services.ContactService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ContactServiceImpl implements ContactService {

    private final ContactRepository contactRepository;

    private ContactDTO mapToDTO(Contact contact) {
        ContactDTO dto = new ContactDTO();
        dto.setId(contact.getId());
        dto.setName(contact.getName());
        dto.setPhoneOrEmail(contact.getPhoneOrEmail());
        dto.setMessage(contact.getMessage());
        dto.setIsRead(contact.getIsRead());
        dto.setCreatedAt(contact.getCreatedAt());
        return dto;
    }

    @Override
    public ContactDTO submitContact(ContactDTO dto) {
        Contact contact = new Contact();
        contact.setName(dto.getName());
        contact.setPhoneOrEmail(dto.getPhoneOrEmail());
        contact.setMessage(dto.getMessage());
        contact.setIsRead(false);
        return mapToDTO(contactRepository.save(contact));
    }

    @Override
    public List<ContactDTO> getAllContacts() {
        return contactRepository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public ContactDTO markAsRead(Long id) {
        Contact contact = contactRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Contact not found"));
        contact.setIsRead(true);
        return mapToDTO(contactRepository.save(contact));
    }

    @Override
    public void deleteContact(Long id) {
        contactRepository.deleteById(id);
    }
}
