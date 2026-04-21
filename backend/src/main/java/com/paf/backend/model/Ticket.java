package com.paf.backend.model;

import com.paf.backend.enums.TicketCategory;
import com.paf.backend.enums.TicketPriority;
import com.paf.backend.enums.TicketStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.util.List;
import java.util.ArrayList;

import java.time.LocalDateTime;

@Entity
@Table(name = "tickets")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Ticket {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 255)
    private String title;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private TicketCategory category;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private TicketPriority priority = TicketPriority.MEDIUM; // optional default

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private TicketStatus status = TicketStatus.OPEN;

    @Column(name = "resource_id")
    private String resourceId;

    @Column(nullable = false)
    private String location;

    @Column(name = "preferred_contact")
    private String preferredContact;

    @Column(name = "rejection_reason", columnDefinition = "TEXT")
    private String rejectionReason;

    @Column(name = "resolution_note", columnDefinition = "TEXT")
    private String resolutionNote;

    @Column(name = "created_by", nullable = false)
    private String createdBy;

    @Column(name = "assigned_to")
    private String assignedTo;

    @Column(name = "sla_deadline")
    private LocalDateTime slaDeadline;

    @Column(name = "is_sla_breached", nullable = false)
    @Builder.Default
    private boolean isSlaBreached = false;

    public void setIsSlaBreached(boolean isSlaBreached) {
        this.isSlaBreached = isSlaBreached;
    }

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;




    // 🚧 RELATIONSHIPS (ADD LATER — DO NOT REMOVE PERMANENTLY)
    @OneToMany(mappedBy = "ticket", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<TicketAttachment> attachments = new ArrayList<>();

    @OneToMany(mappedBy = "ticket", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("createdAt ASC")
    @Builder.Default
    private List<TicketComment> comments = new ArrayList<>();

    @OneToMany(mappedBy = "ticket", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("changedAt ASC")
    @Builder.Default
    private List<TicketStatusHistory> statusHistory = new ArrayList<>();

}