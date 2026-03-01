const API_URL = "http://localhost:5000/api/compliance";

// Fetch compliance data
async function fetchCompliance() {
  const res = await fetch(API_URL);
  const data = await res.json();
  const list = document.getElementById("compliance-list");
  list.innerHTML = "";
  data.forEach(item => {
    const li = document.createElement("li");
    li.textContent = `${item.name} - ${item.status}`;
    list.appendChild(li);
  });
}

// Add new compliance record
document.getElementById("compliance-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const name = document.getElementById("name").value;
  const status = document.getElementById("status").value;

  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, status })
  });

  if (res.ok) {
    document.getElementById("name").value = "";
    document.getElementById("status").value = "";
    fetchCompliance(); // refresh list
  } else {
    alert("Error adding compliance record");
  }
});

// Initial fetch
fetchCompliance();