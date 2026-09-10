import { useState, useEffect } from 'react';

export interface Candidate {
  id: string;
  name: string;
  role: string;
  status: string;
  cvLink: string;
  portfolioLink: string;
  checklist?: { id: string; label: string; completed: boolean }[];
}

const defaultRecruits: Candidate[] = [
  { id: '1', name: 'Alice Cooper', role: 'Frontend Engineer', status: 'Interviewing', cvLink: '#cv-alice', portfolioLink: '#portfolio-alice' },
  { id: '2', name: 'Bob Dylan', role: 'Product Manager', status: 'Offered', cvLink: '#cv-bob', portfolioLink: '#portfolio-bob' },
  { id: '3', name: 'Charlie Puth', role: 'UI/UX Designer', status: 'Screening', cvLink: '#cv-charlie', portfolioLink: '#portfolio-charlie' }
];

const defaultOnboardings: Candidate[] = [];

export const useCandidateStore = () => {
  const [recruits, setRecruitsState] = useState<Candidate[]>([]);
  const [onboardings, setOnboardingsState] = useState<Candidate[]>([]);

  // Initialize from local storage on first mount
  useEffect(() => {
    const storedRecruits = localStorage.getItem('hrms_recruits');
    const storedOnboardings = localStorage.getItem('hrms_onboardings');

    if (storedRecruits) {
      setRecruitsState(JSON.parse(storedRecruits));
    } else {
      setRecruitsState(defaultRecruits);
      localStorage.setItem('hrms_recruits', JSON.stringify(defaultRecruits));
    }

    if (storedOnboardings) {
      setOnboardingsState(JSON.parse(storedOnboardings));
    } else {
      setOnboardingsState(defaultOnboardings);
      localStorage.setItem('hrms_onboardings', JSON.stringify(defaultOnboardings));
    }
  }, []);

  const setRecruits = (newRecruits: Candidate[]) => {
    setRecruitsState(newRecruits);
    localStorage.setItem('hrms_recruits', JSON.stringify(newRecruits));
  };

  const setOnboardings = (newOnboardings: Candidate[]) => {
    setOnboardingsState(newOnboardings);
    localStorage.setItem('hrms_onboardings', JSON.stringify(newOnboardings));
  };

  const moveToOnboarding = (candidateId: string) => {
    const candidate = recruits.find(r => r.id === candidateId);
    if (!candidate) return;

    // Create an onboarding checklist for the new hire
    const hiredCandidate: Candidate = {
      ...candidate,
      status: 'Onboarding',
      checklist: [
        { id: 'c1', label: 'Sign Employment Contract', completed: false },
        { id: 'c2', label: 'Setup IT Accounts (Email, Slack)', completed: false },
        { id: 'c3', label: 'Provide Welcome Kit', completed: false },
        { id: 'c4', label: 'Manager Welcome Meeting', completed: false },
      ]
    };

    const updatedRecruits = recruits.filter(r => r.id !== candidateId);
    const updatedOnboardings = [...onboardings, hiredCandidate];

    setRecruits(updatedRecruits);
    setOnboardings(updatedOnboardings);
  };

  return {
    recruits,
    onboardings,
    setRecruits,
    setOnboardings,
    moveToOnboarding
  };
};
