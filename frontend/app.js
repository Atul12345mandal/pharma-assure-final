const API_URL = "http://localhost:5000";

// Function to load compliance data
async function loadCompliance() {
    try {
        const response = await fetch(`${API_URL}/compliance`);
        const data = await response.json();

        const tbody = document.querySelector("#compliance-table tbody");
        tbody.innerHTML = ""; // Clear table before adding

        data.forEach(record => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td>${record.id}</td>
                <td>${record.name}</td>
                <td>${record.status}</td>
            `;
            tbody.appendChild(tr);
        });
    } catch (err) {
        console.error("Error fetching compliance data:", err);
    }
}

// Function to add new compliance
async function addCompliance(event) {
    event.preventDefault();

    const name = document.querySelector("#name").value;
    const status = document.querySelector("#status").value;

    try {
        const response = await fetch(`${API_URL}/compliance`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, status })
        });

        const result = await response.json();
        console.log(result.message);

        // Reload the table
        loadCompliance();

        // Clear form
        document.querySelector("#add-form").reset();
    } catch (err) {
        console.error("Error adding compliance:", err);
    }
}

// Event listener for form submission
document.querySelector("#add-form").addEventListener("submit", addCompliance);

// Load compliance data on page load
loadCompliance();