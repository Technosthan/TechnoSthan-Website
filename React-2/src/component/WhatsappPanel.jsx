const addContact = async () => {
  await fetch("http://localhost:5000/api/social/add-contact", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      id: "YOUR_DOC_ID",
      name: name,
      number: number
    })
  });
};