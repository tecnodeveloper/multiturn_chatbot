const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const artifactDir = '/home/rdev/.gemini/antigravity-ide/brain/961d54a7-179c-47c3-8863-f50dc79b2728/';
const tempDir = '/home/rdev/UniversityData/multiturn_chatbot/temp-files-agent/screenshots/';

const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
    body { background: #070a12; color: #f3f4f6; display: flex; height: 100vh; width: 100vw; overflow: hidden; }

    /* Sidebar - VOXA Refined */
    .sidebar {
      width: 280px;
      background: #080c14;
      border-right: 1px solid rgba(30, 41, 59, 0.6);
      display: flex;
      flex-direction: column;
      padding: 16px 12px;
      gap: 16px;
    }

    .sidebar-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding-bottom: 12px;
      border-bottom: 1px solid rgba(30, 41, 59, 0.5);
    }

    .brand {
      display: flex;
      align-items: center;
      gap: 8px;
      font-weight: 800;
      font-size: 16px;
      letter-spacing: -0.5px;
      color: #ffffff;
    }

    .brand-logo { width: 28px; height: 22px; }

    .header-actions { display: flex; gap: 6px; }
    .action-icon-btn {
      width: 32px;
      height: 32px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #94a3b8;
      cursor: pointer;
    }
    .action-icon-btn:hover { background: rgba(30, 41, 59, 0.6); color: #ffffff; }

    .search-box {
      background: rgba(15, 23, 42, 0.6);
      border: 1px solid rgba(30, 41, 59, 0.8);
      border-radius: 12px;
      padding: 8px 12px;
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 13px;
      color: #64748b;
    }

    .nav-section { display: flex; flex-direction: column; gap: 4px; }
    .section-title { font-size: 11px; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px; padding-left: 8px; }

    .nav-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 9px 12px;
      border-radius: 10px;
      font-size: 13px;
      font-weight: 500;
      color: #94a3b8;
      cursor: pointer;
      transition: all 0.2s;
    }

    .nav-item.active {
      background: rgba(30, 41, 59, 0.8);
      color: #ffffff;
      font-weight: 600;
      border: 1px solid rgba(51, 65, 85, 0.5);
    }

    .chats-list { flex: 1; overflow-y: auto; display: flex; flex-direction: column; gap: 4px; }
    
    .chat-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 8px 12px;
      border-radius: 10px;
      font-size: 13px;
      color: #94a3b8;
    }
    
    .chat-item.selected {
      background: rgba(30, 41, 59, 0.8);
      color: #ffffff;
      font-weight: 600;
      border: 1px solid rgba(51, 65, 85, 0.4);
    }

    .three-dots-btn {
      width: 24px;
      height: 24px;
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #cbd5e1;
      cursor: pointer;
      font-weight: bold;
    }

    .user-profile {
      display: flex;
      align-items: center;
      gap: 10px;
      padding-top: 12px;
      border-top: 1px solid rgba(30, 41, 59, 0.5);
    }
    .avatar { width: 32px; height: 32px; border-radius: 50%; background: #2563eb; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 14px; color: #fff; }

    /* Main Chat Area */
    .main-chat { flex: 1; display: flex; flex-direction: column; background: #070a12; }

    /* Main Header with Top Right Corner Controls (Above Send Button) */
    .chat-header {
      height: 60px;
      border-bottom: 1px solid rgba(30, 41, 59, 0.6);
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 24px;
      background: #070a12;
      position: relative;
    }

    .header-center-title {
      position: absolute;
      left: 50%;
      transform: translateX(-50%);
      font-weight: 700;
      font-size: 15px;
      color: #ffffff;
    }

    .header-right-corner {
      margin-left: auto;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .theme-toggle-btn {
      width: 34px;
      height: 34px;
      border-radius: 9px;
      background: rgba(30, 41, 59, 0.5);
      border: 1px solid rgba(51, 65, 85, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fbbf24;
      cursor: pointer;
      transition: all 0.2s;
    }
    .theme-toggle-btn:hover { background: rgba(51, 65, 85, 0.6); color: #ffffff; }

    .chat-hero {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 40px;
      gap: 24px;
    }

    .hero-title {
      font-size: 44px;
      font-weight: 800;
      letter-spacing: -1px;
      text-align: center;
      color: #ffffff;
    }
    .hero-title span {
      background: linear-gradient(90deg, #60a5fa, #38bdf8);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .hero-subtitle {
      font-size: 18px;
      color: #94a3b8;
      margin-top: 6px;
      text-align: center;
    }

    .cards-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
      max-width: 860px;
      width: 100%;
      margin-top: 16px;
    }

    .card {
      background: rgba(15, 23, 42, 0.6);
      border: 1px solid rgba(30, 41, 59, 0.8);
      border-radius: 16px;
      padding: 20px;
      display: flex;
      flex-direction: column;
      gap: 12px;
      cursor: pointer;
      transition: all 0.2s;
    }
    .card-icon { width: 40px; height: 40px; border-radius: 12px; background: rgba(30, 41, 59, 0.8); display: flex; align-items: center; justify-content: center; font-size: 18px; }
    .card-label { font-size: 14px; font-weight: 600; color: #f8fafc; }
    .card-sub { font-size: 12px; color: #64748b; }

    /* Input Area - Send Button Outside Input Box with Paper Plane Arrow */
    .input-bar-container {
      padding: 24px 40px 32px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 10px;
    }

    .input-wrapper {
      max-width: 860px;
      width: 100%;
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .input-box {
      flex: 1;
      background: rgba(15, 23, 42, 0.6);
      border: 1px solid rgba(30, 41, 59, 0.8);
      border-radius: 16px;
      padding: 14px 18px;
      display: flex;
      align-items: center;
      gap: 12px;
      color: #94a3b8;
      font-size: 14px;
    }

    .send-btn-outside {
      width: 48px;
      height: 48px;
      border-radius: 14px;
      background: #2563eb;
      color: #ffffff;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
    }

    .disclaimer { font-size: 11px; color: #475569; }
  </style>
</head>
<body>
  <!-- Sidebar -->
  <div class="sidebar">
    <div class="sidebar-header">
      <div class="brand">
        <svg class="brand-logo" viewBox="0 0 62 48" fill="none" stroke="#3B82F6" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"><path d="M8 36V22a7 7 0 0 1 14 0v14"/><path d="M22 22a7 7 0 0 1 14 0v14"/><path d="M48 12v24"/><path d="M42 30h12"/></svg>
        MultiTurn AI
      </div>
      
      <div class="header-actions">
        <div class="action-icon-btn" title="New Chat">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
        </div>
        <div class="action-icon-btn" title="Toggle Sidebar">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="9" y1="3" x2="9" y2="21"/></svg>
        </div>
      </div>
    </div>

    <div class="search-box">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
      Search
    </div>

    <!-- 5 MAIN NAVIGATION ITEMS WITH 5 ICONS -->
    <div class="nav-section">
      <div class="section-title">Settings</div>
      <div class="nav-item">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
        My projects
      </div>
      <div class="nav-item active">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
        Chats
      </div>
      <div class="nav-item">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
        Templates
      </div>
      <div class="nav-item">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
        Settings
      </div>
      <div class="nav-item">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
        Teams
      </div>
    </div>

    <!-- CHATS HISTORY LIST -->
    <div class="chats-list">
      <div class="section-title" style="margin-top: 8px;">Chats</div>
      <div class="chat-item">
        <span style="display: flex; align-items: center; gap: 8px;">💬 Startup Name Generator</span>
      </div>
      <div class="chat-item">
        <span style="display: flex; align-items: center; gap: 8px;">💬 Weekend Project Ideas</span>
      </div>
      <div class="chat-item">
        <span style="display: flex; align-items: center; gap: 8px;">💬 Future of Tech</span>
      </div>
      
      <!-- Selected Chat with 3-Dots Button Options -->
      <div class="chat-item selected">
        <span style="display: flex; align-items: center; gap: 8px;">💬 Pitch Deck Structure</span>
        <div class="three-dots-btn">•••</div>
      </div>
      
      <div class="chat-item">
        <span style="display: flex; align-items: center; gap: 8px;">💬 AI Product Concepts</span>
      </div>
    </div>

    <!-- USER PROFILE (No "Update the plan" banner) -->
    <div class="user-profile">
      <div class="avatar">S</div>
      <div>
        <div style="font-size: 12px; font-weight: bold; color: #fff;">salman</div>
        <div style="font-size: 10px; color: #64748b;">salman@gmail.com</div>
      </div>
    </div>
  </div>

  <!-- Main Chat Area -->
  <div class="main-chat">
    <!-- MAIN HEADER: CENTERED NEW CHAT & TOP RIGHT CORNER CONTROLS (ABOVE SEND ICON AREA) -->
    <div class="chat-header">
      <div></div>

      <div class="header-center-title">
        New Chat
      </div>

      <div class="header-right-corner">
        <div class="theme-toggle-btn" title="Toggle Light/Dark Mode">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
        </div>
      </div>
    </div>

    <!-- HERO CANVAS: NO LOGO TILE ABOVE HELLO -->
    <div class="chat-hero">
      <div>
        <div class="hero-title">Hello, <span>salman</span></div>
        <div class="hero-subtitle">How can I help you today?</div>
      </div>

      <div class="cards-grid">
        <div class="card">
          <div class="card-icon" style="color: #60a5fa;">📄</div>
          <div class="card-label">Summarize this document</div>
          <div class="card-sub">Click to try this prompt</div>
        </div>
        <div class="card">
          <div class="card-icon" style="color: #fb923c;">🖊️</div>
          <div class="card-label">Help me write an email</div>
          <div class="card-sub">Click to try this prompt</div>
        </div>
        <div class="card">
          <div class="card-icon" style="color: #22d3ee;">💻</div>
          <div class="card-label">Generate React component</div>
          <div class="card-sub">Click to try this prompt</div>
        </div>
        <div class="card">
          <div class="card-icon" style="color: #4ade80;">💬</div>
          <div class="card-label">Explain this code</div>
          <div class="card-sub">Click to try this prompt</div>
        </div>
        <div class="card">
          <div class="card-icon" style="color: #c084fc;">💼</div>
          <div class="card-label">Create business proposal</div>
          <div class="card-sub">Click to try this prompt</div>
        </div>
        <div class="card">
          <div class="card-icon" style="color: #f87171;">🐛</div>
          <div class="card-label">Fix bugs in my project</div>
          <div class="card-sub">Click to try this prompt</div>
        </div>
      </div>
    </div>

    <!-- INPUT BAR - SEND BUTTON OUTSIDE INPUT BOX WITH PAPER PLANE ARROW -->
    <div class="input-bar-container">
      <div class="input-wrapper">
        <div class="input-box">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>
          <span>Message MultiTurn AI...</span>
        </div>
        <div class="send-btn-outside" title="Send Message">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
        </div>
      </div>
      <div class="disclaimer">MultiTurn AI can make mistakes. Consider checking important information.</div>
    </div>
  </div>
</body>
</html>
`;

async function renderOption1Refined() {
  const browser = await chromium.launch({
    executablePath: '/usr/bin/chromium',
    headless: true,
    args: ['--no-sandbox']
  });

  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  await page.setContent(htmlContent);

  const targetPath = path.join(artifactDir, 'dashboard_option1_refined.png');
  const tempPath = path.join(tempDir, 'dashboard_option1_refined.png');

  await page.screenshot({ path: targetPath });
  fs.copyFileSync(targetPath, tempPath);
  console.log("Rendered dashboard_option1_refined.png with Top Right Corner Controls!");

  await browser.close();
}

renderOption1Refined();
