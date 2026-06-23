package com.abstorebackend.demo.repositories;
import com.abstorebackend.demo.entities.Contact;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ContactRepository extends JpaRepository<Contact, Long> {
}
