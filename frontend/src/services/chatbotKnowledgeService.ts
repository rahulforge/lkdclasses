import { authService } from "@/services/authService";

export type ChatbotDocument = {
  id: string;
  slug: string;
  title: string;
  category: string;
  content: string;
  source?: string | null;
  metadata?: Record<string, unknown> | null;
  updated_at?: string;
};

async function apiRequest<T>(url: string, options?: RequestInit): Promise<T> {
  const token = authService.getStoredSession()?.accessToken;
  if (!token) {
    throw new Error("Admin session not found");
  }

  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(options?.headers ?? {}),
    },
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.error || "Request failed");
  }

  return data as T;
}

export const chatbotKnowledgeService = {
  async list(): Promise<ChatbotDocument[]> {
    const data = await apiRequest<{ documents: ChatbotDocument[] }>("/api/admin/chatbot-documents");
    return data.documents ?? [];
  },

  async create(payload: Omit<ChatbotDocument, "id" | "updated_at">): Promise<ChatbotDocument | null> {
    const data = await apiRequest<{ document: ChatbotDocument | null }>("/api/admin/chatbot-documents", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return data.document;
  },

  async update(payload: ChatbotDocument): Promise<ChatbotDocument | null> {
    const data = await apiRequest<{ document: ChatbotDocument | null }>("/api/admin/chatbot-documents", {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
    return data.document;
  },

  async remove(id: string): Promise<void> {
    await apiRequest<{ success: boolean }>(`/api/admin/chatbot-documents?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
  },
};
