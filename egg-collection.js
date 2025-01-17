document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("egg-collection-form");
  let chart = null;

  // Handle form submission
  form.addEventListener("submit", function (e) {
    e.preventDefault();

    const collectionDate = document.getElementById("collection-date").value;
    const eggsCollected = document.getElementById("eggs-collected").value;
    const damagedEggs = document.getElementById("damaged-eggs").value;

    // Save to database
    fetch("http://localhost:3000/api/egg-collection", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        collection_date: collectionDate,
        eggs_collected: eggsCollected,
        damaged_eggs: damagedEggs,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        alert("Collection recorded successfully");
        form.reset();
        displayCollectionHistory();
        updateChart();
      })
      .catch((error) => console.error("Error:", error));
  });

  // Function to display collection history
  function displayCollectionHistory() {
    fetch("http://localhost:3000/api/egg-collection")
      .then((response) => response.json())
      .then((collections) => {
        const tableContainer = document.getElementById("collection-data");
        tableContainer.innerHTML = `
                <table>
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Eggs Collected</th>
                            <th>Damaged Eggs</th>
                            <th>Good Eggs</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${collections
                          .map(
                            (collection) => `
                            <tr>
                                <td>${new Date(
                                  collection.collection_date
                                ).toLocaleDateString()}</td>
                                <td>${collection.eggs_collected}</td>
                                <td>${collection.damaged_eggs}</td>
                                <td>${
                                  collection.eggs_collected -
                                  collection.damaged_eggs
                                }</td>
                                <td>
                                    <button onclick="deleteCollection(${
                                      collection.id
                                    })">Delete</button>
                                </td>
                            </tr>
                        `
                          )
                          .join("")}
                    </tbody>
                </table>
            `;
      });
  }

  // Function to update the chart
  function updateChart() {
    fetch("http://localhost:3000/api/egg-collection/monthly")
      .then((response) => response.json())
      .then((data) => {
        const ctx = document
          .getElementById("eggCollectionChart")
          .getContext("2d");

        if (chart) {
          chart.destroy();
        }

        chart = new Chart(ctx, {
          type: "line",
          data: {
            labels: data.map((item) =>
              new Date(item.collection_date).toLocaleDateString()
            ),
            datasets: [
              {
                label: "Eggs Collected",
                data: data.map((item) => item.eggs_collected),
                borderColor: "rgb(75, 192, 192)",
                backgroundColor: "rgba(75, 192, 192, 0.2)",
                tension: 0.3,
                fill: true,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              y: {
                beginAtZero: true,
                title: {
                  display: true,
                  text: "Number of Eggs",
                },
              },
              x: {
                title: {
                  display: true,
                  text: "Date",
                },
              },
            },
            plugins: {
              legend: {
                display: true,
                position: "top",
              },
            },
          },
        });
      });
  }

  // Function to delete collection
  window.deleteCollection = function (id) {
    if (confirm("Are you sure you want to delete this record?")) {
      fetch(`http://localhost:3000/api/egg-collection/${id}`, {
        method: "DELETE",
      })
        .then((response) => response.json())
        .then((data) => {
          displayCollectionHistory();
          updateChart();
        })
        .catch((error) => console.error("Error:", error));
    }
  };

  // Initial load
  displayCollectionHistory();
  updateChart();
});
