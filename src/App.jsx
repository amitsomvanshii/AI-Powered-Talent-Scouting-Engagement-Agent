import React, { useState, useEffect, useRef } from 'react'
import { 
  Users, 
  FileText, 
  MessageSquare, 
  Award, 
  Search, 
  ChevronRight,
  TrendingUp,
  BrainCircuit,
  Filter,
  CheckCircle,
  Clock,
  Send,
  X,
  Target,
  Zap,
  ShieldCheck,
  ExternalLink
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { parseJD, scoreCandidates, simulateChat, calculateInterest } from './logic/engine'

// --- Components ---

const SidebarItem = ({ icon: Icon, label, active, onClick }) => (
  <motion.div 
    whileHover={{ x: 4 }}
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    className={`sidebar-item ${active ? 'active' : ''}`}
  >
    <Icon size={20} />
    <span>{label}</span>
  </motion.div>
)

const Header = () => (
  <header className="main-header glass-panel">
    <div className="logo-section">
      <div className="logo-icon">
        <BrainCircuit size={24} />
      </div>
      <h1 className="gradient-text">ScoutAI</h1>
    </div>
    <div className="header-actions">
      <div className="search-bar glass-card">
        <Search size={16} />
        <input type="text" placeholder="Search talent..." />
      </div>
      <div className="user-profile">
        <div className="status-indicator"></div>
        <div className="profile-img">AS</div>
      </div>
    </div>
  </header>
)

const ChatSimulation = ({ candidate, onClose, onFinish }) => {
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const hasStarted = useRef(false);

  useEffect(() => {
    if (hasStarted.current) return;
    hasStarted.current = true;

    const startChat = async () => {
      const fullLog = await simulateChat(candidate.name, candidate.role);
      
      const playStep = (i) => {
        if (i >= fullLog.length) {
          const interest = calculateInterest(fullLog);
          onFinish(interest);
          return;
        }

        setIsTyping(true);
        setTimeout(() => {
          setIsTyping(false);
          setMessages(prev => [...prev, fullLog[i]]);
          setTimeout(() => playStep(i + 1), 1500);
        }, 1000);
      };

      playStep(0);
    };

    startChat();
  }, []);

  return (
    <div className="modal-overlay">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="chat-modal glass-panel"
      >
        <div className="modal-header">
          <div className="candidate-info">
            <div className="avatar">{candidate.name[0]}</div>
            <div>
              <h3>Chatting with {candidate.name}</h3>
              <p>AI Engagement Agent #042</p>
            </div>
          </div>
          <button onClick={onClose} className="close-btn"><X size={20} /></button>
        </div>
        
        <div className="chat-body">
          <AnimatePresence>
            {messages.map((msg, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, x: msg.sender === 'AI' ? -10 : 10 }}
                animate={{ opacity: 1, x: 0 }}
                className={`message ${msg.sender.toLowerCase()}`}
              >
                <div className="message-bubble">{msg.text}</div>
              </motion.div>
            ))}
            {isTyping && (
              <motion.div className="message ai">
                <div className="message-bubble typing">...</div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="chat-footer">
          <div className="ai-status">
            <Zap size={14} className="pulse" /> AI is analyzing candidate sentiment...
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// --- Main App ---

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [jdText, setJdText] = useState('');
  const [isParsing, setIsParsing] = useState(false);
  const [candidates, setCandidates] = useState([]);
  const [missions, setMissions] = useState([
    { id: 'm1', role: 'Senior React Developer', discovered: 4, engaged: 1, status: 'Active', date: 'Oct 24' }
  ]);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [showChat, setShowChat] = useState(false);

  const [discoveryLogs, setDiscoveryLogs] = useState([]);

  const handleParse = () => {
    if (!jdText.trim()) return;
    setIsParsing(true);
    setDiscoveryLogs(["Initializing ScoutAI Agent...", "Analyzing JD Requirements..."]);
    
    setTimeout(() => setDiscoveryLogs(prev => [...prev, "Scanning LinkedIn for matches..."]), 500);
    setTimeout(() => setDiscoveryLogs(prev => [...prev, "Scraping GitHub for technical contributions..."]), 1000);
    setTimeout(() => setDiscoveryLogs(prev => [...prev, "Verifying credentials on Indeed..."]), 1500);

    setTimeout(() => {
      const parsed = parseJD(jdText);
      const scored = scoreCandidates(parsed);
      setCandidates(scored);
      
      // Save mission to history
      const newMission = {
        id: Date.now().toString(),
        role: parsed.role || 'Software Engineer',
        jdText: jdText, // Store original JD
        discovered: scored.length,
        engaged: 0,
        status: 'Complete',
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      };
      setMissions(prev => [newMission, ...prev]);

      setIsParsing(false);
      setDiscoveryLogs([]);
      setActiveTab('candidates');
    }, 2500);
  };

  const handleSelectMission = (mission) => {
    setJdText(mission.jdText || '');
    const parsed = parseJD(mission.jdText || '');
    const scored = scoreCandidates(parsed);
    setCandidates(scored);
    setActiveTab('candidates');
  };

  const startEngagement = (candidate) => {
    setSelectedCandidate(candidate);
    setShowChat(true);
  };

  const handleChatFinish = (interestScore) => {
    setTimeout(() => {
      setCandidates(prev => prev.map(c => 
        c.id === selectedCandidate.id 
          ? { ...c, interestScore, status: 'engaged' } 
          : c
      ));
      setShowChat(false);
    }, 2000);
  };

  return (
    <div className="app-container">
      <aside className="sidebar glass-panel">
        <div className="sidebar-brand">
          <BrainCircuit size={28} className="logo-icon" />
          <span>ScoutAI</span>
        </div>
        <nav className="sidebar-nav">
          <SidebarItem 
            icon={TrendingUp} 
            label="Overview" 
            active={activeTab === 'dashboard'} 
            onClick={() => setActiveTab('dashboard')} 
          />
          <SidebarItem 
            icon={FileText} 
            label="Scouting Missions" 
            active={activeTab === 'jd'} 
            onClick={() => setActiveTab('jd')} 
          />
          <SidebarItem 
            icon={Users} 
            label="Candidate Pool" 
            active={activeTab === 'candidates'} 
            onClick={() => setActiveTab('candidates')} 
          />
          <SidebarItem 
            icon={Target} 
            label="Shortlist" 
            active={activeTab === 'shortlist'} 
            onClick={() => setActiveTab('shortlist')} 
          />
        </nav>
        
        <div className="sidebar-footer">
          <div className="quota-card glass-card">
            <div className="quota-header">
              <span>Token Usage</span>
              <span>74%</span>
            </div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: '74%' }}></div>
            </div>
          </div>
        </div>
      </aside>

      <main className="content">
        <Header />
        
        <div className="view-container">
          <AnimatePresence mode="wait">
            {activeTab === 'dashboard' && (
              <motion.div 
                key="dashboard"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="dashboard-view"
              >
                <div className="dashboard-grid">
                  <section className="welcome-banner glass-panel col-span-2">
                    <div className="banner-content">
                      <h2>Intelligent Scouting</h2>
                      <p>Leverage AI to discover, match, and engage top-tier talent automatically.</p>
                      <div className="banner-actions">
                        <button className="btn-primary" onClick={() => setActiveTab('jd')}>
                          <Zap size={18} /> New Mission
                        </button>
                        <button className="btn-secondary">View Analytics</button>
                      </div>
                    </div>
                    <div className="banner-illustration">
                      <div className="orb pulse"></div>
                    </div>
                  </section>

                  <div className="glass-card stat-card highlight">
                    <div className="icon-box"><Target size={20} /></div>
                    <span className="stat-label">Discovery Match</span>
                    <span className="stat-value">
                      {candidates.length > 0 ? `${Math.round(candidates.reduce((acc, c) => acc + c.matchScore, 0) / candidates.length)}%` : '94%'}
                    </span>
                    <span className="stat-trend positive">+5.4% this month</span>
                  </div>

                  <div className="glass-card stat-card">
                    <div className="icon-box"><Users size={20} /></div>
                    <span className="stat-label">Talent Network</span>
                    <span className="stat-value">1.2k+</span>
                    <span className="stat-trend">Global Reach</span>
                  </div>

                  <div className="glass-card stat-card">
                    <div className="icon-box"><MessageSquare size={20} /></div>
                    <span className="stat-label">Active Engagements</span>
                    <span className="stat-value">{candidates.filter(c => c.status === 'engaged').length}</span>
                    <span className="stat-trend">Ready to interview</span>
                  </div>
                </div>

                <section className="recent-activity">
                  <h3>Recent Missions</h3>
                  <div className="activity-list">
                    {missions.map(mission => (
                      <div 
                        key={mission.id} 
                        className="glass-card activity-item clickable"
                        onClick={() => handleSelectMission(mission)}
                      >
                        <div className="activity-icon"><FileText size={18} /></div>
                        <div className="activity-info">
                          <h4>{mission.role}</h4>
                          <p>{mission.discovered} candidates discovered • {mission.engaged} engaged</p>
                        </div>
                        <div className="activity-status">
                          <span className={`status-tag ${mission.status === 'Active' ? 'pulse' : ''}`}>
                            {mission.status}
                          </span>
                        </div>
                        <ChevronRight size={18} className="chevron" />
                      </div>
                    ))}
                  </div>
                </section>
              </motion.div>
            )}

            {activeTab === 'jd' && (
              <motion.div 
                key="jd"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="jd-view"
              >
                <div className="view-header">
                  <h2>New Scouting Mission</h2>
                  <p>Paste a job description to begin the autonomous scouting cycle.</p>
                </div>
                
                <div className="glass-panel input-container">
                  <div className="input-header">
                    <ShieldCheck size={16} /> <span>JD Analyzer Active</span>
                  </div>
                  <textarea 
                    placeholder="E.g. We are looking for a Senior React Developer with 5+ years of experience in..."
                    className="jd-textarea"
                    value={jdText}
                    onChange={(e) => setJdText(e.target.value)}
                  />
                  
                  {isParsing && (
                    <div className="discovery-logs glass-card">
                      {discoveryLogs.map((log, i) => (
                        <motion.div 
                          key={i}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="log-entry"
                        >
                          <Zap size={12} className="pulse" /> {log}
                        </motion.div>
                      ))}
                      <div className="loader-line"></div>
                    </div>
                  )}

                  <div className="input-footer">
                    <div className="hints">
                      <span>Pro tip: Mention specific technologies for better matching.</span>
                    </div>
                    <button 
                      className={`btn-primary ${isParsing ? 'loading' : ''}`} 
                      onClick={handleParse}
                      disabled={isParsing || !jdText.trim()}
                    >
                      {isParsing ? (
                        <>Parsing JD...</>
                      ) : (
                        <><BrainCircuit size={18} /> Initiate Scouting</>
                      )}
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'candidates' && (
              <motion.div 
                key="candidates"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="candidates-view"
              >
                <div className="view-header">
                  <div className="header-left">
                    <h2>Scouting Results</h2>
                    <p>{candidates.length} potential matches discovered from global sources.</p>
                  </div>
                  <div className="header-actions">
                    <button className="glass-card icon-btn"><Filter size={18} /></button>
                    <button className="btn-primary" onClick={() => setActiveTab('shortlist')}>View Shortlist</button>
                  </div>
                </div>
                
                <div className="candidate-grid">
                  {candidates.map((candidate, i) => (
                    <motion.div 
                      key={candidate.id} 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="glass-card candidate-card"
                    >
                      <div className="card-top">
                        <div className="avatar-wrapper">
                          <div className="avatar">{candidate.name[0]}</div>
                          <div className="match-ring" style={{'--score': `${candidate.matchScore}%`}}></div>
                        </div>
                        <div className="candidate-meta">
                          <h3>{candidate.name}</h3>
                          <p>{candidate.role} • {candidate.experience}</p>
                        </div>
                        <div className="score-badge">
                          <span className="label">Match</span>
                          <span className="value">{candidate.matchScore}%</span>
                        </div>
                      </div>

                      <div className="card-content">
                        <div className="match-analysis">
                          <h4>AI Analysis</h4>
                          <ul>
                            {candidate.matchReasons.slice(0, 2).map((r, idx) => (
                              <li key={idx}><CheckCircle size={14} /> {r}</li>
                            ))}
                          </ul>
                        </div>
                        <div className="skills-row">
                          {candidate.skills.slice(0, 4).map(s => <span key={s} className="skill-tag">{s}</span>)}
                          {candidate.skills.length > 4 && <span className="skill-tag plus">+{candidate.skills.length - 4}</span>}
                        </div>
                      </div>

                      <div className="card-actions">
                        {candidate.status === 'engaged' ? (
                          <div className="engagement-status">
                            <span className="interest-label">Interest Score:</span>
                            <span className="interest-value">{candidate.interestScore}%</span>
                          </div>
                        ) : (
                          <button className="btn-primary full-width" onClick={() => startEngagement(candidate)}>
                            <MessageSquare size={16} /> Engage Candidate
                          </button>
                        )}
                        <button 
                          className="btn-secondary icon-only" 
                          onClick={() => window.open(candidate.profileUrl, '_blank')}
                          title="Open LinkedIn Profile"
                        >
                          <ExternalLink size={16} />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === 'shortlist' && (
              <motion.div 
                key="shortlist"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="shortlist-view"
              >
                <div className="view-header">
                  <h2>Ranked Shortlist</h2>
                  <p>Candidates sorted by combined Match and Interest scores.</p>
                </div>

                <div className="glass-panel shortlist-table-container">
                  <table className="shortlist-table">
                    <thead>
                      <tr>
                        <th>Candidate</th>
                        <th>Match Score</th>
                        <th>Interest Score</th>
                        <th>Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {candidates
                        .filter(c => c.status === 'engaged')
                        .sort((a, b) => (b.matchScore + b.interestScore) - (a.matchScore + a.interestScore))
                        .map(c => (
                          <tr key={c.id}>
                            <td>
                              <div className="table-user">
                                <div className="avatar-sm">{c.name[0]}</div>
                                <div>
                                  <div className="name">{c.name}</div>
                                  <div className="role">{c.role}</div>
                                </div>
                              </div>
                            </td>
                            <td>
                              <div className="score-pill match">{c.matchScore}%</div>
                            </td>
                            <td>
                              <div className="score-pill interest">{c.interestScore}%</div>
                            </td>
                            <td>
                              <span className="status-pill ready">Ready for Interview</span>
                            </td>
                            <td>
                              <div className="table-actions">
                                <button className="btn-primary btn-sm">Invite</button>
                                <button 
                                  className="btn-secondary btn-sm icon-only" 
                                  onClick={() => window.open(c.profileUrl, '_blank')}
                                >
                                  <ExternalLink size={14} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                  {candidates.filter(c => c.status === 'engaged').length === 0 && (
                    <div className="empty-state">
                      <p>No candidates have been engaged yet. Go to the Candidate Pool to initiate outreach.</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      <AnimatePresence>
        {showChat && (
          <ChatSimulation 
            candidate={selectedCandidate} 
            onClose={() => setShowChat(false)}
            onFinish={handleChatFinish}
          />
        )}
      </AnimatePresence>

      <style>{`
        /* Enhanced App Styles */
        .app-container {
          display: flex;
          min-height: 100vh;
          background: var(--bg-deep);
          color: var(--text-main);
          padding: 1rem;
          gap: 1rem;
        }

        /* Sidebar */
        .sidebar {
          width: 280px;
          display: flex;
          flex-direction: column;
          padding: 1.5rem;
          position: sticky;
          top: 1rem;
          height: calc(100vh - 2rem);
        }

        .sidebar-brand {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 2.5rem;
          font-weight: 800;
          font-size: 1.5rem;
          color: var(--text-main);
        }

        .logo-icon {
          color: var(--accent-primary);
        }

        .sidebar-nav {
          display: flex;
          flex-direction: column;
          gap: 4px;
          flex: 1;
        }

        .sidebar-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          border-radius: 12px;
          cursor: pointer;
          color: var(--text-muted);
          font-weight: 500;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .sidebar-item:hover {
          color: var(--text-main);
          background: hsla(230, 25%, 20%, 0.5);
        }

        .sidebar-item.active {
          color: var(--accent-primary);
          background: hsla(260, 80%, 65%, 0.1);
          box-shadow: inset 0 0 0 1px hsla(260, 80%, 65%, 0.2);
        }

        .sidebar-footer {
          margin-top: auto;
        }

        .quota-card {
          padding: 1rem;
          font-size: 0.8rem;
        }

        .quota-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
          color: var(--text-muted);
        }

        .progress-bar {
          height: 6px;
          background: rgba(255,255,255,0.05);
          border-radius: 3px;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, var(--accent-primary), var(--accent-secondary));
        }

        /* Content Area */
        .content {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 1rem;
          min-width: 0;
        }

        .main-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.75rem 1.5rem;
          height: 64px;
        }

        .header-actions {
          display: flex;
          align-items: center;
          gap: 1.5rem;
        }

        .search-bar {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 6px 12px;
          width: 300px;
        }

        .search-bar input {
          background: none;
          border: none;
          color: var(--text-main);
          outline: none;
          width: 100%;
          font-size: 0.9rem;
        }

        .user-profile {
          display: flex;
          align-items: center;
          gap: 10px;
          position: relative;
        }

        .status-indicator {
          width: 8px;
          height: 8px;
          background: var(--accent-success);
          border-radius: 50%;
          position: absolute;
          bottom: 0;
          right: 0;
          border: 2px solid var(--bg-surface);
        }

        .profile-img {
          width: 36px;
          height: 36px;
          background: var(--accent-primary);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 0.8rem;
        }

        /* Dashboard */
        .dashboard-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .col-span-2 { grid-column: span 2; }

        .welcome-banner {
          display: flex;
          justify-content: space-between;
          padding: 3rem;
          overflow: hidden;
          position: relative;
        }

        .banner-content {
          max-width: 60%;
          display: flex;
          flex-direction: column;
          gap: 1rem;
          z-index: 1;
        }

        .banner-content h2 {
          font-size: 2.8rem;
          line-height: 1.1;
          letter-spacing: -0.02em;
        }

        .banner-actions {
          display: flex;
          gap: 1rem;
          margin-top: 1rem;
        }

        .banner-illustration {
          position: absolute;
          right: -50px;
          top: -50px;
          width: 300px;
          height: 300px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .orb {
          width: 200px;
          height: 200px;
          background: radial-gradient(circle, var(--accent-primary), transparent 70%);
          filter: blur(40px);
          opacity: 0.3;
        }

        .stat-card {
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          position: relative;
        }

        .stat-card.highlight {
          border-color: hsla(260, 80%, 65%, 0.3);
        }

        .icon-box {
          width: 40px;
          height: 40px;
          background: hsla(260, 80%, 65%, 0.1);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--accent-primary);
          margin-bottom: 10px;
        }

        .stat-label { color: var(--text-muted); font-size: 0.9rem; }
        .stat-value { font-size: 2rem; font-weight: 800; }
        .stat-trend { font-size: 0.75rem; color: var(--text-dim); }
        .stat-trend.positive { color: var(--accent-success); }

        /* JD View */
        .input-container {
          padding: 2rem;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .input-header {
          display: flex;
          align-items: center;
          gap: 8px;
          color: var(--accent-secondary);
          font-size: 0.9rem;
          font-weight: 600;
        }

        .jd-textarea {
          width: 100%;
          height: 350px;
          background: rgba(0,0,0,0.2);
          border: 1px solid var(--glass-border);
          border-radius: 16px;
          padding: 2rem;
          color: var(--text-main);
          font-family: inherit;
          font-size: 1.1rem;
          resize: none;
          transition: border-color 0.3s ease;
        }

        .jd-textarea:focus {
          outline: none;
          border-color: var(--accent-primary);
        }

        .input-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .hints { color: var(--text-dim); font-size: 0.85rem; }

        /* Candidate Grid */
        .candidate-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 1.5rem;
          margin-top: 1.5rem;
        }

        .candidate-card {
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .card-top {
          display: flex;
          align-items: flex-start;
          gap: 1rem;
        }

        .avatar-wrapper {
          position: relative;
          width: 56px;
          height: 56px;
        }

        .avatar {
          width: 56px;
          height: 56px;
          background: var(--accent-primary);
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.2rem;
          font-weight: 700;
        }

        .match-ring {
          position: absolute;
          inset: -4px;
          border-radius: 18px;
          border: 2px solid transparent;
          border-top-color: var(--accent-primary);
          transform: rotate(calc(var(--score) * 3.6deg));
        }

        .candidate-meta h3 { font-size: 1.1rem; margin-bottom: 2px; }
        .candidate-meta p { color: var(--text-muted); font-size: 0.85rem; }

        .score-badge {
          margin-left: auto;
          display: flex;
          flex-direction: column;
          align-items: flex-end;
        }

        .score-badge .label { font-size: 0.65rem; text-transform: uppercase; color: var(--text-dim); }
        .score-badge .value { font-size: 1.2rem; font-weight: 800; color: var(--accent-primary); }

        .match-analysis {
          background: rgba(255,255,255,0.03);
          padding: 1rem;
          border-radius: 10px;
          margin-bottom: 1rem;
        }

        .match-analysis h4 { font-size: 0.8rem; color: var(--text-muted); margin-bottom: 8px; }
        .match-analysis ul { list-style: none; display: flex; flex-direction: column; gap: 6px; }
        .match-analysis li { font-size: 0.8rem; display: flex; gap: 8px; line-height: 1.3; }
        .match-analysis li svg { color: var(--accent-success); flex-shrink: 0; }

        .skills-row { display: flex; gap: 6px; flex-wrap: wrap; }
        .skill-tag {
          background: rgba(255,255,255,0.06);
          padding: 4px 10px;
          border-radius: 6px;
          font-size: 0.75rem;
          color: var(--text-muted);
        }

        .card-actions { display: flex; gap: 10px; margin-top: auto; }
        .full-width { flex: 1; }
        
        .icon-only {
          padding: 8px !important;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .table-actions {
          display: flex;
          gap: 8px;
          align-items: center;
        }

        .btn-sm {
          padding: 4px 8px !important;
          font-size: 0.75rem !important;
        }

        /* Chat Modal */
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.8);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 1rem;
        }

        .chat-modal {
          width: 100%;
          max-width: 500px;
          height: 600px;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .modal-header {
          padding: 1.5rem;
          border-bottom: 1px solid var(--glass-border);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .candidate-info { display: flex; gap: 12px; align-items: center; }
        .candidate-info h3 { font-size: 1rem; }
        .candidate-info p { font-size: 0.75rem; color: var(--accent-secondary); }

        .chat-body {
          flex: 1;
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
          overflow-y: auto;
        }

        .message { display: flex; }
        .message.ai { justify-content: flex-start; }
        .message.candidate { justify-content: flex-end; }

        .message-bubble {
          max-width: 80%;
          padding: 12px 16px;
          border-radius: 16px;
          font-size: 0.9rem;
          line-height: 1.4;
        }

        .message.ai .message-bubble {
          background: hsla(230, 25%, 20%, 0.8);
          border-bottom-left-radius: 4px;
        }

        .message.candidate .message-bubble {
          background: var(--accent-primary);
          color: white;
          border-bottom-right-radius: 4px;
        }

        .typing { font-weight: 800; letter-spacing: 2px; }

        .chat-footer {
          padding: 1rem;
          background: rgba(0,0,0,0.2);
          border-top: 1px solid var(--glass-border);
        }

        .ai-status {
          font-size: 0.8rem;
          color: var(--accent-secondary);
          display: flex;
          align-items: center;
          gap: 8px;
        }

        /* Shortlist Table */
        .shortlist-table-container {
          margin-top: 2rem;
          padding: 0;
          overflow: hidden;
        }

        .shortlist-table {
          width: 100%;
          border-collapse: collapse;
        }

        .shortlist-table th {
          text-align: left;
          padding: 1.2rem 1.5rem;
          color: var(--text-dim);
          font-size: 0.8rem;
          text-transform: uppercase;
          border-bottom: 1px solid var(--glass-border);
        }

        .shortlist-table td {
          padding: 1.2rem 1.5rem;
          border-bottom: 1px solid var(--glass-border);
        }

        .table-user { display: flex; gap: 12px; align-items: center; }
        .avatar-sm { width: 32px; height: 32px; background: var(--accent-secondary); border-radius: 8px; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.8rem; }
        .table-user .name { font-weight: 600; font-size: 0.9rem; }
        .table-user .role { font-size: 0.75rem; color: var(--text-muted); }

        .score-pill {
          padding: 4px 10px;
          border-radius: 20px;
          font-size: 0.85rem;
          font-weight: 700;
          display: inline-block;
        }

        .score-pill.match { background: rgba(150, 70, 255, 0.15); color: var(--accent-primary); }
        .score-pill.interest { background: rgba(0, 200, 255, 0.15); color: var(--accent-secondary); }

        .status-pill {
          padding: 4px 10px;
          border-radius: 6px;
          font-size: 0.75rem;
          font-weight: 600;
        }

        .status-pill.ready { background: rgba(50, 255, 150, 0.1); color: var(--accent-success); border: 1px solid hsla(150, 70%, 55%, 0.2); }

        /* Animations */
        .pulse { animation: pulse 2s infinite; }
        @keyframes pulse {
          0% { opacity: 0.5; }
          50% { opacity: 1; }
          100% { opacity: 0.5; }
        }

        .loading {
          opacity: 0.7;
          pointer-events: none;
        }

        /* --- Responsive Design --- */
        @media (max-width: 1024px) {
          .sidebar {
            width: 80px;
            padding: 1rem 0.5rem;
          }
          .sidebar-brand span, .sidebar-item span, .sidebar-footer {
            display: none;
          }
          .sidebar-brand { justify-content: center; margin-bottom: 2rem; }
          .sidebar-item { justify-content: center; padding: 12px; }
          
          .dashboard-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          .welcome-banner {
            grid-column: span 2;
          }
        }

        @media (max-width: 768px) {
          .app-container {
            flex-direction: column;
            padding: 0.5rem;
          }
          .sidebar {
            width: 100%;
            height: auto;
            flex-direction: row;
            position: relative;
            top: 0;
            padding: 0.75rem;
            justify-content: space-between;
          }
          .sidebar-nav {
            flex-direction: row;
            gap: 8px;
          }
          .sidebar-brand { margin-bottom: 0; }
          .sidebar-item { padding: 8px; }

          .dashboard-grid {
            grid-template-columns: 1fr;
          }
          .welcome-banner {
            grid-column: span 1;
            padding: 1.5rem;
            flex-direction: column;
          }
          .banner-content { max-width: 100%; text-align: center; }
          .banner-actions { justify-content: center; }
          .banner-illustration { display: none; }

          .main-header {
            padding: 0.75rem 1rem;
          }
          .search-bar { display: none; }
          
          .candidate-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 480px) {
          .welcome-banner h2 { font-size: 2rem; }
          .stat-value { font-size: 1.5rem; }
          .btn-primary { width: 100%; justify-content: center; }
          .card-actions { flex-direction: column; }
        }

        .discovery-logs {
          background: rgba(0,0,0,0.3);
          padding: 1rem;
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-bottom: 1rem;
          font-family: 'Courier New', Courier, monospace;
          font-size: 0.8rem;
          color: var(--accent-secondary);
          border-left: 2px solid var(--accent-primary);
        }

        .log-entry {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .loader-line {
          height: 2px;
          background: var(--accent-primary);
          width: 100%;
          margin-top: 8px;
          position: relative;
          overflow: hidden;
        }

        .loader-line::after {
          content: '';
          position: absolute;
          left: -100%;
          width: 100%;
          height: 100%;
          background: var(--accent-secondary);
          animation: slide 1.5s infinite linear;
        }

        @keyframes slide {
          0% { left: -100%; }
          100% { left: 100%; }
        }
        .activity-item.clickable {
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .activity-item.clickable:hover {
          background: hsla(230, 25%, 25%, 0.4);
          transform: translateX(4px);
          border-color: var(--accent-primary);
        }
      `}</style>
    </div>
  )
}

export default App
