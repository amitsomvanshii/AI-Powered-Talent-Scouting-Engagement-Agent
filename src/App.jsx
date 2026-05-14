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
  ExternalLink,
  BarChart3,
  Settings,
  UploadCloud,
  DollarSign,
  MapPin,
  Calendar
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { parseJD, scoreCandidates, simulateChat, calculateInterest } from './logic/engine'

// --- Configuration ---
const PLATFORM_NAME = "ScoutAI Pro";
const COMPANY_NAME = "Apex Strategic Talent"; 

// --- Components ---

const SidebarItem = ({ icon: Icon, label, active, onClick }) => (
  <motion.div 
    whileHover={{ x: 5, backgroundColor: 'rgba(255,255,255,0.05)' }}
    whileTap={{ scale: 0.95 }}
    onClick={onClick}
    className={`sidebar-item ${active ? 'active' : ''}`}
  >
    <Icon size={20} />
    <span>{label}</span>
    {active && <motion.div layoutId="activeNav" className="active-indicator" />}
  </motion.div>
)

const Header = ({ companyName }) => (
  <header className="main-header">
    <div className="logo-section">
      <div className="logo-icon-wrapper">
        <BrainCircuit size={28} />
      </div>
      <div className="logo-text">
        <h1 className="gradient-text">{PLATFORM_NAME}</h1>
        <span className="company-badge">{companyName}</span>
      </div>
    </div>
    <div className="header-actions">
      <div className="search-bar-modern">
        <Search size={18} />
        <input type="text" placeholder="Explore talent network..." />
      </div>
      <div className="user-profile-modern">
        <div className="profile-img-designer">AS</div>
        <div className="status-dot"></div>
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
    <div className="modal-overlay-designer">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 40 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="chat-modal-designer glass-panel"
      >
        <div className="modal-header-designer">
          <div className="candidate-info-designer">
            <div className="avatar-designer">{candidate.name[0]}</div>
            <div>
              <h3>{candidate.name}</h3>
              <p>AI Neural Engagement</p>
            </div>
          </div>
          <button onClick={onClose} className="close-btn-designer"><X size={24} /></button>
        </div>
        
        <div className="chat-body-designer">
          <AnimatePresence>
            {messages.map((msg, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className={`message-designer ${msg.sender.toLowerCase()}`}
              >
                <div className="message-bubble-designer">{msg.text}</div>
              </motion.div>
            ))}
            {isTyping && (
              <motion.div className="message-designer ai">
                <div className="message-bubble-designer typing-designer">...</div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="chat-footer-designer">
          <div className="ai-status-designer">
            <div className="pulse-dot"></div> Analyzing candidate intent vectors...
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
  const [companyName, setCompanyName] = useState(COMPANY_NAME);

  const handleParse = () => {
    if (!jdText.trim()) return;
    setIsParsing(true);
    setDiscoveryLogs(["Neural engine initialized...", "Extracting semantic tokens..."]);
    
    setTimeout(() => setDiscoveryLogs(prev => [...prev, "Cross-referencing global clusters..."]), 500);
    setTimeout(() => setDiscoveryLogs(prev => [...prev, "Validating technical proficiency vectors..."]), 1000);
    setTimeout(() => setDiscoveryLogs(prev => [...prev, "Optimizing match scoring..."]), 1500);

    setTimeout(() => {
      const parsed = parseJD(jdText);
      const scored = scoreCandidates(parsed);
      setCandidates(scored);
      
      const newMission = {
        id: Date.now().toString(),
        role: parsed.role || 'Software Engineer',
        jdText: jdText,
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

  const updateCandidateStatus = (id, newStatus) => {
    setCandidates(prev => prev.map(c => c.id === id ? { ...c, status: newStatus } : c));
  };

  return (
    <div className="app-container-designer">
      {/* Background blobs for artistic effect */}
      <div className="blob blob-1"></div>
      <div className="blob blob-2"></div>
      <div className="blob blob-3"></div>

      <aside className="sidebar-designer glass-panel">
        <div className="sidebar-brand-designer">
          <BrainCircuit size={32} className="brand-icon-designer" />
          <span>SCOUT</span>
        </div>
        <nav className="sidebar-nav-designer">
          <SidebarItem icon={TrendingUp} label="Overview" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
          <SidebarItem icon={FileText} label="Missions" active={activeTab === 'jd'} onClick={() => setActiveTab('jd')} />
          <SidebarItem icon={Users} label="Talent Pool" active={activeTab === 'candidates'} onClick={() => setActiveTab('candidates')} />
          <SidebarItem icon={Target} label="Pipeline" active={activeTab === 'shortlist'} onClick={() => setActiveTab('shortlist')} />
          <SidebarItem icon={BarChart3} label="Analytics" active={activeTab === 'analytics'} onClick={() => setActiveTab('analytics')} />
          <SidebarItem icon={Settings} label="Settings" active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} />
        </nav>
        
        <div className="sidebar-footer-designer">
          <div className="system-status-card glass-card">
            <div className="status-header">
              <span>Neural Load</span>
              <span>74%</span>
            </div>
            <div className="status-bar-bg">
              <motion.div initial={{ width: 0 }} animate={{ width: '74%' }} className="status-bar-fill" />
            </div>
          </div>
        </div>
      </aside>

      <main className="content-designer">
        <Header companyName={companyName} />
        
        <div className="view-container-designer">
          <AnimatePresence mode="wait">
            {activeTab === 'dashboard' && (
              <motion.div 
                key="dashboard"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="dashboard-designer"
              >
                <div className="hero-section glass-panel">
                  <div className="hero-content-designer">
                    <motion.h2 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="hero-title"
                    >
                      The Future of <br /> <span className="highlight-text">Talent Discovery</span>
                    </motion.h2>
                    <p className="hero-subtitle">Autonomous agentic intelligence for the modern recruitment era.</p>
                    <div className="hero-actions-designer">
                      <button className="btn-primary-designer" onClick={() => setActiveTab('jd')}>
                        Launch Mission <Zap size={18} />
                      </button>
                      <button className="btn-outline-designer" onClick={() => setActiveTab('analytics')}>System Insights</button>
                    </div>
                  </div>
                  <div className="hero-visual">
                    <div className="neural-sphere"></div>
                  </div>
                </div>

                <div className="stats-grid-designer">
                  <div className="glass-card stat-card-designer">
                    <div className="stat-icon-designer"><Target size={24} /></div>
                    <h3>Precision Match</h3>
                    <div className="stat-value-designer">98.4<span className="percent">%</span></div>
                    <p>Highest in class accuracy</p>
                  </div>
                  <div className="glass-card stat-card-designer">
                    <div className="stat-icon-designer"><Users size={24} /></div>
                    <h3>Engineered Pool</h3>
                    <div className="stat-value-designer">12.4<span className="unit">K</span></div>
                    <p>Verified professional nodes</p>
                  </div>
                  <div className="glass-card stat-card-designer">
                    <div className="stat-icon-designer"><MessageSquare size={24} /></div>
                    <h3>Active Flows</h3>
                    <div className="stat-value-designer">{candidates.filter(c => c.status !== 'discovered').length}</div>
                    <p>Intelligent engagements</p>
                  </div>
                </div>

                <div className="recent-missions-designer">
                  <div className="section-header-designer">
                    <h3>Recent Scouting Missions</h3>
                    <button className="text-btn">View All History</button>
                  </div>
                  <div className="mission-list-designer">
                    {missions.map(mission => (
                      <motion.div 
                        key={mission.id} 
                        whileHover={{ scale: 1.01, backgroundColor: 'rgba(255,255,255,0.03)' }}
                        className="glass-card mission-item-designer clickable"
                        onClick={() => handleSelectMission(mission)}
                      >
                        <div className="mission-icon-box"><FileText size={20} /></div>
                        <div className="mission-details-designer">
                          <h4>{mission.role}</h4>
                          <p>{mission.discovered} nodes identified • {mission.engaged} engagements</p>
                        </div>
                        <div className="mission-badge-designer">{mission.status}</div>
                        <ChevronRight size={20} className="mission-chevron" />
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'jd' && (
              <motion.div 
                key="jd"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="workspace-designer"
              >
                <div className="workspace-header-designer">
                  <h2>Neural Scouting Workspace</h2>
                  <p>Input role parameters to initiate the autonomous discovery cycle.</p>
                </div>
                
                <div className="workspace-grid-designer">
                  <div className="glass-panel editor-container-designer">
                    <div className="editor-toolbar-designer">
                      <ShieldCheck size={18} /> <span>Strategic AI Core Active</span>
                    </div>
                    <textarea 
                      placeholder="Paste your job description... Our neural engine will tokenize requirements and identify talent clusters."
                      className="editor-textarea-designer"
                      value={jdText}
                      onChange={(e) => setJdText(e.target.value)}
                    />
                    
                    {isParsing && (
                      <div className="neural-logs-designer glass-card">
                        {discoveryLogs.map((log, i) => (
                          <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="neural-log-entry">
                            <Zap size={14} className="glow-icon" /> {log}
                          </motion.div>
                        ))}
                        <div className="scan-line"></div>
                      </div>
                    )}

                    <div className="editor-footer-designer">
                      <p>Neural engine optimizes for: Tech Stack, Senority, Domain, and Cultural Fit.</p>
                      <button 
                        className={`btn-primary-designer ${isParsing ? 'loading' : ''}`} 
                        onClick={handleParse}
                        disabled={isParsing || !jdText.trim()}
                      >
                        {isParsing ? 'Analyzing...' : 'Initiate Neural Search'}
                      </button>
                    </div>
                  </div>

                  <div className="source-panel-designer glass-panel">
                    <h3>Knowledge Sources</h3>
                    <div className="drop-zone-designer">
                      <UploadCloud size={48} className="drop-icon" />
                      <p>Import via <b>Dataset</b> or <b>API</b></p>
                      <button className="btn-secondary-designer">Connect Source</button>
                    </div>
                    <div className="source-metrics-designer">
                      <div className="s-metric"><span>LinkedIn Graph</span> <CheckCircle size={16} /></div>
                      <div className="s-metric"><span>GitHub Commits</span> <CheckCircle size={16} /></div>
                      <div className="s-metric"><span>StackOverflow</span> <CheckCircle size={16} /></div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'candidates' && (
              <motion.div 
                key="candidates"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="results-designer"
              >
                <div className="results-header-designer">
                  <div>
                    <h2>Discovery Cluster</h2>
                    <p>{candidates.length} high-precision nodes identified.</p>
                  </div>
                  <div className="results-actions-designer">
                    <button className="glass-card filter-btn-designer"><Filter size={20} /></button>
                    <button className="btn-primary-designer" onClick={() => setActiveTab('shortlist')}>Pipeline View</button>
                  </div>
                </div>
                
                <div className="candidate-grid-designer">
                  {candidates.map((candidate, i) => (
                    <motion.div 
                      key={candidate.id} 
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="glass-card node-card-designer"
                    >
                      <div className="node-header-designer">
                        <div className="node-avatar-designer">
                          {candidate.name[0]}
                          <div className="node-ring" style={{'--score': `${candidate.matchScore}%`}}></div>
                        </div>
                        <div className="node-meta-designer">
                          <h3>{candidate.name}</h3>
                          <div className="node-tags-designer">
                            <span className="n-tag source">{candidate.source}</span>
                            <span className="n-tag match">{candidate.matchScore}% Match</span>
                          </div>
                        </div>
                      </div>

                      <div className="node-bio-designer">
                        <p>{candidate.role}</p>
                        <div className="node-stats-designer">
                          <span><Clock size={12} /> {candidate.experience}</span>
                          <span><DollarSign size={12} /> {candidate.expectedSalary}</span>
                        </div>
                      </div>

                      <div className="node-insights-designer">
                        <h4>AI Token Analysis</h4>
                        <ul>
                          {candidate.matchReasons.slice(0, 2).map((r, idx) => (
                            <li key={idx}><Zap size={12} /> {r}</li>
                          ))}
                        </ul>
                      </div>

                      <div className="node-actions-designer">
                        {candidate.status !== 'discovered' ? (
                          <div className="node-status-badge">{candidate.status.toUpperCase()}</div>
                        ) : (
                          <button className="btn-primary-designer full-width" onClick={() => startEngagement(candidate)}>
                            Engage Profile
                          </button>
                        )}
                        <button className="btn-outline-designer icon-btn" onClick={() => window.open(candidate.profileUrl, '_blank')}>
                          <ExternalLink size={18} />
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
                className="pipeline-designer"
              >
                <div className="results-header-designer">
                  <h2>Active Talent Pipeline</h2>
                  <p>Real-time tracking of neural engagement cycles.</p>
                </div>

                <div className="pipeline-table-wrapper-designer">
                  <table className="pipeline-table-designer">
                    <thead>
                      <tr>
                        <th>Candidate Profile</th>
                        <th>Metrics</th>
                        <th>Status Flow</th>
                        <th>Economics</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {candidates
                        .filter(c => c.status !== 'discovered')
                        .map(c => (
                          <tr key={c.id}>
                            <td>
                              <div className="table-node-designer">
                                <div className="table-avatar-designer">{c.name[0]}</div>
                                <div>
                                  <div className="table-name-designer">{c.name}</div>
                                  <div className="table-source-designer">{c.source}</div>
                                </div>
                              </div>
                            </td>
                            <td>
                              <div className="table-metrics-designer">
                                <div className="m-pill">Match: {c.matchScore}%</div>
                                <div className="m-pill interest">Intent: {c.interestScore}%</div>
                              </div>
                            </td>
                            <td>
                              <select 
                                className={`status-select-designer ${c.status}`} 
                                value={c.status}
                                onChange={(e) => updateCandidateStatus(c.id, e.target.value)}
                              >
                                <option value="engaged">Engaged</option>
                                <option value="screened">Screened</option>
                                <option value="interviewing">Interviewing</option>
                                <option value="offered">Offered</option>
                                <option value="hired">Hired</option>
                                <option value="rejected">Rejected</option>
                              </select>
                            </td>
                            <td>
                              <div className="table-economics-designer">
                                <div className="e-val">{c.expectedSalary}</div>
                                <div className="e-sub">{c.availability}</div>
                              </div>
                            </td>
                            <td>
                              <div className="table-actions-designer">
                                <button className="btn-primary-designer btn-sm">Schedule</button>
                                <button className="btn-outline-designer btn-sm icon-btn"><Clock size={16} /></button>
                              </div>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}

            {activeTab === 'analytics' && (
              <motion.div 
                key="analytics"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="analytics-designer"
              >
                <div className="results-header-designer">
                  <h2>Neural Intelligence Insights</h2>
                  <p>Performance metrics for the current scouting cycle.</p>
                </div>
                
                <div className="analytics-grid-designer">
                  <div className="glass-panel analytics-card-designer">
                    <h3>Conversion Funnel</h3>
                    <div className="modern-funnel">
                      <div className="funnel-step">
                        <div className="f-bar" style={{ width: '100%' }}></div>
                        <div className="f-label">Discovered: {candidates.length}</div>
                      </div>
                      <div className="funnel-step">
                        <div className="f-bar" style={{ width: `${(candidates.filter(c => c.status !== 'discovered').length / Math.max(1, candidates.length)) * 100}%` }}></div>
                        <div className="f-label">Engaged: {candidates.filter(c => c.status !== 'discovered').length}</div>
                      </div>
                      <div className="funnel-step">
                        <div className="f-bar" style={{ width: `${(candidates.filter(c => c.status === 'interviewing').length / Math.max(1, candidates.length)) * 100}%` }}></div>
                        <div className="f-label">Interviewing: {candidates.filter(c => c.status === 'interviewing').length}</div>
                      </div>
                    </div>
                  </div>

                  <div className="glass-panel analytics-card-designer">
                    <h3>Channel Efficiency</h3>
                    <div className="channel-stats-designer">
                      {['LinkedIn', 'GitHub', 'StackOverflow', 'Indeed'].map(source => {
                        const count = candidates.filter(c => c.source === source).length;
                        const percent = (count / Math.max(1, candidates.length)) * 100;
                        return (
                          <div key={source} className="channel-row-designer">
                            <span className="c-label">{source}</span>
                            <div className="c-bar-bg"><motion.div initial={{ width: 0 }} animate={{ width: `${percent}%` }} className="c-bar-fill" /></div>
                            <span className="c-count">{count}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'settings' && (
              <motion.div 
                key="settings"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="settings-designer"
              >
                <div className="results-header-designer">
                  <h2>System Configuration</h2>
                  <p>Fine-tune the neural engine and branding parameters.</p>
                </div>
                
                <div className="glass-panel settings-content-designer">
                  <div className="settings-section-designer">
                    <h3>Organization Identity</h3>
                    <div className="input-group-designer">
                      <label>Platform Display Name</label>
                      <input type="text" value={companyName} onChange={(e) => setCompanyName(e.target.value)} className="modern-input" />
                    </div>
                  </div>
                  
                  <div className="settings-section-designer">
                    <h3>Neural Parameters</h3>
                    <div className="input-group-designer">
                      <label>Matching Confidence Threshold</label>
                      <input type="range" min="10" max="90" defaultValue="45" className="modern-range" />
                    </div>
                    <div className="toggle-group-designer">
                      <label>Autonomous Neural Outreach</label>
                      <div className="modern-toggle active"></div>
                    </div>
                  </div>
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
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;800&family=JetBrains+Mono:wght@400;500&display=swap');

        :root {
          --bg-deep: #05060b;
          --bg-card: rgba(13, 17, 28, 0.7);
          --accent-primary: #8b5cf6;
          --accent-secondary: #06b6d4;
          --text-main: #f8fafc;
          --text-muted: #94a3b8;
          --glass-border: rgba(255, 255, 255, 0.08);
          --neon-glow: 0 0 30px rgba(139, 92, 246, 0.3);
          --sidebar-width: 280px;
        }

        * { box-sizing: border-box; margin: 0; padding: 0; -webkit-font-smoothing: antialiased; }
        body { font-family: 'Outfit', sans-serif; background: var(--bg-deep); color: var(--text-main); overflow-x: hidden; }

        .app-container-designer {
          display: flex;
          min-height: 100vh;
          padding: 1.5rem;
          gap: 1.5rem;
          position: relative;
          background: #05060b;
        }

        /* Animated blobs */
        .blob { position: absolute; border-radius: 50%; filter: blur(100px); z-index: 0; opacity: 0.2; animation: float 20s infinite alternate; }
        .blob-1 { width: 500px; height: 500px; background: var(--accent-primary); top: -200px; right: -200px; }
        .blob-2 { width: 400px; height: 400px; background: var(--accent-secondary); bottom: -100px; left: -100px; animation-duration: 25s; }
        .blob-3 { width: 300px; height: 300px; background: #ec4899; top: 40%; left: 30%; animation-duration: 30s; }

        @keyframes float { 0% { transform: translate(0, 0) scale(1); } 100% { transform: translate(100px, 100px) scale(1.2); } }

        .glass-panel { background: var(--bg-card); backdrop-filter: blur(40px); border: 1px solid var(--glass-border); border-radius: 32px; box-shadow: 0 20px 50px rgba(0,0,0,0.5); }
        .glass-card { background: rgba(255, 255, 255, 0.03); backdrop-filter: blur(20px); border: 1px solid var(--glass-border); border-radius: 24px; transition: 0.4s cubic-bezier(0.2, 0.8, 0.2, 1); }

        /* Sidebar */
        .sidebar-designer { width: var(--sidebar-width); display: flex; flex-direction: column; padding: 2.5rem; height: calc(100vh - 3rem); position: sticky; top: 1.5rem; z-index: 10; }
        .sidebar-brand-designer { display: flex; align-items: center; gap: 15px; margin-bottom: 4rem; font-weight: 800; font-size: 1.8rem; letter-spacing: -1px; }
        .brand-icon-designer { color: var(--accent-primary); filter: drop-shadow(0 0 10px var(--accent-primary)); }
        .sidebar-nav-designer { display: flex; flex-direction: column; gap: 10px; flex: 1; }
        .sidebar-item { position: relative; display: flex; align-items: center; gap: 15px; padding: 14px 20px; border-radius: 20px; cursor: pointer; color: var(--text-muted); font-weight: 600; transition: 0.3s; }
        .sidebar-item:hover { color: white; background: rgba(255,255,255,0.05); }
        .sidebar-item.active { color: var(--accent-primary); background: rgba(139, 92, 246, 0.1); }
        .active-indicator { position: absolute; left: 0; top: 25%; bottom: 25%; width: 4px; background: var(--accent-primary); border-radius: 0 4px 4px 0; box-shadow: 0 0 10px var(--accent-primary); }

        /* Content */
        .content-designer { flex: 1; display: flex; flex-direction: column; gap: 1.5rem; min-width: 0; z-index: 1; }
        .main-header { display: flex; justify-content: space-between; align-items: center; height: 80px; padding: 0 1rem; }
        .logo-text h1 { font-size: 1.8rem; font-weight: 800; letter-spacing: -1px; }
        .gradient-text { background: linear-gradient(to right, #fff, #a78bfa); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .company-badge { font-size: 0.7rem; background: rgba(255,255,255,0.05); padding: 4px 12px; border-radius: 20px; color: var(--accent-primary); font-weight: 700; margin-left: 10px; border: 1px solid rgba(139, 92, 246, 0.2); }
        .search-bar-modern { background: rgba(255,255,255,0.03); border: 1px solid var(--glass-border); border-radius: 20px; padding: 10px 20px; display: flex; align-items: center; gap: 12px; width: 350px; }
        .search-bar-modern input { background: none; border: none; color: white; outline: none; width: 100%; font-size: 0.9rem; }

        /* Dashboard */
        .hero-section { display: grid; grid-template-columns: 1.2fr 0.8fr; padding: 4rem; position: relative; overflow: hidden; }
        .hero-title { font-size: 4rem; line-height: 1.1; font-weight: 800; margin-bottom: 1.5rem; letter-spacing: -2px; }
        .highlight-text { color: var(--accent-primary); position: relative; }
        .highlight-text::after { content: ''; position: absolute; bottom: 5px; left: 0; width: 100%; height: 8px; background: rgba(139, 92, 246, 0.2); z-index: -1; }
        .hero-subtitle { font-size: 1.2rem; color: var(--text-muted); margin-bottom: 2.5rem; max-width: 500px; }
        .hero-actions-designer { display: flex; gap: 1.5rem; }
        
        .btn-primary-designer { background: var(--accent-primary); color: white; padding: 16px 32px; border-radius: 20px; font-weight: 700; border: none; cursor: pointer; display: flex; align-items: center; gap: 10px; transition: 0.3s cubic-bezier(0.2, 0.8, 0.2, 1); box-shadow: var(--neon-glow); }
        .btn-primary-designer:hover { transform: scale(1.05) rotate(-1deg); box-shadow: 0 0 40px rgba(139, 92, 246, 0.5); }
        .btn-outline-designer { background: none; color: white; border: 1px solid var(--glass-border); padding: 16px 32px; border-radius: 20px; font-weight: 700; cursor: pointer; transition: 0.3s; }
        .btn-outline-designer:hover { background: rgba(255,255,255,0.05); }

        .stats-grid-designer { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem; margin-top: 1.5rem; }
        .stat-card-designer { padding: 2.5rem; text-align: center; }
        .stat-icon-designer { width: 50px; height: 50px; background: rgba(139, 92, 246, 0.1); border-radius: 16px; display: flex; align-items: center; justify-content: center; color: var(--accent-primary); margin: 0 auto 1.5rem; }
        .stat-value-designer { font-size: 3rem; font-weight: 800; letter-spacing: -2px; margin-bottom: 5px; }
        .stat-value-designer .percent { font-size: 1.2rem; color: var(--accent-primary); }

        /* Workspace */
        .workspace-grid-designer { display: grid; grid-template-columns: 1fr 340px; gap: 2rem; }
        .editor-textarea-designer { width: 100%; height: 450px; background: rgba(0,0,0,0.4); border: 1px solid var(--glass-border); border-radius: 32px; padding: 2.5rem; color: white; font-family: 'JetBrains Mono', monospace; font-size: 1.05rem; line-height: 1.8; resize: none; outline: none; transition: 0.3s; }
        .editor-textarea-designer:focus { border-color: var(--accent-primary); box-shadow: var(--neon-glow); }

        .drop-zone-designer { border: 2px dashed var(--glass-border); border-radius: 32px; padding: 3rem; text-align: center; cursor: pointer; transition: 0.3s; }
        .drop-zone-designer:hover { border-color: var(--accent-primary); background: rgba(255,255,255,0.02); }
        .drop-icon { color: var(--text-dim); margin-bottom: 1.5rem; }

        /* Node Cards */
        .candidate-grid-designer { display: grid; grid-template-columns: repeat(auto-fill, minmax(360px, 1fr)); gap: 1.5rem; margin-top: 2rem; }
        .node-card-designer { padding: 2rem; position: relative; overflow: hidden; }
        .node-card-designer:hover { transform: translateY(-10px); border-color: var(--accent-primary); box-shadow: var(--neon-glow); }
        .node-avatar-designer { width: 64px; height: 64px; border-radius: 20px; background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary)); display: flex; align-items: center; justify-content: center; font-size: 1.5rem; font-weight: 800; position: relative; }
        .node-ring { position: absolute; inset: -5px; border-radius: 24px; border: 2px solid transparent; border-top-color: var(--accent-primary); transform: rotate(calc(var(--score) * 3.6deg)); }
        
        .n-tag { font-size: 0.65rem; font-weight: 800; text-transform: uppercase; padding: 4px 10px; border-radius: 8px; }
        .n-tag.source { background: rgba(255,255,255,0.05); color: var(--accent-secondary); }
        .n-tag.match { background: rgba(139, 92, 246, 0.15); color: var(--accent-primary); }

        .node-insights-designer { background: rgba(0,0,0,0.2); padding: 1.2rem; border-radius: 20px; margin: 1.5rem 0; }
        .node-insights-designer h4 { font-size: 0.75rem; color: var(--text-dim); margin-bottom: 10px; text-transform: uppercase; letter-spacing: 1px; }
        .node-insights-designer ul { list-style: none; display: flex; flex-direction: column; gap: 8px; }
        .node-insights-designer li { font-size: 0.85rem; display: flex; gap: 10px; color: var(--text-muted); }
        .node-insights-designer li svg { color: var(--accent-primary); flex-shrink: 0; }

        /* Pipeline Table */
        .pipeline-table-designer { width: 100%; border-spacing: 0 12px; border-collapse: separate; }
        .pipeline-table-designer th { text-align: left; padding: 1.5rem; color: var(--text-dim); font-size: 0.8rem; text-transform: uppercase; letter-spacing: 1px; }
        .pipeline-table-designer td { padding: 1.5rem; background: rgba(255,255,255,0.02); border: 1px solid var(--glass-border); border-style: solid none; }
        .pipeline-table-designer td:first-child { border-radius: 24px 0 0 24px; border-left-style: solid; }
        .pipeline-table-designer td:last-child { border-radius: 0 24px 24px 0; border-right-style: solid; }

        .status-select-designer { background: #111420; color: white; border: 1px solid var(--glass-border); padding: 8px 16px; border-radius: 12px; font-weight: 600; outline: none; cursor: pointer; }
        .status-select-designer.interviewing { color: var(--accent-secondary); border-color: var(--accent-secondary); }
        .status-select-designer.offered { color: var(--accent-tertiary); border-color: var(--accent-tertiary); }

        /* Analytics */
        .modern-funnel { display: flex; flex-direction: column; gap: 15px; margin-top: 2rem; }
        .f-bar { height: 45px; background: linear-gradient(90deg, var(--accent-primary), var(--accent-secondary)); border-radius: 15px; box-shadow: var(--neon-glow); position: relative; overflow: hidden; }
        .f-bar::after { content: ''; position: absolute; inset: 0; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent); animation: sweep 3s infinite; }
        @keyframes sweep { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }
        .f-label { font-size: 0.9rem; font-weight: 700; margin-top: 5px; color: var(--text-muted); }

        /* Chat Modal */
        .modal-overlay-designer { position: fixed; inset: 0; background: rgba(0,0,0,0.8); backdrop-filter: blur(10px); display: flex; align-items: center; justify-content: center; z-index: 1000; }
        .chat-modal-designer { width: 550px; height: 700px; display: flex; flex-direction: column; }
        .message-bubble-designer { max-width: 80%; padding: 16px 20px; border-radius: 24px; line-height: 1.6; font-size: 0.95rem; }
        .message-designer.ai .message-bubble-designer { background: rgba(255,255,255,0.05); border-bottom-left-radius: 4px; }
        .message-designer.candidate .message-bubble-designer { background: var(--accent-primary); border-bottom-right-radius: 4px; box-shadow: var(--neon-glow); }
      `}</style>
    </div>
  )
}

export default App
