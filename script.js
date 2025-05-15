const terminalWindow = document.getElementById("terminal-window");
const dragBar = document.getElementById("drag-bar");
const output = document.getElementById("output");

if (window.innerWidth < 768 || /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
  document.body.innerHTML = `
    <div style="display: flex; align-items: center; justify-content: center; height: 100vh; background: black; color: red; font-family: monospace; text-align: center; padding: 20px;">
      <div>
        <h1 style="margin-bottom: 1rem;">[!] ACCESSO NEGATO</h1>
        <p>Questo portfolio è progettato per essere visualizzato su PC desktop o laptop.</p>
        <p>Per favore accedi da un dispositivo con schermo più ampio.</p>
      </div>
    </div>
  `;
  throw new Error("Blocco visualizzazione su dispositivi mobili.");
}


let commandHistory = [];
let historyIndex = -1;

const validCommands = ["help", "about", "projects", "contact", "clear"];

function scrollToBottom() {
  output.scrollTop = output.scrollHeight;
}

function handleCommand(cmd) {
  if (cmd === "clear") {
    output.innerHTML = "";
    appendOutput("[+] Type 'help' to see available commands.");
  } else if (validCommands.includes(cmd)) {
    fetch(`assets/responses/${cmd}.html`)
      .then(res => {
        if (!res.ok) throw new Error("404");
        return res.text();
      })
      .then(html => {
        const container = document.createElement("div");
        container.innerHTML = html;
        output.appendChild(container);
        scrollToBottom();
      })
      .catch(() => appendOutput(`[-] Unknown command: ${cmd}`));
  } else {
    appendOutput(`[-] Unknown command: ${cmd}`);
  }
}

function appendOutput(text) {
  const block = document.createElement("div");
  block.textContent = text;
  output.appendChild(block);
  scrollToBottom();
}

function addInputPrompt() {
  historyIndex = -1;

  const inputLine = document.createElement("div");
  inputLine.className = "input-line";

  const prompt = document.createElement("span");
  prompt.className = "prompt-symbol";
  prompt.textContent = ">";

  const inputWrapper = document.createElement("div");
  inputWrapper.className = "input-wrapper";

  const ghost = document.createElement("span");
  ghost.className = "ghost-text";

  const inputField = document.createElement("input");
  inputField.type = "text";
  inputField.className = "visible-input";
  inputField.autocomplete = "off";

  inputWrapper.appendChild(ghost);
  inputWrapper.appendChild(inputField);
  inputLine.appendChild(prompt);
  inputLine.appendChild(inputWrapper);
  output.appendChild(inputLine);

  inputField.focus();

  inputField.addEventListener("input", () => {
  const partial = inputField.value.trim();
  const matches = validCommands.filter(cmd => cmd.startsWith(partial));
  if (matches.length === 1 && partial.length > 0 && matches[0] !== partial) {
    ghost.textContent = matches[0];
  } else {
    ghost.textContent = "";
  }
});

  inputField.addEventListener("keydown", (e) => {
    const partial = inputField.value.trim();

    if (e.key === "Enter") {
      if (partial !== "") {
        commandHistory.unshift(partial);
      }
      historyIndex = -1;
      inputField.disabled = true;
      handleCommand(partial);
      setTimeout(addInputPrompt, 50);
    }

    if (e.key === "ArrowUp") {
      if (commandHistory.length > 0 && historyIndex < commandHistory.length - 1) {
        historyIndex++;
        inputField.value = commandHistory[historyIndex];
        inputField.dispatchEvent(new Event("input")); // aggiorna ghost
      }
    }

    if (e.key === "ArrowDown") {
      if (historyIndex > 0) {
        historyIndex--;
        inputField.value = commandHistory[historyIndex];
        inputField.dispatchEvent(new Event("input"));
      } else if (historyIndex === 0) {
        historyIndex = -1;
        inputField.value = "";
        inputField.dispatchEvent(new Event("input"));
      }
    }

    if (e.key === "Tab") {
      e.preventDefault();
      const matches = validCommands.filter(cmd => cmd.startsWith(partial));
      if (matches.length === 1) {
        inputField.value = matches[0];
        ghost.textContent = "";
      } else if (matches.length > 1) {
        appendOutput("[?] Completamento ambiguo: " + matches.join(", "));
        scrollToBottom();
      }
    }
  });

  scrollToBottom();
}

