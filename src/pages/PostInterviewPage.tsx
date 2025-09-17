import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PostInterviewSummary } from '../components';
import { db } from '../database';
import type { PostInterviewData } from '../types';

// Generate mock performance data based on actual interview data
const generateMockPerformanceData = (interview: any): PostInterviewData => {
  // Generate realistic scores based on interview type
  const getScoresByType = (type: string) => {
    switch (type) {
      case 'technical':
        return {
          technicalScore: 7.8 + Math.random() * 1.5,
          behavioralScore: 6.5 + Math.random() * 2,
          codingScore: 8.0 + Math.random() * 1.2,
          systemDesignScore: 6.8 + Math.random() * 1.8
        };
      case 'behavioral':
        return {
          technicalScore: 6.2 + Math.random() * 1.5,
          behavioralScore: 8.3 + Math.random() * 1.0,
          codingScore: 6.0 + Math.random() * 1.5,
          systemDesignScore: 6.0 + Math.random() * 1.5
        };
      case 'system_design':
        return {
          technicalScore: 7.5 + Math.random() * 1.2,
          behavioralScore: 7.0 + Math.random() * 1.5,
          codingScore: 6.8 + Math.random() * 1.5,
          systemDesignScore: 8.5 + Math.random() * 1.0
        };
      default:
        return {
          technicalScore: 7.0 + Math.random() * 1.5,
          behavioralScore: 7.2 + Math.random() * 1.5,
          codingScore: 7.5 + Math.random() * 1.5,
          systemDesignScore: 7.0 + Math.random() * 1.5
        };
    }
  };

  const scores = getScoresByType(interview.type);
  const overallScore = Math.min(10, (scores.technicalScore + scores.behavioralScore + scores.codingScore + scores.systemDesignScore) / 4);

  // Generate feedback based on position and scores
  const generateFeedback = () => {
    const strengths = [
      `Demonstrated excellent knowledge in ${interview.position.toLowerCase()} technologies`,
      `Strong problem-solving approach and analytical thinking`,
      `Great communication skills when explaining technical concepts`,
      `Showed enthusiasm and genuine interest in the ${interview.position} role`
    ];

    const improvements = [
      `Could benefit from more experience with advanced system architecture`,
      `Consider practicing more complex algorithm challenges`,
      `Work on optimizing code performance and scalability`
    ];

    const notes = [
      `Candidate showed great potential for the ${interview.position} position`,
      `Technical depth was impressive, especially in core technologies`,
      `Good cultural fit with collaborative mindset and eagerness to learn`
    ];

    const recommendation = overallScore >= 8 ? 'Strong Hire' : 
                          overallScore >= 6.5 ? 'Hire' : 
                          overallScore >= 5 ? 'No Hire' : 'Strong No Hire';

    return { strengths, improvements, notes, recommendation };
  };

  const feedback = generateFeedback();

  return {
    interviewId: interview.id,
    candidateName: interview.candidateName,
    candidateEmail: interview.candidateEmail,
    position: interview.position,
    interviewer: interview.interviewerName,
    date: interview.scheduledDate,
    duration: interview.duration,
    performance: {
      overallScore: Math.round(overallScore * 10) / 10,
      technicalScore: Math.round(scores.technicalScore * 10) / 10,
      behavioralScore: Math.round(scores.behavioralScore * 10) / 10,
      codingScore: Math.round(scores.codingScore * 10) / 10,
      systemDesignScore: Math.round(scores.systemDesignScore * 10) / 10,
      totalQuestions: interview.type === 'system_design' ? 6 : 8,
      answeredQuestions: interview.type === 'system_design' ? 5 : 7,
      timeSpent: interview.duration,
      averageResponseTime: 30 + Math.floor(Math.random() * 30)
    },
    feedback: {
      strengths: feedback.strengths,
      areasForImprovement: feedback.improvements,
      specificNotes: feedback.notes,
      recommendation: feedback.recommendation as any,
      nextRound: feedback.recommendation.includes('Hire') ? 
        interview.type === 'technical' ? 'System Design Round with Senior Engineer' :
        interview.type === 'behavioral' ? 'Technical Round with Team Lead' :
        'Final round with Engineering Manager' : undefined
    },
    nextSteps: {
      timeline: "We'll get back to you within 3-5 business days",
      contact: `${interview.interviewerEmail} or HR at hr@company.com`,
      additionalInfo: `Thank you for interviewing for the ${interview.position} position. We'll be reviewing all candidates and will reach out soon with next steps.`
    }
  };
};

const PostInterviewPage: React.FC = () => {
  const { interviewId } = useParams<{ interviewId: string }>();
  const navigate = useNavigate();

  // Get interview data from database and generate performance data
  const interviewData = React.useMemo(() => {
    if (!interviewId) return null;
    
    const interview = db.getInterviewById(interviewId);
    if (!interview) return null;
    
    // Mark interview as completed when accessing post-interview page
    if (interview.status !== 'completed') {
      db.updateInterview(interviewId, { status: 'completed' });
    }
    
    return generateMockPerformanceData(interview);
  }, [interviewId]);

  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };

  if (!interviewData) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading interview results...</div>
      </div>
    );
  }

  return (
    <PostInterviewSummary
      interviewData={interviewData}
      onBackToDashboard={handleBackToDashboard}
    />
  );
};

export default PostInterviewPage;