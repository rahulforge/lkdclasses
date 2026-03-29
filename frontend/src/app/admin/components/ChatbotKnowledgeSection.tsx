"use client";

import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
  chatbotKnowledgeService,
  type ChatbotDocument,
} from "@/services/chatbotKnowledgeService";

type FormState = {
  id?: string;
  slug: string;
  title: string;
  category: string;
  content: string;
  source: string;
};

const initialForm: FormState = {
  slug: "",
  title: "",
  category: "general",
  content: "",
  source: "admin",
};

export default function ChatbotKnowledgeSection() {
  const [documents, setDocuments] = useState<ChatbotDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState<FormState>(initialForm);

  async function loadDocuments() {
    try {
      setLoading(true);
      const rows = await chatbotKnowledgeService.list();
      setDocuments(rows);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to load chatbot documents");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadDocuments();
  }, []);

  const filteredDocuments = useMemo(() => {
    const needle = search.trim().toLowerCase();
    if (!needle) return documents;

    return documents.filter((doc) =>
      [doc.slug, doc.title, doc.category, doc.content].some((value) =>
        String(value ?? "").toLowerCase().includes(needle)
      )
    );
  }, [documents, search]);

  async function handleSave() {
    if (!form.slug.trim() || !form.title.trim() || !form.content.trim()) {
      toast.error("Slug, title aur content required hai");
      return;
    }

    try {
      setSaving(true);

      if (form.id) {
        const updated = await chatbotKnowledgeService.update({
          id: form.id,
          slug: form.slug.trim(),
          title: form.title.trim(),
          category: form.category.trim() || "general",
          content: form.content.trim(),
          source: form.source.trim() || "admin",
        });

        setDocuments((prev) => prev.map((item) => (item.id === form.id ? updated ?? item : item)));
        toast.success("Chatbot knowledge updated");
      } else {
        const created = await chatbotKnowledgeService.create({
          slug: form.slug.trim(),
          title: form.title.trim(),
          category: form.category.trim() || "general",
          content: form.content.trim(),
          source: form.source.trim() || "admin",
        });

        if (created) {
          setDocuments((prev) => [created, ...prev]);
        }
        toast.success("Chatbot knowledge added");
      }

      setForm(initialForm);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to save document");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    const confirmed = window.confirm("Is document ko delete karna hai?");
    if (!confirmed) return;

    try {
      await chatbotKnowledgeService.remove(id);
      setDocuments((prev) => prev.filter((item) => item.id !== id));
      if (form.id === id) {
        setForm(initialForm);
      }
      toast.success("Document deleted");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to delete document");
    }
  }

  function handleEdit(doc: ChatbotDocument) {
    setForm({
      id: doc.id,
      slug: doc.slug,
      title: doc.title,
      category: doc.category,
      content: doc.content,
      source: doc.source ?? "admin",
    });
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-white p-6 shadow-md">
        <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-indigo-700">Chatbot Knowledge Manager</h2>
            <p className="text-sm text-gray-500">
              Yahin se chatbot ke answers ka data manage karo.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setForm(initialForm)}
            className="rounded-xl border border-indigo-200 px-4 py-2 text-sm font-semibold text-indigo-700 hover:bg-indigo-50"
          >
            New Document
          </button>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <input
            value={form.slug}
            onChange={(e) => setForm((prev) => ({ ...prev, slug: e.target.value }))}
            placeholder="slug"
            className="rounded-xl border px-4 py-3"
          />
          <input
            value={form.title}
            onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
            placeholder="title"
            className="rounded-xl border px-4 py-3"
          />
          <input
            value={form.category}
            onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))}
            placeholder="category"
            className="rounded-xl border px-4 py-3"
          />
          <input
            value={form.source}
            onChange={(e) => setForm((prev) => ({ ...prev, source: e.target.value }))}
            placeholder="source"
            className="rounded-xl border px-4 py-3"
          />
          <textarea
            value={form.content}
            onChange={(e) => setForm((prev) => ({ ...prev, content: e.target.value }))}
            placeholder="document content"
            className="min-h-40 rounded-xl border px-4 py-3 md:col-span-2"
          />
        </div>

        <div className="mt-4 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => void handleSave()}
            disabled={saving}
            className="rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-60"
          >
            {saving ? "Saving..." : form.id ? "Update Document" : "Add Document"}
          </button>
          {form.id ? (
            <button
              type="button"
              onClick={() => setForm(initialForm)}
              className="rounded-xl border px-5 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              Cancel Edit
            </button>
          ) : null}
        </div>
      </div>

      <div className="rounded-2xl bg-white p-6 shadow-md">
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <h3 className="text-lg font-bold text-gray-800">Knowledge Documents</h3>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search documents"
            className="w-full rounded-xl border px-4 py-2 md:w-80"
          />
        </div>

        {loading ? (
          <div className="rounded-xl border border-dashed p-8 text-center text-gray-500">Loading documents...</div>
        ) : filteredDocuments.length === 0 ? (
          <div className="rounded-xl border border-dashed p-8 text-center text-gray-500">No documents found.</div>
        ) : (
          <div className="space-y-4">
            {filteredDocuments.map((doc) => (
              <div key={doc.id} className="rounded-2xl border border-gray-100 p-4 shadow-sm">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="text-base font-bold text-indigo-700">{doc.title}</h4>
                      <span className="rounded-full bg-indigo-50 px-2 py-1 text-xs font-semibold text-indigo-600">
                        {doc.category}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">Slug: {doc.slug}</p>
                    <p className="text-sm whitespace-pre-line text-gray-700">{doc.content}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleEdit(doc)}
                      className="rounded-lg border px-3 py-2 text-sm font-medium hover:bg-gray-50"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleDelete(doc.id)}
                      className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-100"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
