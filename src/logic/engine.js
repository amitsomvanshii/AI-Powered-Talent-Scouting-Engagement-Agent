import { realCandidates } from '../data/mockCandidates';

export const parseJD = (jdText) => {
  const keywords = [
    "react", "node", "python", "aws", "typescript", "backend", "frontend", 
    "fullstack", "ml", "ai", "java", "spring", "docker", "kubernetes", "redux", 
    "api", "javascript", "devops", "terraform", "figma", "ui/ux", "design", "nlp", "vision", "data scientist"
  ];
  
  const foundKeywords = keywords.filter(kw => jdText.toLowerCase().includes(kw));
  
  const roleKeywords = ["developer", "engineer", "architect", "lead", "manager", "specialist", "scientist", "designer"];
  let detectedRole = "Professional";
  const firstLine = jdText.split('\n')[0].toLowerCase();
  
  for (const rk of roleKeywords) {
    if (firstLine.includes(rk)) {
      detectedRole = rk;
      break;
    }
  }

  return {
    role: detectedRole,
    skills: foundKeywords,
    experienceLevel: jdText.toLowerCase().includes('senior') || jdText.toLowerCase().includes('lead') || jdText.toLowerCase().includes('sr.') ? 'Senior' : 'Mid',
    location: 'India'
  };
};

export const scoreCandidates = (parsedJD) => {
  const threshold = 25; // Lower threshold to ensure matches are found

  return realCandidates.map(candidate => {
    let matchScore = 0;
    
    // 1. Skill Matching (Weight: 60%)
    const matchingSkills = candidate.skills.filter(skill => 
      parsedJD.skills.some(jdSkill => {
        const s = skill.toLowerCase();
        const j = jdSkill.toLowerCase();
        return s.includes(j) || j.includes(s);
      })
    );
    
    if (parsedJD.skills.length > 0) {
      matchScore += (matchingSkills.length / parsedJD.skills.length) * 60;
    } else {
      matchScore += 20; 
    }
    
    // 2. Role Correlation (Weight: 30%)
    const candRole = candidate.role.toLowerCase();
    const jdRole = parsedJD.role.toLowerCase();
    const jdText = JSON.stringify(parsedJD).toLowerCase();

    // Check for domain-specific categories
    const categories = {
      'python': ['python', 'django', 'fastapi'],
      'java': ['java', 'spring', 'hibernate'],
      'react': ['react', 'frontend', 'javascript', 'typescript'],
      'devops': ['devops', 'aws', 'terraform', 'kubernetes', 'docker', 'cloud'],
      'designer': ['design', 'ui', 'ux', 'figma'],
      'data scientist': ['data scientist', 'ml', 'ai', 'nlp', 'vision']
    };

    let catMatch = false;
    for (const [cat, keywords] of Object.entries(categories)) {
      if (jdText.includes(cat) && (candRole.includes(cat) || keywords.some(k => candRole.includes(k)))) {
        catMatch = true;
        break;
      }
    }

    if (catMatch) {
      matchScore += 30;
    } else if (jdRole.includes(candRole) || candRole.includes(jdRole)) {
      matchScore += 20;
    }
    
    // 3. Experience Matching (Weight: 10%)
    const expYears = parseInt(candidate.experience) || 5;
    const isSeniorRequested = parsedJD.experienceLevel === 'Senior';
    const isSeniorCandidate = expYears >= 6;
    if (isSeniorRequested === isSeniorCandidate) matchScore += 10;
    else matchScore += 5;

    matchScore = Math.max(0, Math.min(Math.round(matchScore), 99));
    
    return {
      ...candidate,
      matchScore,
      interestScore: 0,
      status: 'discovered'
    };
  })
  .filter(c => c.matchScore >= threshold)
  .sort((a, b) => b.matchScore - a.matchScore);
};

export const simulateChat = async (candidateName, role) => {
  const hash = candidateName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const scenario = hash % 3;
  const scenarios = [
    [
      { sender: 'AI', text: `Hello ${candidateName}, Your background in ${role} is an exceptional match.` },
      { sender: 'Candidate', text: `Hi! Thanks for reaching out. The timing is perfect!` },
      { sender: 'AI', text: `Great! Would you be open to a 15-minute sync this week?` },
      { sender: 'Candidate', text: `Absolutely. I'm available this Thursday at 4 PM.` }
    ],
    [
      { sender: 'AI', text: `Hello ${candidateName}, Your experience in ${role} caught my eye.` },
      { sender: 'Candidate', text: `Hi. I'm open to hearing about what's out there.` },
      { sender: 'AI', text: `We're scaling our team. Would you like to chat briefly?` },
      { sender: 'Candidate', text: `Maybe next week?` }
    ],
    [
      { sender: 'AI', text: `Hello ${candidateName}, We have a ${role} role that seems to fit your profile.` },
      { sender: 'Candidate', text: `Thanks. I'm not really looking for a change right now, but feel free to send the JD.` },
      { sender: 'AI', text: `No problem.` },
      { sender: 'Candidate', text: `Sounds good. Thanks.` }
    ]
  ];
  return scenarios[scenario];
};

export const calculateInterest = (chatLog) => {
  const candidateMessages = chatLog.filter(m => m.sender === 'Candidate').map(m => m.text.toLowerCase());
  let score = 0;
  if (candidateMessages.some(m => m.includes('perfect') || m.includes('looking for'))) score += 50;
  if (candidateMessages.some(m => m.includes('absolutely') || m.includes('thursday'))) score += 30;
  if (candidateMessages.some(m => m.includes('briefly') || m.includes('suppose') || m.includes('week'))) score += 20;
  const baseScore = 40;
  const jitter = Math.floor(Math.random() * 11) - 5;
  return Math.max(10, Math.min(score + baseScore + jitter, 98));
};
