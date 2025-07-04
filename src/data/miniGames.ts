import { MiniGame } from '@/types'

export const miniGames: MiniGame[] = [
  {
    id: 'match-the-feeling',
    title: 'Match the Feeling',
    description: 'Drag emotions to match the right situations',
    type: 'matching',
    duration: 120,
    difficulty: 'easy',
    content: {
      pairs: [
        { emotion: '😊', situation: 'Getting a good grade on a test' },
        { emotion: '😢', situation: 'Losing your favorite toy' },
        { emotion: '😠', situation: 'Someone cuts in line' },
        { emotion: '😰', situation: 'Speaking in front of the class' },
        { emotion: '😴', situation: 'Staying up too late' },
        { emotion: '🤗', situation: 'Hugging a friend' }
      ]
    }
  },
  {
    id: 'what-would-you-do',
    title: 'What Would You Do?',
    description: 'Choose the best response to different situations',
    type: 'scenario',
    duration: 180,
    difficulty: 'medium',
    content: {
      scenarios: [
        {
          situation: 'Your friend accidentally breaks your pencil during art class.',
          options: [
            { text: 'Get angry and yell at them', points: 0, feedback: 'This might hurt your friendship. Try a calmer approach.' },
            { text: 'Say "It\'s okay, accidents happen"', points: 3, feedback: 'Great! You showed understanding and kindness.' },
            { text: 'Ignore them for the rest of the day', points: 1, feedback: 'This might make things worse. Communication is better.' },
            { text: 'Ask the teacher for a new pencil', points: 2, feedback: 'Good problem-solving, but talking to your friend first would be even better.' }
          ]
        },
        {
          situation: 'You feel overwhelmed with homework and want to give up.',
          options: [
            { text: 'Take deep breaths and break it into smaller parts', points: 3, feedback: 'Excellent strategy! Breaking big tasks into smaller ones helps.' },
            { text: 'Throw your books and storm off', points: 0, feedback: 'This won\'t solve the problem. Try a calming strategy instead.' },
            { text: 'Ask a parent or teacher for help', points: 3, feedback: 'Great choice! Asking for help shows wisdom.' },
            { text: 'Copy from a friend', points: 0, feedback: 'This isn\'t honest and won\'t help you learn.' }
          ]
        }
      ]
    }
  },
  {
    id: 'emotion-detective',
    title: 'Emotion Detective',
    description: 'Identify emotions from facial expressions and body language',
    type: 'quiz',
    duration: 150,
    difficulty: 'easy',
    content: {
      questions: [
        {
          question: 'What emotion is this person showing?',
          image: '😊',
          options: ['Happy', 'Sad', 'Angry', 'Scared'],
          correct: 0,
          explanation: 'A smile usually means someone is happy or content!'
        },
        {
          question: 'If someone has their arms crossed and is frowning, they might be:',
          options: ['Excited', 'Upset or defensive', 'Sleepy', 'Hungry'],
          correct: 1,
          explanation: 'Crossed arms and frowning often show someone is upset or protecting themselves.'
        },
        {
          question: 'When someone is fidgeting and looking around, they might feel:',
          options: ['Calm', 'Nervous or anxious', 'Angry', 'Bored'],
          correct: 1,
          explanation: 'Fidgeting and looking around can be signs of nervousness or anxiety.'
        }
      ]
    }
  }
]