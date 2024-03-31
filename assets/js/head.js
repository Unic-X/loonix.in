function createCopyButton(highlightDiv) {
    const button = document.createElement("button");
    button.className = "copy-code-button";
    button.type = "button";
    button.innerText = "Copy";
    button.addEventListener("click", () => copyCodeToClipboard(button, highlightDiv));
    highlightDiv.insertBefore(button, highlightDiv.firstChild);
  
    const wrapper = document.createElement("div");
    wrapper.className = "highlight-wrapper";
    highlightDiv.parentNode.insertBefore(wrapper, highlightDiv);
    wrapper.appendChild(highlightDiv);
  }
  
  document.querySelectorAll(".highlight").forEach((highlightDiv) => createCopyButton(highlightDiv))


async function copyCodeToClipboard(button, highlightDiv) {
    const codeToCopy = highlightDiv.querySelector(":last-child > .chroma > code").innerText;
    try {
      var result = await navigator.permissions.query({ name: "clipboard-write" });
      if (result.state == "granted" || result.state == "prompt") {
        await navigator.clipboard.writeText(codeToCopy);
      } else {
        copyCodeBlockExecCommand(codeToCopy, highlightDiv);
      }
    } catch (_) {
      copyCodeBlockExecCommand(codeToCopy, highlightDiv);
    } finally {
   button.blur();
    button.innerText = "Copied!";
    setTimeout(function () {
      button.innerText = "Copy";
    }, 2000);  }
  }
  
  function copyCodeBlockExecCommand(codeToCopy, highlightDiv) {
    const textArea = document.createElement("textArea");
    textArea.contentEditable = "true";
    textArea.readOnly = "false";
    textArea.className = "copyable-text-area";
    textArea.value = codeToCopy;
    highlightDiv.insertBefore(textArea, highlightDiv.firstChild);
    const range = document.createRange();
    range.selectNodeContents(textArea);
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
    textArea.setSelectionRange(0, 999999);
    document.execCommand("copy");
    highlightDiv.removeChild(textArea);
  }
  
  const toggleButton = document.getElementsByClassName('toggle-button')[0]
  const navbarLinks = document.getElementsByClassName('nav__list')[0]
  
  toggleButton.addEventListener('click', () => {
    navbarLinks.classList.toggle('active')
  })

  console.log(
    `%c
██╗      ██████╗  ██████╗ ███╗   ██╗██╗██╗  ██╗   ██╗███╗   ██╗
██║     ██╔═══██╗██╔═══██╗████╗  ██║██║╚██╗██╔╝   ██║████╗  ██║
██║     ██║   ██║██║   ██║██╔██╗ ██║██║ ╚███╔╝    ██║██╔██╗ ██║
██║     ██║   ██║██║   ██║██║╚██╗██║██║ ██╔██╗    ██║██║╚██╗██║
███████╗╚██████╔╝╚██████╔╝██║ ╚████║██║██╔╝ ██╗██╗██║██║ ╚████║
╚══════╝ ╚═════╝  ╚═════╝ ╚═╝  ╚═══╝╚═╝╚═╝  ╚═╝╚═╝╚═╝╚═╝  ╚═══╝
                                                                   
                                               
`,"color:rgba(255, 200, 139, 100);"
  )