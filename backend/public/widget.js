(function() {
  // 1. Identify the current script tag and extract parameters
  const currentScript = document.currentScript || (() => {
    const scripts = document.getElementsByTagName('script');
    return scripts[scripts.length - 1];
  })();

  const businessId = currentScript.getAttribute('data-business-id');
  const backendUrl = currentScript.getAttribute('data-backend-url') || 'http://localhost:5000';

  if (!businessId) {
    console.error('❌ CleanDesk AI Widget: data-business-id attribute is missing!');
    return;
  }

  // 2. Inject CSS Styles directly into page header
  const styles = `
    .cd-widget-container {
      position: fixed;
      bottom: 20px;
      right: 20px;
      z-index: 999999;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
    }
    .cd-widget-launcher {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
      font-size: 24px;
      transition: transform 0.2s ease-in-out;
    }
    .cd-widget-launcher:hover {
      transform: scale(1.05);
    }
    .cd-widget-window {
      position: absolute;
      bottom: 80px;
      right: 0;
      width: 370px;
      height: 500px;
      border-radius: 12px;
      background-color: #ffffff;
      box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
      display: none;
      flex-direction: column;
      overflow: hidden;
      border: 1px solid #e2e8f0;
    }
    .cd-widget-window.open {
      display: flex;
    }
    .cd-widget-header {
      background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
      color: #ffffff;
      padding: 15px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .cd-widget-header-title {
      font-size: 16px;
      font-weight: 600;
      margin: 0;
    }
    .cd-widget-header-subtitle {
      font-size: 11px;
      opacity: 0.8;
      margin: 2px 0 0 0;
    }
    .cd-widget-close {
      background: none;
      border: none;
      color: #fff;
      font-size: 20px;
      cursor: pointer;
      line-height: 1;
    }
    .cd-widget-body {
      flex-grow: 1;
      padding: 15px;
      overflow-y: auto;
      background-color: #f8fafc;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .cd-widget-msg {
      max-width: 80%;
      padding: 10px 14px;
      border-radius: 8px;
      font-size: 13.5px;
      line-height: 1.4;
      word-wrap: break-word;
    }
    .cd-widget-msg.customer {
      align-self: flex-end;
      background-color: #2563eb;
      color: #ffffff;
      border-bottom-right-radius: 2px;
    }
    .cd-widget-msg.ai {
      align-self: flex-start;
      background-color: #ffffff;
      color: #1e293b;
      border: 1px solid #e2e8f0;
      border-bottom-left-radius: 2px;
    }
    .cd-widget-typing {
      align-self: flex-start;
      background-color: #ffffff;
      border: 1px solid #e2e8f0;
      padding: 8px 12px;
      border-radius: 8px;
      display: flex;
      gap: 3px;
    }
    .cd-widget-dot {
      width: 6px;
      height: 6px;
      background-color: #94a3b8;
      border-radius: 50%;
      animation: cdTyping 1.4s infinite ease-in-out both;
    }
    .cd-widget-dot:nth-child(1) { animation-delay: -0.32s; }
    .cd-widget-dot:nth-child(2) { animation-delay: -0.16s; }
    @keyframes cdTyping {
      0%, 80%, 100% { transform: scale(0); }
      40% { transform: scale(1); }
    }
    .cd-widget-footer {
      display: flex;
      padding: 10px;
      border-top: 1px solid #e2e8f0;
      background-color: #ffffff;
    }
    .cd-widget-input {
      flex-grow: 1;
      border: 1px solid #e2e8f0;
      padding: 8px 12px;
      border-radius: 20px;
      font-size: 13px;
      outline: none;
    }
    .cd-widget-input:focus {
      border-color: #2563eb;
    }
    .cd-widget-send {
      background-color: #2563eb;
      color: #ffffff;
      border: none;
      padding: 0 16px;
      border-radius: 20px;
      margin-left: 8px;
      cursor: pointer;
      font-size: 13px;
      font-weight: 500;
    }
  `;

  const styleEl = document.createElement('style');
  styleEl.innerHTML = styles;
  document.head.appendChild(styleEl);

  // 3. Setup container and floating DOM
  const container = document.createElement('div');
  container.className = 'cd-widget-container';

  let conversationId = localStorage.getItem(`cd_conv_${businessId}`) || null;

  container.innerHTML = `
    <div class="cd-widget-window" id="cd-window">
      <div class="cd-widget-header">
        <div>
          <h4 class="cd-widget-header-title">AI Assistant</h4>
          <p class="cd-widget-header-subtitle">Ask questions or book a clean</p>
        </div>
        <button class="cd-widget-close" id="cd-close">×</button>
      </div>
      <div class="cd-widget-body" id="cd-body">
        <div class="cd-widget-msg ai">Hello! I am your AI receptionist. How can I help you today?</div>
      </div>
      <form class="cd-widget-footer" id="cd-form">
        <input type="text" class="cd-widget-input" id="cd-input" placeholder="Message..." autocomplete="off" />
        <button type="submit" class="cd-widget-send" id="cd-send">Send</button>
      </form>
    </div>
    <div class="cd-widget-launcher" id="cd-launcher">💬</div>
  `;

  document.body.appendChild(container);

  // 4. Register DOM Event Listeners
  const launcher = document.getElementById('cd-launcher');
  const windowEl = document.getElementById('cd-window');
  const closeBtn = document.getElementById('cd-close');
  const form = document.getElementById('cd-form');
  const input = document.getElementById('cd-input');
  const body = document.getElementById('cd-body');

  launcher.addEventListener('click', () => {
    windowEl.classList.toggle('open');
    if (windowEl.classList.contains('open')) {
      input.focus();
      body.scrollTop = body.scrollHeight;
    }
  });

  closeBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    windowEl.classList.remove('open');
  });

  const appendMessage = (sender, content) => {
    const msg = document.createElement('div');
    msg.className = `cd-widget-msg ${sender}`;
    msg.innerText = content;
    body.appendChild(msg);
    body.scrollTop = body.scrollHeight;
  };

  const appendTyping = () => {
    const typing = document.createElement('div');
    typing.className = 'cd-widget-typing';
    typing.id = 'cd-typing';
    typing.innerHTML = `
      <span class="cd-widget-dot"></span>
      <span class="cd-widget-dot"></span>
      <span class="cd-widget-dot"></span>
    `;
    body.appendChild(typing);
    body.scrollTop = body.scrollHeight;
  };

  const removeTyping = () => {
    const typing = document.getElementById('cd-typing');
    if (typing) typing.remove();
  };

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const text = input.value.trim();
    if (!text) return;

    input.value = '';
    appendMessage('customer', text);
    appendTyping();

    try {
      const response = await fetch(`${backendUrl}/api/chat/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          businessId,
          conversationId,
          message: text
        })
      });

      const data = await response.json();
      removeTyping();

      if (data.reply) {
        appendMessage('ai', data.reply);
      }

      if (data.conversationId) {
        conversationId = data.conversationId;
        localStorage.setItem(`cd_conv_${businessId}`, conversationId);
      }
    } catch (err) {
      console.error('❌ CleanDesk AI widget message transmission failed:', err);
      removeTyping();
      appendMessage('ai', 'Sorry, I encountered an issue sending your message. Please try again.');
    }
  });
})();
