const addContact = async () => {
  const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";
  await fetch(`${API_BASE}/api/social/add-contact`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      id: "YOUR_DOC_ID",
      name: name,
      number: number
    })
  });
};