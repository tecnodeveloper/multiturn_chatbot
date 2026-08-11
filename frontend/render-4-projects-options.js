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
        * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
        body { background: #070a12; color: #f3f4f6; display: flex; height: 100vh; width: 100vw; overflow: hidden; }

        /* Sidebar - Same Project Sidebar */
        .sidebar {
          width: 260px;
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
        }

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

        .user-profile {
          display: flex;
          align-items: center;
          gap: 10px;
          padding-top: 12px;
          border-top: 1px solid rgba(30, 41, 59, 0.5);
        }
        .avatar { width: 32px; height: 32px; border-radius: 50%; background: #2563eb; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 14px; color: #fff; }

        /* Main Content - Projects View */
        .main-chat { flex: 1; display: flex; flex-direction: column; background: ${variantStyle.mainBg}; }

        .chat-header {
          height: 60px;
          border-bottom: 1px solid ${variantStyle.borderColor};
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 32px;
        }

        .header-title { font-weight: 700; font-size: 15px; color: #ffffff; }

        .projects-container {
          flex: 1;
          padding: 40px 60px;
          max-width: 1000px;
          width: 100%;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 28px;
        }

        .projects-top-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .page-title {
          font-size: 32px;
          font-weight: 800;
          letter-spacing: -0.5px;
          color: #ffffff;
        }

        .search-action-group {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .proj-search-input {
          background: ${variantStyle.inputBg};
          border: 1px solid ${variantStyle.borderColor};
          border-radius: 12px;
          padding: 10px 16px;
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 13px;
          color: #94a3b8;
          width: 240px;
        }

        .new-proj-btn {
          background: ${variantStyle.btnBg};
          color: #ffffff;
          border-radius: 12px;
          padding: 10px 20px;
          font-size: 13px;
          font-weight: 600;
          border: none;
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          box-shadow: ${variantStyle.btnShadow || 'none'};
        }

        /* Filter Tabs */
        .filter-tabs {
          display: flex;
          align-items: center;
          gap: 8px;
          border-bottom: 1px solid ${variantStyle.borderColor};
          padding-bottom: 14px;
        }

        .tab-btn {
          padding: 8px 16px;
          border-radius: 10px;
          font-size: 13px;
          font-weight: 500;
          color: #94a3b8;
          cursor: pointer;
          background: transparent;
          border: none;
        }

        .tab-btn.active {
          background: ${variantStyle.activeTabBg};
          color: ${variantStyle.activeTabText};
          font-weight: 600;
          border: ${variantStyle.activeTabBorder || 'none'};
        }

        /* Table / List View */
        .projects-list-card {
          background: ${variantStyle.cardBg};
          border: 1px solid ${variantStyle.cardBorder};
          border-radius: 18px;
          overflow: hidden;
          box-shadow: ${variantStyle.cardShadow || 'none'};
        }

        .table-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px 24px;
          background: ${variantStyle.tableHeaderBg};
          border-bottom: 1px solid ${variantStyle.borderColor};
          font-size: 12px;
          font-weight: 600;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .project-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 24px;
          border-bottom: 1px solid ${variantStyle.borderColor};
          transition: background 0.2s;
        }
        .project-row:last-child { border-bottom: none; }
        .project-row:hover { background: ${variantStyle.rowHoverBg}; }

        .proj-name-col {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .proj-folder-icon {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          background: ${variantStyle.folderIconBg};
          border: 1px solid ${variantStyle.folderIconBorder};
          display: flex;
          align-items: center;
          justify-content: center;
          color: ${variantStyle.folderIconColor};
        }

        .proj-title { font-size: 14px; font-weight: 600; color: #f8fafc; }
        .proj-desc { font-size: 12px; color: #64748b; margin-top: 2px; }

        .proj-date-col {
          font-size: 13px;
          color: #94a3b8;
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .more-actions-btn {
          color: #64748b;
          font-weight: bold;
          cursor: pointer;
          padding: 4px 8px;
          border-radius: 6px;
        }
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
            ✏️ 📋
          </div>
        </div>

        <div class="search-box">🔍 Search</div>

        <div class="nav-section">
          <div class="section-title">Settings</div>
          <div class="nav-item active">📁 My projects</div>
          <div class="nav-item">💬 Chats</div>
          <div class="nav-item">⊞ Templates</div>
          <div class="nav-item">⚙️ Settings</div>
          <div class="nav-item">👥 Teams</div>
        </div>

        <div class="chats-list">
          <div class="section-title" style="margin-top: 8px;">Chats</div>
          <div class="chat-item">💬 Startup Name Generator</div>
          <div class="chat-item">💬 Weekend Project Ideas</div>
          <div class="chat-item">💬 Future of Tech</div>
          <div class="chat-item">💬 Pitch Deck Structure</div>
          <div class="chat-item">💬 AI Product Concepts</div>
        </div>

        <div class="user-profile">
          <div class="avatar">S</div>
          <div>
            <div style="font-size: 12px; font-weight: bold; color: #fff;">salman</div>
            <div style="font-size: 10px; color: #64748b;">salman@gmail.com</div>
          </div>
        </div>
      </div>

      <!-- Main Content Area: Projects -->
      <div class="main-chat">
        <div class="chat-header">
          <div class="header-title">Projects</div>
          <div style="color: #fbbf24;">☀️</div>
        </div>

        <div class="projects-container">
          <!-- Top Bar: Title + Search & New Button -->
          <div class="projects-top-bar">
            <h1 class="page-title">Projects</h1>
            <div class="search-action-group">
              <div class="proj-search-input">
                🔍 Search projects
              </div>
              <button class="new-proj-btn">
                <span>+</span> New
              </button>
            </div>
          </div>

          <!-- Filter Tabs -->
          <div class="filter-tabs">
            <button class="tab-btn active">All</button>
            <button class="tab-btn">Created by you</button>
            <button class="tab-btn">Shared with you</button>
          </div>

          <!-- Projects Table List -->
          <div class="projects-list-card">
            <div class="table-header">
              <span>Name</span>
              <span>Modified</span>
            </div>

            <div class="project-row">
              <div class="proj-name-col">
                <div class="proj-folder-icon">📁</div>
                <div>
                  <div class="proj-title">multiturn-ai chatbot</div>
                  <div class="proj-desc">Primary AI conversational interface project</div>
                </div>
              </div>
              <div class="proj-date-col">
                <span>Yesterday</span>
                <span class="more-actions-btn">•••</span>
              </div>
            </div>

            <div class="project-row">
              <div class="proj-name-col">
                <div class="proj-folder-icon">📁</div>
                <div>
                  <div class="proj-title">customer-support-agent</div>
                  <div class="proj-desc">Automated ticketing & response pipeline</div>
                </div>
              </div>
              <div class="proj-date-col">
                <span>3 days ago</span>
                <span class="more-actions-btn">•••</span>
              </div>
            </div>

            <div class="project-row">
              <div class="proj-name-col">
                <div class="proj-folder-icon">📁</div>
                <div>
                  <div class="proj-title">analytics-dashboard-v2</div>
                  <div class="proj-desc">Response latency & user feedback telemetry</div>
                </div>
              </div>
              <div class="proj-date-col">
                <span>1 week ago</span>
                <span class="more-actions-btn">•••</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
}

async function renderAllProjectsOptions() {
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }

  const browser = await chromium.launch({
    executablePath: '/usr/bin/chromium',
    headless: true,
    args: ['--no-sandbox']
  });

  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });

  // OPTION 1: Sleek Dark Slate Table (Exact Project Color Palette)
  const opt1Style = {
    mainBg: '#070a12',
    borderColor: 'rgba(30, 41, 59, 0.6)',
    inputBg: 'rgba(15, 23, 42, 0.6)',
    btnBg: '#2563eb',
    btnShadow: '0 4px 12px rgba(37, 99, 235, 0.3)',
    activeTabBg: 'rgba(30, 41, 59, 0.8)',
    activeTabText: '#ffffff',
    activeTabBorder: '1px solid rgba(51, 65, 85, 0.5)',
    cardBg: 'rgba(15, 23, 42, 0.6)',
    cardBorder: 'rgba(30, 41, 59, 0.8)',
    tableHeaderBg: 'rgba(11, 15, 25, 0.8)',
    rowHoverBg: 'rgba(30, 41, 59, 0.4)',
    folderIconBg: 'rgba(30, 41, 59, 0.8)',
    folderIconBorder: 'rgba(51, 65, 85, 0.6)',
    folderIconColor: '#60a5fa'
  };

  // OPTION 2: Modern Glowing Cards & Accent Badges
  const opt2Style = {
    mainBg: '#05070f',
    borderColor: 'rgba(37, 99, 235, 0.3)',
    inputBg: '#0b1120',
    btnBg: 'linear-gradient(90deg, #2563eb, #3b82f6)',
    btnShadow: '0 4px 20px rgba(59, 130, 246, 0.4)',
    activeTabBg: '#2563eb',
    activeTabText: '#ffffff',
    cardBg: '#0d1527',
    cardBorder: 'rgba(37, 99, 235, 0.25)',
    cardShadow: '0 10px 30px rgba(0,0,0,0.5)',
    tableHeaderBg: '#070d1a',
    rowHoverBg: '#131e36',
    folderIconBg: '#1e3a8a',
    folderIconBorder: '#3b82f6',
    folderIconColor: '#93c5fd'
  };

  // OPTION 3: Translucent Glassmorphism & Subtle Borders
  const opt3Style = {
    mainBg: '#090d16',
    borderColor: 'rgba(255, 255, 255, 0.08)',
    inputBg: 'rgba(255, 255, 255, 0.04)',
    btnBg: '#3b82f6',
    btnShadow: '0 4px 15px rgba(59, 130, 246, 0.3)',
    activeTabBg: 'rgba(255, 255, 255, 0.1)',
    activeTabText: '#ffffff',
    cardBg: 'rgba(17, 24, 39, 0.5)',
    cardBorder: 'rgba(255, 255, 255, 0.08)',
    tableHeaderBg: 'rgba(15, 23, 42, 0.4)',
    rowHoverBg: 'rgba(255, 255, 255, 0.05)',
    folderIconBg: 'rgba(59, 130, 246, 0.15)',
    folderIconBorder: 'rgba(59, 130, 246, 0.3)',
    folderIconColor: '#38bdf8'
  };

  // OPTION 4: High-Contrast Minimalist Blue Theme
  const opt4Style = {
    mainBg: '#04060a',
    borderColor: '#1e293b',
    inputBg: '#0f172a',
    btnBg: '#1d4ed8',
    activeTabBg: '#1e293b',
    activeTabText: '#60a5fa',
    activeTabBorder: '1px solid #3b82f6',
    cardBg: '#0f172a',
    cardBorder: '#1e293b',
    tableHeaderBg: '#090e17',
    rowHoverBg: '#1e293b',
    folderIconBg: '#1e293b',
    folderIconBorder: '#334155',
    folderIconColor: '#60a5fa'
  };

  const options = [
    { name: 'projects_option1_sleek_table.png', style: opt1Style },
    { name: 'projects_option2_glowing_cards.png', style: opt2Style },
    { name: 'projects_option3_glassmorphism.png', style: opt3Style },
    { name: 'projects_option4_high_contrast.png', style: opt4Style }
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

renderAllProjectsOptions();
