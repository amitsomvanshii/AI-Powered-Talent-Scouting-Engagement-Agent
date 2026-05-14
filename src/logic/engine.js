import { realCandidates } from '../data/mockCandidates';

// Semantic mapping for broader domain matching
const DOMAIN_MAP = {
  'frontend': ['react', 'vue', 'angular', 'typescript', 'javascript', 'nextjs', 'tailwind', 'css', 'html', 'figma', 'ui', 'ux'],
  'backend': ['node', 'python', 'java', 'golang', 'rust', 'ruby', 'php', 'sql', 'nosql', 'api', 'microservices', 'spring', 'django', 'fastapi'],
  'devops': ['aws', 'azure', 'gcp', 'docker', 'kubernetes', 'terraform', 'ansible', 'jenkins', 'ci/cd', 'linux', 'bash'],
  'data': ['python', 'pandas', 'numpy', 'scikit-learn', 'tensorflow', 'pytorch', 'ml', 'ai', 'nlp', 'vision', 'spark', 'sql'],
  'design': ['figma', 'adobe', 'ui', 'ux', 'prototyping', 'visual design', 'sketch']
};

export const parseJD = (jdText) => {
  const keywords = [
    "react", "node", "python", "aws", "typescript", "backend", "frontend", 
    "fullstack", "ml", "ai", "java", "spring", "docker", "kubernetes", "redux", 
    "api", "javascript", "devops", "terraform", "figma", "ui/ux", "design", "nlp", "vision", "data scientist",
    "cloud", "azure", "gcp", "microservices", "sql", "nosql", "automation"
  ];
  
  const lowerJD = jdText.toLowerCase();
  const foundKeywords = keywords.filter(kw => lowerJD.includes(kw));
  
  // Detect Domain
  let detectedDomain = 'General';
  for (const [domain, keywords] of Object.entries(DOMAIN_MAP)) {
    if (keywords.some(kw => lowerJD.includes(kw))) {
      detectedDomain = domain;
      break;
    }
  }

  const roleKeywords = ["developer", "engineer", "architect", "lead", "manager", "specialist", "scientist", "designer"];
  let detectedRole = "Professional";
  const lines = jdText.split('\n');
  const firstLine = lines[0].toLowerCase();
  
  for (const rk of roleKeywords) {
    if (firstLine.includes(rk)) {
      detectedRole = rk;
      break;
    }
  }

  return {
    role: detectedRole,
    domain: detectedDomain,
    skills: foundKeywords,
    experienceLevel: lowerJD.includes('senior') || lowerJD.includes('lead') || lowerJD.includes('sr.') || lowerJD.includes('5+') ? 'Senior' : 'Mid',
    location: lowerJD.includes('remote') ? 'Remote' : 'India'
  };
};

