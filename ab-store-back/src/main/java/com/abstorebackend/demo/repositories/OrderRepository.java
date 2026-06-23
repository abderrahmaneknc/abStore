package com.abstorebackend.demo.repositories;
import com.abstorebackend.demo.entities.Order;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OrderRepository extends JpaRepository<Order, Long> {
}
