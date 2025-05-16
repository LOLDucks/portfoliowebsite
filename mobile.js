if (window.innerWidth >= 768 && !/Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
  window.location.href = "index.html";
}

function showInfo(command) {
  const output = document.getElementById('output');
  output.innerHTML = ""; // <-- pulisce prima di mostrare il nuovo contenuto

  fetch(`assets/responses/${command}.html`)
    .then(response => {
      if (!response.ok) throw new Error("File non trovato");
      return response.text();
    })
    .then(html => {
      const container = document.createElement("div");
      container.innerHTML = html;
      output.appendChild(container);
      output.scrollTop = output.scrollHeight;
    })
    .catch(error => {
      const errorBlock = document.createElement("div");
      errorBlock.textContent = `[!] Errore: ${error.message}`;
      output.appendChild(errorBlock);
      output.scrollTop = output.scrollHeight;
    });
}