export const scoreCandidates = (parsedJD) => {
  const threshold = 15; // Even lower to show diversity in results

  return realCandidates.map(candidate => {
    let matchScore = 0;
    const reasons = [];
    
    // 1. Semantic Skill Matching (Weight: 50%)
    const candSkills = candidate.skills.map(s => s.toLowerCase());
    const jdSkills = parsedJD.skills.map(s => s.toLowerCase());
    
    const directMatches = candSkills.filter(s => jdSkills.some(j => s.includes(j) || j.includes(s)));
    
    // Also check semantic overlap with the domain
    const domainSkills = DOMAIN_MAP[parsedJD.domain.toLowerCase()] || [];
    const semanticMatches = candSkills.filter(s => domainSkills.includes(s));

    if (jdSkills.length > 0) {
      matchScore += (directMatches.length / jdSkills.length) * 40;
    }
    
    if (semanticMatches.length > 0) {
      matchScore += 10;
      reasons.push(`Strong semantic fit for ${parsedJD.domain} ecosystem.`);
    }

    if (directMatches.length > 0) {
      reasons.push(`Direct experience with ${directMatches.slice(0, 2).join(', ')}.`);
    }
    
    // 2. Role & Domain Correlation (Weight: 30%)
    const candRole = candidate.role.toLowerCase();
    const jdRole = parsedJD.role.toLowerCase();
    
    if (candRole.includes(jdRole) || jdRole.includes(candRole)) {
      matchScore += 20;
      reasons.push(`Role alignment: ${candidate.role} aligns with target.`);
    }
    
    if (candRole.includes(parsedJD.domain.toLowerCase())) {
      matchScore += 10;
    }
    
    // 3. Experience Matching (Weight: 20%)
    const expYears = parseInt(candidate.experience) || 5;
    const isSeniorRequested = parsedJD.experienceLevel === 'Senior';
    const isSeniorCandidate = expYears >= 5;
    
    if (isSeniorRequested === isSeniorCandidate) {
      matchScore += 20;
      reasons.push(`Experience level matches (${candidate.experience}).`);
    } else if (isSeniorCandidate && !isSeniorRequested) {
      matchScore += 15; // Overqualified but still good
      reasons.push(`Exceeds base experience requirements.`);
    } else {
      matchScore += 5;
    }

    // Add realistic metadata
    const sources = ['LinkedIn', 'GitHub', 'StackOverflow', 'Indeed', 'Internal Referral'];
    const statuses = ['discovered', 'screened', 'interviewing', 'offered', 'hired', 'rejected'];
    
    return {
      ...candidate,
      matchScore: Math.max(5, Math.min(Math.round(matchScore), 98)),
      interestScore: 0,
      status: 'discovered',
      source: sources[candidate.id % sources.length],
      expectedSalary: `₹${(15 + (candidate.id % 20)).toString()}L - ₹${(25 + (candidate.id % 20)).toString()}L`,
      availability: candidate.id % 3 === 0 ? 'Immediate' : '1 Month',
      matchReasons: reasons.length > 0 ? reasons : ["Potential profile match based on domain overlap."]
    };
  })
  .filter(c => c.matchScore >= threshold)
  .sort((a, b) => b.matchScore - a.matchScore);
};

export const simulateChat = async (candidateName, role) => {
  const hash = candidateName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const scenario = hash % 4;
  const scenarios = [
    [
      { sender: 'AI', text: `Hello ${candidateName}, I'm the AI talent agent for our recruitment team. Your profile in ${role} looks like a perfect fit for our current opening.` },
      { sender: 'Candidate', text: `Hi! Thanks for the reach out. I've actually been following your company's progress. What's the tech stack like?` },
      { sender: 'AI', text: `We're heavily invested in modern architectures. Would you be open to a quick technical sync?` },
      { sender: 'Candidate', text: `Definitely. I'm free this Thursday morning.` }
    ],
    [
      { sender: 'AI', text: `Hi ${candidateName}, we're expanding our engineering team and your background in ${role} caught our attention.` },
      { sender: 'Candidate', text: `Thanks! I'm currently happy where I am, but always open to hearing about interesting challenges.` },
      { sender: 'AI', text: `Our current mission involves scaling global infrastructure. Interested?` },
      { sender: 'Candidate', text: `That sounds interesting. Can you send over the JD and salary range?` }
    ],
    [
      { sender: 'AI', text: `Hello ${candidateName}, we have a strategic opening for a ${role}. Your GitHub contributions are very impressive.` },
      { sender: 'Candidate', text: `Hey, thanks! Which repo are you referring to?` },
      { sender: 'AI', text: `The one involving distributed systems. Would you like to discuss how those skills fit here?` },
      { sender: 'Candidate', text: `I'm a bit busy this week, but let's connect next Tuesday.` }
    ],
    [
      { sender: 'AI', text: `Hi ${candidateName}, we're looking for a ${role}. Are you currently exploring new opportunities?` },
      { sender: 'Candidate', text: `Not actively, but I'm curious. What's the remote work policy?` },
      { sender: 'AI', text: `We are a remote-first organization. Would you like to proceed with a screening call?` },
      { sender: 'Candidate', text: `Remote sounds great. Yes, let's talk.` }
    ]
  ];
  return scenarios[scenario];
};

export const calculateInterest = (chatLog) => {
  const text = chatLog.map(m => m.text.toLowerCase()).join(' ');
  let score = 40; // Base
  
  if (text.includes('perfect') || text.includes('definitely')) score += 40;
  if (text.includes('interesting') || text.includes('remote')) score += 20;
  if (text.includes('thursday') || text.includes('tuesday') || text.includes('connect')) score += 15;
  if (text.includes('salary') || text.includes('jd')) score += 10;
  
  return Math.max(10, Math.min(score + (Math.random() * 10 - 5), 99));
};
