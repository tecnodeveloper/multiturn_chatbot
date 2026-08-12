const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const artifactDir = '/home/rdev/.gemini/antigravity-ide/brain/961d54a7-179c-47c3-8863-f50dc79b2728/';
const tempDir = '/home/rdev/UniversityData/multiturn_chatbot/temp-files-agent/screenshots/';

function getBaseHTML(variantStyle) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8"/>
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; font-family: system-ui, -apple-system, sans-serif; }
        body { background: #07090e; color: #f3f4f6; display: flex; height: 100vh; width: 100vw; overflow: hidden; }

        /* Sidebar - VOXA 5 Icon Model */
        .sidebar {
          width: 280px;
          background: ${variantStyle.sidebarBg};
          border-right: 1px solid ${variantStyle.borderColor};
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
          border-bottom: 1px solid ${variantStyle.borderColor};
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

        .brand-logo {
          width: 28px;
          height: 22px;
        }

        .header-actions { display: flex; gap: 8px; color: #9ca3af; }

        .search-box {
          background: ${variantStyle.inputBg};
          border: 1px solid ${variantStyle.borderColor};
          border-radius: 12px;
          padding: 8px 12px;
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          color: #9ca3af;
        }

        .nav-section { display: flex; flex-direction: column; gap: 4px; }
        .section-title { font-size: 11px; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px; padding-left: 8px; }

        .nav-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 9px 12px;
          border-radius: 10px;
          font-size: 13px;
          font-weight: 500;
          color: #9ca3af;
          cursor: pointer;
          transition: all 0.2s;
        }

        .nav-item.active {
          background: ${variantStyle.activeNavBg};
          color: ${variantStyle.activeNavText};
          font-weight: 600;
          border: ${variantStyle.activeNavBorder || 'none'};
        }

        .chats-list { flex: 1; overflow-y: auto; display: flex; flex-direction: column; gap: 4px; }
        .chat-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px 12px;
          border-radius: 8px;
          font-size: 13px;
          color: #9ca3af;
        }
        .chat-item.selected {
          background: ${variantStyle.selectedChatBg};
          color: #ffffff;
        }

        .pro-banner {
          background: ${variantStyle.proBannerBg};
          border: 1px solid ${variantStyle.proBannerBorder};
          border-radius: 14px;
          padding: 12px;
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .pro-icon { width: 32px; height: 32px; border-radius: 8px; background: rgba(59, 130, 246, 0.2); display: flex; align-items: center; justify-content: center; color: #60a5fa; }

        .user-profile {
          display: flex;
          align-items: center;
          gap: 10px;
          padding-top: 12px;
          border-top: 1px solid ${variantStyle.borderColor};
        }
        .avatar { width: 32px; height: 32px; border-radius: 50%; background: #3b82f6; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 14px; }

        /* Main Chat Area */
        .main-chat { flex: 1; display: flex; flex-direction: column; background: ${variantStyle.mainBg}; }

        .chat-header {
          height: 60px;
          border-bottom: 1px solid ${variantStyle.borderColor};
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 15px;
          color: #ffffff;
        }

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
          font-size: 42px;
          font-weight: 800;
          letter-spacing: -1px;
          text-align: center;
        }
        .hero-title span { color: ${variantStyle.accentColor}; }

        .hero-subtitle {
          font-size: 18px;
          color: #9ca3af;
          margin-top: -12px;
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
          background: ${variantStyle.cardBg};
          border: 1px solid ${variantStyle.cardBorder};
          border-radius: 16px;
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          box-shadow: ${variantStyle.cardShadow || 'none'};
        }
        .card-icon { width: 36px; height: 36px; border-radius: 10px; background: rgba(255,255,255,0.05); display: flex; align-items: center; justify-content: center; }
        .card-label { font-size: 14px; font-weight: 600; color: #ffffff; }
        .card-sub { font-size: 12px; color: #6b7280; }

        .input-bar-container {
          padding: 24px 40px 32px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
        }
        .input-bar {
          max-width: 860px;
          width: 100%;
          background: ${variantStyle.inputBarBg};
          border: 1px solid ${variantStyle.inputBarBorder};
          border-radius: 18px;
          padding: 14px 18px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .input-placeholder { color: #6b7280; font-size: 14px; }
        .send-btn { width: 36px; height: 36px; border-radius: 10px; background: ${variantStyle.accentColor}; display: flex; align-items: center; justify-content: center; }

        .disclaimer { font-size: 11px; color: #4b5563; }
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
            ✏️ ⚙️
          </div>
        </div>

        <div class="search-box">
          🔍 Search...
        </div>

        <!-- 5 MAIN NAVIGATION ITEMS WITH 5 ICONS -->
        <div class="nav-section">
          <div class="section-title">Settings</div>
          <div class="nav-item">📁 My projects</div>
          <div class="nav-item active">💬 Chats</div>
          <div class="nav-item">⊞ Templates</div>
          <div class="nav-item">⚙️ Settings</div>
          <div class="nav-item">👥 Teams</div>
        </div>

        <!-- CHATS HISTORY LIST -->
        <div class="chats-list">
          <div class="section-title" style="margin-top: 8px;">Chats</div>
          <div class="chat-item">💬 Startup Name Generator</div>
          <div class="chat-item">💬 Weekend Project Ideas</div>
          <div class="chat-item">💬 Future of Tech</div>
          <div class="chat-item selected">💬 Pitch Deck Structure</div>
          <div class="chat-item">💬 AI Product Concepts</div>
        </div>

        <!-- PRO BANNER -->
        <div class="pro-banner">
          <div class="pro-icon">✦</div>
          <div>
            <div style="font-size: 12px; font-weight: bold; color: #fff;">Update the plan</div>
            <div style="font-size: 10px; color: #9ca3af;">Feel the power of AI</div>
          </div>
        </div>

        <!-- USER PROFILE -->
        <div class="user-profile">
          <div class="avatar">S</div>
          <div>
            <div style="font-size: 12px; font-weight: bold; color: #fff;">salman</div>
            <div style="font-size: 10px; color: #6b7280;">salman@gmail.com</div>
          </div>
        </div>
      </div>

      <!-- Main Chat Area -->
      <div class="main-chat">
        <!-- CENTER HEADER: NEW CHAT ONLY -->
        <div class="chat-header">
          New Chat
        </div>

        <!-- HERO CANVAS: NO LOGO TILE ABOVE HELLO -->
        <div class="chat-hero">
          <div>
            <div class="hero-title">Hello, <span>salman</span></div>
            <div class="hero-subtitle">How can I help you today?</div>
          </div>

          <div class="cards-grid">
            <div class="card">
              <div class="card-icon" style="color: #3b82f6;">📄</div>
              <div class="card-label">Summarize this document</div>
              <div class="card-sub">Click to try this prompt</div>
            </div>
            <div class="card">
              <div class="card-icon" style="color: #f97316;">🖊️</div>
              <div class="card-label">Help me write an email</div>
              <div class="card-sub">Click to try this prompt</div>
            </div>
            <div class="card">
              <div class="card-icon" style="color: #06b6d4;">💻</div>
              <div class="card-label">Generate React component</div>
              <div class="card-sub">Click to try this prompt</div>
            </div>
            <div class="card">
              <div class="card-icon" style="color: #22c55e;">💬</div>
              <div class="card-label">Explain this code</div>
              <div class="card-sub">Click to try this prompt</div>
            </div>
            <div class="card">
              <div class="card-icon" style="color: #a855f7;">💼</div>
              <div class="card-label">Create business proposal</div>
              <div class="card-sub">Click to try this prompt</div>
            </div>
            <div class="card">
              <div class="card-icon" style="color: #ef4444;">🐛</div>
              <div class="card-label">Fix bugs in my project</div>
              <div class="card-sub">Click to try this prompt</div>
            </div>
          </div>
        </div>

        <!-- INPUT BAR -->
        <div class="input-bar-container">
          <div class="input-bar">
            <div class="input-placeholder">📎 Message MultiTurn AI...</div>
            <div class="send-btn">➔</div>
          </div>
          <div class="disclaimer">MultiTurn AI can make mistakes. Consider checking important information.</div>
        </div>
      </div>
    </body>
    </html>
  `;
}

async function generateAllOptions() {
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }

  const browser = await chromium.launch({
    executablePath: '/usr/bin/chromium',
    headless: true,
    args: ['--no-sandbox']
  });

  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });

  // OPTION 1: Sleek Slate Dark (Minimalist & Clean)
  const opt1Style = {
    sidebarBg: '#0b0f19',
    borderColor: '#1e293b',
    inputBg: '#131b2e',
    activeNavBg: '#1e293b',
    activeNavText: '#60a5fa',
    selectedChatBg: '#1e293b',
    proBannerBg: 'rgba(30, 41, 59, 0.5)',
    proBannerBorder: '#334155',
    mainBg: '#070a12',
    accentColor: '#3b82f6',
    cardBg: '#0f172a',
    cardBorder: '#1e293b',
    inputBarBg: '#0f172a',
    inputBarBorder: '#1e293b'
  };

  // OPTION 2: Neon Cyan & Violet Glow Accent
  const opt2Style = {
    sidebarBg: '#080811',
    borderColor: 'rgba(168, 85, 247, 0.2)',
    inputBg: 'rgba(168, 85, 247, 0.05)',
    activeNavBg: 'linear-gradient(90deg, rgba(168, 85, 247, 0.2), rgba(59, 130, 246, 0.2))',
    activeNavText: '#c084fc',
    activeNavBorder: '1px solid rgba(168, 85, 247, 0.4)',
    selectedChatBg: 'rgba(168, 85, 247, 0.15)',
    proBannerBg: 'linear-gradient(135deg, rgba(168, 85, 247, 0.15), rgba(59, 130, 246, 0.15))',
    proBannerBorder: 'rgba(168, 85, 247, 0.3)',
    mainBg: '#05050a',
    accentColor: '#c084fc',
    cardBg: '#0d0d1a',
    cardBorder: 'rgba(168, 85, 247, 0.25)',
    cardShadow: '0 4px 20px rgba(168, 85, 247, 0.1)',
    inputBarBg: '#0d0d1a',
    inputBarBorder: 'rgba(168, 85, 247, 0.3)'
  };

  // OPTION 3: Modern Card-Based Glassmorphism
  const opt3Style = {
    sidebarBg: '#090d16',
    borderColor: '#1f293d',
    inputBg: '#111827',
    activeNavBg: '#2563eb',
    activeNavText: '#ffffff',
    selectedChatBg: '#1f293d',
    proBannerBg: 'rgba(37, 99, 235, 0.1)',
    proBannerBorder: 'rgba(37, 99, 235, 0.3)',
    mainBg: '#080c14',
    accentColor: '#38bdf8',
    cardBg: '#111827',
    cardBorder: '#1f293d',
    cardShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)',
    inputBarBg: '#111827',
    inputBarBorder: '#1f293d'
  };

  // OPTION 4: Premium Electric Blue & Rounded Pill Elements
  const opt4Style = {
    sidebarBg: '#06090e',
    borderColor: '#1a2333',
    inputBg: '#0d1522',
    activeNavBg: '#1d4ed8',
    activeNavText: '#ffffff',
    selectedChatBg: '#131e30',
    proBannerBg: 'linear-gradient(90deg, #1e3a8a, #1d4ed8)',
    proBannerBorder: '#2563eb',
    mainBg: '#04060a',
    accentColor: '#60a5fa',
    cardBg: '#0a101d',
    cardBorder: '#1e293b',
    inputBarBg: '#0a101d',
    inputBarBorder: '#2563eb'
  };

  const options = [
    { name: 'dashboard_option1_sleek_dark.png', style: opt1Style },
    { name: 'dashboard_option2_neon_glow.png', style: opt2Style },
    { name: 'dashboard_option3_card_grid.png', style: opt3Style },
    { name: 'dashboard_option4_electric_blue.png', style: opt4Style }
  ];

  for (const opt of options) {
    await page.setContent(getBaseHTML(opt.style));
    const targetPath = path.join(artifactDir, opt.name);
    const tempPath = path.join(tempDir, opt.name);

    await page.screenshot({ path: targetPath });
    fs.copyFileSync(targetPath, tempPath);
    console.log(`Rendered ${opt.name}`);
  }

  await browser.close();
}

generateAllOptions();
