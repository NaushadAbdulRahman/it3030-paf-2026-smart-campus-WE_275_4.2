package com.paf.backend.repository;

import com.paf.backend.entity.Resource;
import com.paf.backend.entity.enums.ResourceStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ResourceRepository extends JpaRepository<Resource, Long> {
    List<Resource> findByType(String type);
    List<Resource> findByCapacityGreaterThan(int capacity);
    List<Resource> findByLocation(String location);
    List<Resource> findByStatus(ResourceStatus status);
}
