import axios from "axios";

const BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8080/api";

const api = axios.create({
    baseURL: BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

// Attach user email header
api.interceptors.request.use((config) => {
    const user = localStorage.getItem("userEmail") || "user1@test.com";
    config.headers["X-User-Email"] = user;
    return config;
});

// Handle errors cleanly
api.interceptors.response.use(
    (res) => res,
    (err) => {
        const message = err.response?.data?.message || "Something went wrong";
        return Promise.reject({
            message,
            status: err.response?.status,
        });
    }
);

const unwrap = (res) => res.data?.data;

// ─── Ticket APIs ─────────────────────────
export const ticketApi = {
    getAll: (params = {}) =>
        api.get("/tickets", { params }).then(unwrap),

    getById: (id) =>
        api.get(`/tickets/${id}`).then(unwrap),

    getOverdue: () =>
        api.get("/tickets/overdue").then(unwrap),

    // Backend currently exposes activity directly; history is read from ticket detail payload.
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

export default api;