function simulateTyping(text, callback, delayPerChar = 90) {
  let i = 0;

  const topLine = document.createElement("div");
  topLine.innerHTML = `<span style="color:#03fc98;">┌─(</span><span style="color:#033dfc; font-weight: bold;">duck@duck</span><span style="color:#03fc98;">)-[ </span><span style="color:#f8f8f2;">~</span><span style="color:#03fc98;"> ]</span>`;
  output.appendChild(topLine);

  const bottomLine = document.createElement("div");
  bottomLine.innerHTML = `<span style="color:#03fc98;">└──</span><span style="color:#033dfc; font-weight: bold;">$ </span><span id="typed"></span>`;
  output.appendChild(bottomLine);

  const span = bottomLine.querySelector("#typed");

  function type() {
    if (i < text.length) {
      span.textContent += text.charAt(i);
      i++;
      scrollToBottom();
      setTimeout(type, delayPerChar);
    } else {
      callback();
    }
  }

  type();
}

function simulateLoading(cycles, callback) {
  let i = 0;
  const loadingLine = document.createElement("div");
  output.appendChild(loadingLine);

  function cycle() {
    loadingLine.textContent = `[+] Loading modules${'.'.repeat((i % 3) + 1)}`;
    scrollToBottom();
    i++;
    if (i < cycles * 5) {
      setTimeout(cycle, 300);
    } else {
      callback();
    }
  }
  cycle();
}

function clearOutput() {
  output.innerHTML = "";
  scrollToBottom();
}

function typeLineByLine(lines, index = 0, charDelay = 40, lineDelay = 300) {
  if (index >= lines.length) {
    addInputPrompt();
    return;
  }

  const line = document.createElement("div");
  output.appendChild(line);

  let charIndex = 0;

  function typeChar() {
    if (charIndex < lines[index].length) {
      line.textContent += lines[index].charAt(charIndex);
      charIndex++;
      scrollToBottom();
      setTimeout(typeChar, charDelay);
    } else {
      setTimeout(() => {
        typeLineByLine(lines, index + 1, charDelay, lineDelay);
      }, lineDelay);
    }
  }
  typeChar();
}

function printFinalMessage() {
  const outputEl = document.getElementById("output");
  outputEl.style.gap = "4px";

  const finalLines = [
    "Welcome to my portfolio.",
    "[+] Type 'help' to see available commands."
  ];
  
  clearOutput();
  typeLineByLine(finalLines, 0, 20, 150);
}

setTimeout(() => {
  simulateTyping("sudo ./portfolio.sh", () => {
    simulateLoading(3, () => {
      setTimeout(() => {
        printFinalMessage();
      }, 500);
    });
  }, 120);
}, 500);

let offsetX = 0, offsetY = 0, isDragging = false;

dragBar.addEventListener("mousedown", (e) => {
  isDragging = true;
  const rect = terminalWindow.getBoundingClientRect();
  offsetX = e.clientX - rect.left;
  offsetY = e.clientY - rect.top;
  document.body.style.userSelect = "none";
});

document.addEventListener("mouseup", () => {
  isDragging = false;
  document.body.style.userSelect = "auto";
});

document.addEventListener("mousemove", (e) => {
  if (!isDragging) return;
  terminalWindow.style.left = `${e.clientX - offsetX}px`;
  terminalWindow.style.top = `${e.clientY - offsetY}px`;
});

const middleButton = document.querySelector(".btn.middle");
let isMaximized = false;
let previousBounds = {};

function toggleMaximize() {
  if (!isMaximized) {
    previousBounds = {
      width: terminalWindow.style.width || terminalWindow.offsetWidth + "px",
      height: terminalWindow.style.height || terminalWindow.offsetHeight + "px",
      left: terminalWindow.style.left || terminalWindow.offsetLeft + "px",
      top: terminalWindow.style.top || terminalWindow.offsetTop + "px",
    };

    terminalWindow.style.top = "36px";
    terminalWindow.style.left = "0px";
    terminalWindow.style.width = "100vw";
    terminalWindow.style.height = "calc(100vh - 36px)";
    terminalWindow.style.resize = "none";
    isMaximized = true;
  } else {
    terminalWindow.style.width = previousBounds.width;
    terminalWindow.style.height = previousBounds.height;
    terminalWindow.style.left = previousBounds.left;
    terminalWindow.style.top = previousBounds.top;
    terminalWindow.style.resize = "both";
    isMaximized = false;
  }
}

middleButton.addEventListener("click", () => {
  toggleMaximize();
});

dragBar.addEventListener("dblclick", () => {
  toggleMaximize();
});
