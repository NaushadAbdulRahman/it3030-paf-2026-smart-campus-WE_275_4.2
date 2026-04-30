import axios from "axios";

const BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8080/api";

const api = axios.create({
    baseURL: BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

// Attach JWT token from localStorage
api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
});

// Handle errors — redirect to login on 401
api.interceptors.response.use(
    (res) => res,
    (err) => {
        if (err.response?.status === 401) {
            // Don't redirect if already on login/register page
            if (!window.location.pathname.startsWith('/login')
                && !window.location.pathname.startsWith('/oauth2')) {
                localStorage.removeItem("token");
                window.location.href = "/login";
            }
        }
        const message = err.response?.data?.message || "Something went wrong";
        return Promise.reject({
            message,
            status: err.response?.status,
        });
    }
);

const unwrap = (res) => res.data?.data;

// ─── Auth APIs ──────────────────────────────
export const authApi = {
    login: (email, password) =>
        api.post("/auth/login", { email, password }).then(unwrap),

    register: (email, name, password) =>
        api.post("/auth/register", { email, name, password }).then(unwrap),

    getMe: () =>
        api.get("/auth/me").then(unwrap),
};

// ─── User APIs ──────────────────────────────
export const userApi = {
    getAll: () =>
        api.get("/users").then(unwrap),

    getTechnicians: () =>
        api.get("/users/technicians").then(unwrap),

    updateRole: (userId, role) =>
        api.put(`/users/${userId}/role`, { role }).then(unwrap),
};

// ─── Resource APIs ──────────────────────────
export const resourceApi = {
    getAll: (params = {}) =>
        api.get("/resources", { params }).then(unwrap),

    getById: (id) =>
        api.get(`/resources/${id}`).then(unwrap),

    create: (data) =>
        api.post("/resources", data).then(unwrap),

    update: (id, data) =>
        api.put(`/resources/${id}`, data).then(unwrap),

    delete: (id) =>
        api.delete(`/resources/${id}`),
};

// ─── Booking APIs ────────────────────────
export const bookingApi = {
    getAll: (params = {}) =>
        api.get("/bookings", { params }).then(unwrap),

    getById: (id) =>
        api.get(`/bookings/${id}`).then(unwrap),

    create: (data) =>
        api.post("/bookings", data).then(unwrap),

    approve: (id) =>
        api.put(`/bookings/${id}/approve`).then(unwrap),

    reject: (id, reason) =>
        api.put(`/bookings/${id}/reject`, { reason }).then(unwrap),

    cancel: (id) =>
        api.put(`/bookings/${id}/cancel`).then(unwrap),

    stats: () =>
        api.get("/bookings/stats").then(unwrap),
};

// ─── Ticket APIs ─────────────────────────
export const ticketApi = {
    getAll: (params = {}) =>
        api.get("/tickets", { params }).then(unwrap),

    getById: (id) =>
        api.get(`/tickets/${id}`).then(unwrap),

    getOverdue: () =>
        api.get("/tickets/overdue").then(unwrap),

    getHistory: (id) =>
        api.get(`/tickets/${id}`).then((res) => res.data?.data?.statusHistory || []),

    getActivity: (id) =>
        api.get(`/tickets/${id}/activity`).then(unwrap),

    create: (data) =>
        api.post("/tickets", data).then(unwrap),

    update: (id, data) =>
        api.put(`/tickets/${id}`, data).then(unwrap),

    updateStatus: (id, data) =>
        api.put(`/tickets/${id}/status`, data).then(unwrap),

    assign: (id, technicianId) =>
        api.put(`/tickets/${id}/assign`, { technicianId })
            .then(unwrap),

    delete: (id) =>
        api.delete(`/tickets/${id}`),

    checkDuplicates: (resourceId) =>
        api.get(`/tickets/duplicate-check?resourceId=${resourceId}`).then(unwrap),
};

export const attachmentApi = {
    upload: (ticketId, file, caption = "") => {
        const formData = new FormData();
        formData.append("file", file);
        if (caption) {
            formData.append("caption", caption);
        }

        return api.post(`/tickets/${ticketId}/attachments`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
        }).then(unwrap);
    },

    list: (ticketId) =>
        api.get(`/tickets/${ticketId}/attachments`).then(unwrap),

    updateCaption: (ticketId, attachmentId, caption) =>
        api.patch(`/tickets/${ticketId}/attachments/${attachmentId}`, { caption }).then(unwrap),

    delete: (ticketId, attachmentId) =>
        api.delete(`/tickets/${ticketId}/attachments/${attachmentId}`),

    getFileUrl: (ticketId, attachmentId) =>
        `${BASE_URL}/tickets/${ticketId}/attachments/${attachmentId}/file`,
};

export const commentApi = {
    add: (ticketId, content) =>
        api.post(`/tickets/${ticketId}/comments`, { content }).then(unwrap),

    list: (ticketId) =>
        api.get(`/tickets/${ticketId}/comments`).then(unwrap),

    update: (ticketId, commentId, content) =>
        api.put(`/tickets/${ticketId}/comments/${commentId}`, { content }).then(unwrap),

    delete: (ticketId, commentId) =>
        api.delete(`/tickets/${ticketId}/comments/${commentId}`),
};

export const analyticsApi = {
    byCategory: () =>
        api.get("/analytics/tickets/by-category").then(unwrap),

    byStatus: () =>
        api.get("/analytics/tickets/by-status").then(unwrap),

    resolution: () =>
        api.get("/analytics/tickets/resolution").then(unwrap),

    peakHours: () =>
        api.get("/analytics/tickets/peak-hours").then(unwrap),

    workload: () =>
        api.get("/analytics/technicians/workload").then(unwrap),

    suggestTechnician: () =>
        api.get("/analytics/technicians/suggest").then(unwrap),
};

// ─── Notification APIs ──────────────────
export const notificationApi = {
    getAll: (params = {}) =>
        api.get("/notifications", { params }).then(unwrap),

    getUnreadCount: () =>
        api.get("/notifications/unread-count").then(unwrap),

    markAsRead: (id) =>
        api.put(`/notifications/${id}/read`).then(unwrap),

    markAllAsRead: () =>
        api.put("/notifications/read-all").then(unwrap),

    delete: (id) =>
        api.delete(`/notifications/${id}`).then(unwrap),
};

export default api;