package com.paf.backend.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.paf.backend.entity.enums.ResourceStatus;
import com.paf.backend.entity.enums.ResourceType;
import com.paf.backend.entity.enums.ResourceTypeParser;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.List;

@Entity
@Table(name = "resources")
public class Resource {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Stored as string in database so legacy values (e.g. "MEETING ROOM") load without enum errors. */
    @JsonIgnore
    @NotBlank(message = "Resource type is required")
    @Column(nullable = false)
    private String type;

    @NotBlank(message = "Resource name is required")
    @Column(nullable = false)
    private String name;
    
    @Column(nullable = true)
    private Integer capacity;

    @NotBlank(message = "Location is required")
    @Column(nullable = false)
    private String location;

    @NotBlank(message = "Availability is required")
    @Column(nullable = false)
    private String availability; // e.g. "08:00-17:00"

    @NotNull(message = "Status is required")
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ResourceStatus status; // ACTIVE / OUT_OF_SERVICE

    @ElementCollection
    @CollectionTable(name = "resource_tags", joinColumns = @JoinColumn(name = "resource_id"))
    @Column(name = "tag")
    private List<String> tags; // e.g. Air-conditioned, Multimedia-enabled

    public Resource() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public Integer getCapacity() { return capacity; }
    public void setCapacity(Integer capacity) { this.capacity = capacity; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public String getAvailability() { return availability; }
    public void setAvailability(String availability) { this.availability = availability; }

    public ResourceStatus getStatus() { return status; }
    public void setStatus(ResourceStatus status) { this.status = status; }

    public List<String> getTags() { return tags; }
    public void setTags(List<String> tags) { this.tags = tags; }

    // --- Getters and Setters ---
    @JsonIgnore
    public ResourceType getType() {
        return ResourceTypeParser.parse(type);
    }

    public String getRawType() {
        return type;
    }

    public void setType(ResourceType type) {
        this.type = type == null ? null : type.name();
    }

    @JsonProperty("type")
    public void setType(String type) {
        this.type = type;
    }
}
