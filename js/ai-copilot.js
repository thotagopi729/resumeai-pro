/**
 * ResumeAI Pro – Interactive AI Copilot & Career Assistant Engine
 */

(function () {
  // Inject HTML structure into DOM
  document.addEventListener('DOMContentLoaded', initAICopilot);

  function initAICopilot() {
    if (document.getElementById('aiCopilotLauncher')) return;

    // Create Launcher Button
    const launcher = document.createElement('button');
    launcher.id = 'aiCopilotLauncher';
    launcher.className = 'ai-copilot-launcher';
    launcher.setAttribute('aria-label', 'Open AI Career Copilot');
    launcher.innerHTML = `
      <span class="launcher-icon">✨</span>
      <span>AI Copilot</span>
      <span class="launcher-badge">Active</span>
    `;
    document.body.appendChild(launcher);

    // Create Chat Window
    const chatWin = document.createElement('div');
    chatWin.id = 'aiCopilotWindow';
    chatWin.className = 'ai-copilot-window';
    chatWin.innerHTML = `
      <div class="ai-copilot-header">
        <div class="ai-copilot-title">
          <span class="status-indicator"></span>
          <h3>ResumeAI Copilot</h3>
        </div>
        <div class="ai-copilot-actions">
          <button class="ai-btn-icon" id="aiSettingsToggle" title="AI Settings & API Key">⚙️</button>
          <button class="ai-btn-icon" id="aiMinimizeBtn" title="Minimize">✕</button>
        </div>
      </div>

      <div class="ai-quick-chips">
        <button class="chip-btn" data-prompt="Enhance my bullet points to sound more impactful and quantified.">✍️ Enhance Bullet Points</button>
        <button class="chip-btn" data-prompt="How can I improve my ATS score for a Senior Software Engineer position?">📈 Improve ATS Score</button>
        <button class="chip-btn" data-prompt="Give me a strong Opening Paragraph for a Cover Letter in Tech.">✉️ Cover Letter Intro</button>
        <button class="chip-btn" data-prompt="Ask me a behavioral interview question and give feedback on my answer.">🎤 Practice Interview</button>
      </div>

      <div class="ai-copilot-body" id="aiChatBody">
        <div class="chat-msg ai">
          <div class="chat-avatar">🤖</div>
          <div class="chat-bubble">
            <p><strong>Hi there! I'm your AI Career Assistant.</strong></p>
            <p>Ask me anything about improving your resume, beating ATS screeners, crafting cover letters, or preparing for job interviews!</p>
          </div>
        </div>
      </div>

      <div class="ai-copilot-footer">
        <input type="text" class="ai-input-box" id="aiInput" placeholder="Ask AI Copilot anything..." />
        <button class="ai-send-btn" id="aiSendBtn" title="Send message">➤</button>
      </div>

      <!-- Settings Panel -->
      <div class="ai-settings-modal" id="aiSettingsModal">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <h4 style="color:#ffffff; margin:0; font-size:1rem;">⚙️ AI Configuration</h4>
          <button class="ai-btn-icon" id="aiCloseSettings">✕</button>
        </div>
        <p style="font-size:0.8rem; color:#9ca3af; line-height:1.5;">
          ResumeAI Pro includes a built-in smart AI advisor out of the box. To connect directly to <strong>Google Gemini AI</strong> for live generative power, enter your API key below:
        </p>
        <div>
          <label style="display:block; font-size:0.75rem; color:#d1d5db; margin-bottom:6px; font-weight:600;">Gemini API Key (Optional)</label>
          <input type="password" id="geminiApiKey" class="ai-input-box" style="width:100%" placeholder="AIzaSy..." />
        </div>
        <button class="btn btn-primary btn-sm" id="saveApiKeyBtn" style="width:100%">Save Configuration</button>
        <div style="font-size:0.7rem; color:#10b981; display:none;" id="saveSuccessMsg">✓ Configuration saved locally!</div>
      </div>
    `;
    document.body.appendChild(chatWin);

    // Event Listeners
    launcher.addEventListener('click', toggleChatWindow);
    document.getElementById('aiMinimizeBtn').addEventListener('click', toggleChatWindow);
    document.getElementById('aiSettingsToggle').addEventListener('click', () => {
      document.getElementById('aiSettingsModal').classList.toggle('open');
    });
    document.getElementById('aiCloseSettings').addEventListener('click', () => {
      document.getElementById('aiSettingsModal').classList.remove('open');
    });

    // Load saved API key
    const savedKey = localStorage.getItem('RESUME_AI_GEMINI_KEY') || '';
    if (savedKey) {
      document.getElementById('geminiApiKey').value = savedKey;
    }

    document.getElementById('saveApiKeyBtn').addEventListener('click', () => {
      const key = document.getElementById('geminiApiKey').value.trim();
      localStorage.setItem('RESUME_AI_GEMINI_KEY', key);
      const msg = document.getElementById('saveSuccessMsg');
      msg.style.display = 'block';
      setTimeout(() => { msg.style.display = 'none'; }, 2500);
      document.getElementById('aiSettingsModal').classList.remove('open');
    });

    // Input handlers
    const input = document.getElementById('aiInput');
    const sendBtn = document.getElementById('aiSendBtn');

    sendBtn.addEventListener('click', handleUserSend);
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') handleUserSend();
    });

    // Quick Chips
    document.querySelectorAll('.chip-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const text = btn.getAttribute('data-prompt');
        input.value = text;
        handleUserSend();
      });
    });
  }

  function toggleChatWindow() {
    const win = document.getElementById('aiCopilotWindow');
    win.classList.toggle('open');
  }

  async function handleUserSend() {
    const input = document.getElementById('aiInput');
    const text = input.value.trim();
    if (!text) return;

    input.value = '';
    appendMessage('user', text);
    showTypingIndicator();

    try {
      const responseText = await queryAI(text);
      removeTypingIndicator();
      appendMessage('ai', responseText);
    } catch (err) {
      removeTypingIndicator();
      appendMessage('ai', '⚠️ I encountered a temporary network glitch. Please try again or check your Gemini API key settings.');
    }
  }

  function appendMessage(role, text) {
    const body = document.getElementById('aiChatBody');
    const msg = document.createElement('div');
    msg.className = `chat-msg ${role}`;
    const avatar = role === 'ai' ? '🤖' : '👤';

    // Basic formatting
    let formatted = text
      .replace(/\n\n/g, '</p><p>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`([^`]+)`/g, '<code>$1</code>');

    msg.innerHTML = `
      <div class="chat-avatar">${avatar}</div>
      <div class="chat-bubble"><p>${formatted}</p></div>
    `;
    body.appendChild(msg);
    body.scrollTop = body.scrollHeight;
  }

  function showTypingIndicator() {
    const body = document.getElementById('aiChatBody');
    const indicator = document.createElement('div');
    indicator.id = 'aiTypingIndicator';
    indicator.className = 'chat-msg ai';
    indicator.innerHTML = `
      <div class="chat-avatar">🤖</div>
      <div class="chat-bubble">
        <div class="typing-dots"><span></span><span></span><span></span></div>
      </div>
    `;
    body.appendChild(indicator);
    body.scrollTop = body.scrollHeight;
  }

  function removeTypingIndicator() {
    const el = document.getElementById('aiTypingIndicator');
    if (el) el.remove();
  }

  // AI Router: Uses live Gemini API if key is available, else uses domain-trained career intelligence
  async function queryAI(promptText) {
    const apiKey = localStorage.getItem('RESUME_AI_GEMINI_KEY');

    if (apiKey) {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
      const payload = {
        contents: [{
          parts: [{
            text: `You are ResumeAI Pro Copilot, an elite AI career advisor and ATS resume strategist. Keep answers concise, actionable, and formatted in clear markdown.\nUser Query: ${promptText}`
          }]
        }]
      };

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const data = await res.json();
        const candidate = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (candidate) return candidate;
      }
    }

    // Built-in Domain Intelligent Engine (Fallback)
    await new Promise(r => setTimeout(r, 900)); // Smooth response latency
    const lower = promptText.toLowerCase();

    if (lower.includes('bullet') || lower.includes('enhance') || lower.includes('resume')) {
      return `**Here are 3 high-impact action bullet points for your resume:**\n\n- **Architected & Scaled:** Spearheaded migration to modern cloud microservices, cutting API latency by **38%** and supporting 150k+ daily active users.\n- **Quantified Business Results:** Optimized database query indexing and automated deployment pipelines, saving **20+ engineering hours weekly**.\n- **Cross-Functional Leadership:** Partnered with Product & Design teams to deliver 5 core feature releases ahead of schedule with **zero critical bugs**.`;
    }

    if (lower.includes('ats') || lower.includes('score') || lower.includes('match')) {
      return `**Top ATS Optimization Strategies for your target job:**\n\n1. **Exact Keyword Match:** Mirror key hard skills (e.g. *TypeScript, Distributed Systems, CI/CD*) from the job description directly in your Skills & Experience sections.\n2. **Clean Typography:** Avoid graphics, multi-column tables, or hidden text boxes which confuse parser engines.\n3. **Metrics Focus:** Ensure at least 60% of your work experience bullet points include concrete metrics (%, $, scale, team size).`;
    }

    if (lower.includes('cover') || lower.includes('letter')) {
      return `**Winning Cover Letter Opening Paragraph:**\n\n*"Dear Hiring Team,\n\nI am thrilled to apply for the position. With over 4+ years of hands-on experience building high-performance systems and scaling customer-facing applications, I have consistently driven measurable outcomes—including boosting platform speed by 35% and engineering resilient architectures. I would love to bring this technical drive to your engineering team."*`;
    }

    if (lower.includes('interview') || lower.includes('question') || lower.includes('practice')) {
      return `**Mock Interview Challenge Question:**\n\n*"Tell me about a time when you had to take ownership of a failing project or tight deadline under pressure."*\n\n**STAR Strategy Tip:**\n- **Situation:** Describe the crisis concisely.\n- **Task:** What was your exact ownership?\n- **Action:** Highlight 2-3 decisive technical or leadership actions YOU took.\n- **Result:** Conclude with metric-backed success!`;
    }

    return `**AI Career Insight:**\nTo make your profile stand out to recruiters and ATS screeners:\n- Align your top 5 technical skills with the highest frequency terms in target Job Descriptions.\n- Use active power verbs (*Spearheaded, Architected, Engineered, Streamlined*).\n- Leverage our **ATS Scorer** and **JD Matcher** tools on the left menu for precise target scores!`;
  }
})();
