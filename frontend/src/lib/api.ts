const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const CACHE_TTL_MS = 30_000;
const responseCache = new Map<string, { expiresAt: number; value: unknown }>();
const pendingRequests = new Map<string, Promise<unknown>>();
const cachedPaths = new Set(["/api/dashboard", "/api/insights", "/api/model"]);

function invalidateCachedData() {
  responseCache.clear();
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const method = init?.method || "GET";
  const cacheKey = `${method}:${path}`;
  const isCacheable = method === "GET" && cachedPaths.has(path);

  if (isCacheable) {
    const cached = responseCache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) {
      return cached.value as T;
    }
    const pending = pendingRequests.get(cacheKey);
    if (pending) {
      return pending as Promise<T>;
    }
  }

  const fetchRequest = (async () => {
    const response = await fetch(`${API_BASE}${path}`, { ...init, cache: "no-store" });
    if (!response.ok) {
      const payload = await response.json().catch(() => ({}));
      throw new Error(payload.detail || `Request failed (${response.status})`);
    }
    const value = await response.json();
    if (isCacheable) {
      responseCache.set(cacheKey, { expiresAt: Date.now() + CACHE_TTL_MS, value });
    }
    return value as T;
  })();

  if (isCacheable) {
    pendingRequests.set(cacheKey, fetchRequest);
    fetchRequest.finally(() => pendingRequests.delete(cacheKey)).catch(() => undefined);
  }
  return fetchRequest;
}

export type Aspect = { aspect: string; sentiment: string; evidence: string };
export type Feedback = {
  id: number; text: string; sentiment: "positive" | "negative" | "neutral"; confidence: number;
  subject?: string | null; emotion: string; urgency: "low" | "medium" | "high";
  aspects: Aspect[]; source: string; created_at?: string | null;
};
export type Analysis = {
  sentiment: string; confidence: number; probabilities: Record<string, number>; emotion: string;
  urgency: string; aspects: Aspect[]; themes: string[]; redacted_preview: string; caveats: string[];
};

export const api = {
  health: () => request<{status:string; model_loaded:boolean; model:string}>("/api/health"),
  dashboard: () => request<any>("/api/dashboard"),
  feedback: (params = "") => request<{items:Feedback[];total:number}>(`/api/feedback${params}`),
  analyze: async (text:string, subject?:string) => {
    const result = await request<Analysis>("/api/analyze", {method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({text, subject, save:true})});
    invalidateCachedData();
    return result;
  },
  createFeedback: async (text:string, subject?:string) => {
    const result = await request<any>("/api/feedback", {method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({text,subject})});
    invalidateCachedData();
    return result;
  },
  insights: () => request<any>("/api/insights"),
  model: () => request<any>("/api/model"),
  deleteFeedback: async (id:number) => {
    const result = await request<any>(`/api/feedback/${id}`, {method:"DELETE"});
    invalidateCachedData();
    return result;
  },
  upload: async (file:File) => {
    const form = new FormData(); form.append("file", file);
    const response = await fetch(`${API_BASE}/api/feedback/bulk`, {method:"POST", body:form});
    if (!response.ok) { const p = await response.json().catch(()=>({})); throw new Error(p.detail || "Upload failed"); }
    const result = await response.json();
    invalidateCachedData();
    return result;
  },
  exportUrl: () => `${API_BASE}/api/reports/export.csv`,
  exportCsv: async (): Promise<Blob> => {
    const response = await fetch(`${API_BASE}/api/reports/export.csv`, { cache: "no-store" });
    if (!response.ok) {
      const payload = await response.json().catch(() => ({}));
      const detail = payload?.detail;
      throw new Error(typeof detail === "string" ? detail : `CSV export failed (${response.status})`);
    }
    return response.blob();
  },
};
