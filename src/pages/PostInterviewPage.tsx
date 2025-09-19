import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PostInterviewSummary } from '../components';
import { db } from '../database';
import { faceDetectionLogger } from '../utils/faceDetectionLogger';
import { useProctoringViolations } from '../hooks/useProctoringViolations';
import type { PostInterviewData, ProctoringViolationSummary, FaceDetectionSummary } from '../types';
import type { ProctoringEvent } from '../proctoring/types';

// Generate interview summary with real proctoring and face detection data
const generateInterviewSummary = (interview: any): PostInterviewData => {
  // Get proctoring events from localStorage
  let proctoringEvents: ProctoringEvent[] = [];
  try {
    const storedEvents = localStorage.getItem(`proctoring_events_${interview.id}`);
    console.log(`🔍 Looking for proctoring events with key: proctoring_events_${interview.id}`);
    console.log('📦 Raw stored events:', storedEvents);
    
    if (storedEvents) {
      proctoringEvents = JSON.parse(storedEvents);
      console.log(`✅ Loaded ${proctoringEvents.length} proctoring events:`, proctoringEvents);
    } else {
      console.log('❌ No proctoring events found in localStorage');
      
      // Debug: List all localStorage keys that contain 'proctoring'
      console.log('🔍 All localStorage keys containing "proctoring":');
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.includes('proctoring')) {
          console.log(`  - ${key}: ${localStorage.getItem(key)?.substring(0, 100)}...`);
        }
      }
    }
  } catch (error) {
    console.warn('Failed to load proctoring events:', error);
  }

  // Use the proctoring violations hook to analyze events
  const { violations, violationCounts, stats } = useProctoringViolations(proctoringEvents);

  // Get face detection events from logger
  const faceDetectionEvents = faceDetectionLogger.getEvents();
  const interviewFaceEvents = faceDetectionEvents.filter(event => 
    event.page === 'interview' && 
    event.timestamp >= Date.now() - (interview.duration * 60 * 1000)
  );

  // Analyze face detection quality
  const analyzeFaceDetection = (): FaceDetectionSummary => {
    if (interviewFaceEvents.length === 0) {
      return {
        totalEvents: 0,
        faceDetectedTime: 0,
        noFaceTime: 100,
        multipleFacesTime: 0,
        qualityScore: 0,
        events: []
      };
    }

    const faceDetectedEvents = interviewFaceEvents.filter(e => e.event === 'single_face');
    const noFaceEvents = interviewFaceEvents.filter(e => e.event === 'no_face');
    const multipleFaceEvents = interviewFaceEvents.filter(e => e.event === 'multiple_faces');

    const totalEvents = interviewFaceEvents.length;
    
    // Calculate raw percentages (don't round yet)
    const faceDetectedRaw = (faceDetectedEvents.length / totalEvents) * 100;
    const noFaceRaw = (noFaceEvents.length / totalEvents) * 100;
    const multipleFacesRaw = (multipleFaceEvents.length / totalEvents) * 100;
    
    // Round percentages but ensure they sum to 100%
    let faceDetectedTime = Math.round(faceDetectedRaw * 10) / 10;
    let noFaceTime = Math.round(noFaceRaw * 10) / 10;
    let multipleFacesTime = Math.round(multipleFacesRaw * 10) / 10;
    
    // Adjust for rounding errors to ensure sum equals 100%
    const sum = faceDetectedTime + noFaceTime + multipleFacesTime;
    if (sum !== 100) {
      // Add/subtract the difference from the largest component
      if (faceDetectedTime >= noFaceTime && faceDetectedTime >= multipleFacesTime) {
        faceDetectedTime += (100 - sum);
      } else if (noFaceTime >= multipleFacesTime) {
        noFaceTime += (100 - sum);
      } else {
        multipleFacesTime += (100 - sum);
      }
      
      // Ensure no negative values
      faceDetectedTime = Math.max(0, faceDetectedTime);
      noFaceTime = Math.max(0, noFaceTime);
      multipleFacesTime = Math.max(0, multipleFacesTime);
    }

    // Calculate quality score based on face detection consistency and confidence
    const eventsWithConfidence = interviewFaceEvents.filter(e => e.confidence && e.confidence.length > 0);
    const avgConfidence = eventsWithConfidence.length > 0 
      ? eventsWithConfidence.reduce((sum, e) => sum + (e.confidence?.[0] || 0), 0) / eventsWithConfidence.length
      : 0;
    
    // Fix quality score calculation - avgConfidence is already 0-1, convert to 0-100 scale
    const confidenceScore = avgConfidence * 100;
    const qualityScore = Math.round((faceDetectedTime * 0.7) + (confidenceScore * 0.3));

    return {
      totalEvents,
      faceDetectedTime,
      noFaceTime,
      multipleFacesTime,
      qualityScore: Math.max(0, Math.min(100, qualityScore)),
      events: interviewFaceEvents.map(e => ({
        timestamp: e.timestamp,
        facesDetected: e.faceCount,
        confidence: e.confidence?.[0] || 0,
        page: e.page
      }))
    };
  };

  // Create proctoring summary
  const proctoringViolationSummary: ProctoringViolationSummary = {
    totalViolations: violationCounts.total,
    highSeverity: violationCounts.high,
    mediumSeverity: violationCounts.medium,
    lowSeverity: violationCounts.low,
    tabSwitches: stats.tabSwitches.count,
    windowSwitches: stats.windowSwitches.count,
    screenShareStops: violationCounts.screenShareStops,
    totalTabSwitchTime: stats.tabSwitches.totalTimeAway,
    totalWindowSwitchTime: stats.windowSwitches.totalTimeAway,
    violations: violations.map(v => ({
      type: v.type,
      timestamp: v.timestamp,
      description: v.description,
      severity: v.severity
    }))
  };

  const faceDetectionSummary = analyzeFaceDetection();
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
    proctoring: proctoringViolationSummary,
    faceDetection: faceDetectionSummary,
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
    
    return generateInterviewSummary(interview);
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