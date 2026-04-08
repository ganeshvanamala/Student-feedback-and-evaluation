import { API_BASE_URL } from "./baseUrl";
const FORMS_API_URL = `${API_BASE_URL}/api/forms`;

export const normalizeFormsByCategory = (formsArray) => {
  const grouped = {
    academics: [],
    sports: [],
    hostel: [],
  };

  if (!Array.isArray(formsArray)) return grouped;

  formsArray.forEach((form) => {
    const category = form?.category;
    if (!grouped[category]) return;
    grouped[category].push(form);
  });

  return grouped;
};

export const fetchFormsByCategory = async () => {
  try {
    console.log("[FORMS] Sending request", { method: "GET", url: FORMS_API_URL });
    const response = await fetch(FORMS_API_URL, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    console.log("[FORMS] Response received", {
      status: response.status,
      ok: response.ok,
    });

    if (!response.ok) {
      throw new Error(`GET /api/forms failed with status ${response.status}`);
    }

    const forms = await response.json();
    console.log("[FORMS] Parsed response", forms);
    return normalizeFormsByCategory(forms);
  } catch (error) {
    console.error("API FAILED", error);
    throw error;
  }
};

export const postForm = async (form) => {
  try {
    console.log("[FORMS] Sending request", { method: "POST", url: FORMS_API_URL, body: form });
    const response = await fetch(FORMS_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(form),
    });

    console.log("[FORMS] Response received", {
      status: response.status,
      ok: response.ok,
    });

    if (!response.ok) {
      throw new Error(`POST /api/forms failed with status ${response.status}`);
    }

    const saved = await response.json();
    console.log("[FORMS] Parsed response", saved);
    return saved;
  } catch (error) {
    console.error("API FAILED", error);
    throw error;
  }
};

export const appendFormResponse = async (formId, responsePayload) => {
  try {
    const url = `${FORMS_API_URL}/${formId}/responses`;
    console.log("[FORMS] Sending request", { method: "PUT", url, body: responsePayload });
    const response = await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(responsePayload),
    });

    console.log("[FORMS] Response received", {
      status: response.status,
      ok: response.ok,
    });

    if (!response.ok) {
      throw new Error(`PUT /api/forms/${formId}/responses failed with status ${response.status}`);
    }

    const updated = await response.json();
    console.log("[FORMS] Parsed response", updated);
    return updated;
  } catch (error) {
    console.error("API FAILED", error);
    throw error;
  }
};

export const deleteFormById = async (formId) => {
  try {
    const url = `${FORMS_API_URL}/${encodeURIComponent(formId)}`;
    console.log("[FORMS] Sending request", { method: "DELETE", url });
    const response = await fetch(url, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });

    console.log("[FORMS] Response received", {
      status: response.status,
      ok: response.ok,
    });

    if (!response.ok) {
      throw new Error(`DELETE /api/forms/${formId} failed with status ${response.status}`);
    }
  } catch (error) {
    console.error("API FAILED", error);
    throw error;
  }
};
