document.getElementById("toggleBtn").addEventListener("click", function() {
    const sidebar = document.getElementById("sidebar");
    // Toggle sidebar's left position
    if (sidebar.style.left === "0px") {
      sidebar.style.left = "-250px"; // Roll in
    } else {
      sidebar.style.left = "0px"; // Roll out
    }
  });
  