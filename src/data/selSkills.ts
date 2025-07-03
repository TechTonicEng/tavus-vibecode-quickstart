import { SELSkill } from '@/types'

export const selSkills: SELSkill[] = [
  {
    id: 'deep-breathing',
    title: 'Deep Breathing',
    description: 'Learn to calm down with special breathing',
    instructions: [
      'Sit up straight and close your eyes',
      'Breathe in slowly through your nose for 4 counts',
      'Hold your breath for 4 counts',
      'Breathe out slowly through your mouth for 6 counts',
      'Repeat 3 times'
    ],
    category: 'breathing',
    duration: 120
  },
  {
    id: 'belly-breathing',
    title: 'Belly Breathing',
    description: 'Use your belly to breathe like a balloon',
    instructions: [
      'Put one hand on your chest, one on your belly',
      'Breathe in and make your belly grow like a balloon',
      'Breathe out and let your belly shrink',
      'Keep your chest hand still',
      'Do this 5 times slowly'
    ],
    category: 'breathing',
    duration: 90
  },
  {
    id: 'mindful-listening',
    title: 'Mindful Listening',
    description: 'Listen carefully to sounds around you',
    instructions: [
      'Sit quietly and close your eyes',
      'Listen for sounds far away',
      'Listen for sounds close to you',
      'Listen for sounds inside your body',
      'Open your eyes and share what you heard'
    ],
    category: 'mindfulness',
    duration: 180
  },
  {
    id: 'positive-self-talk',
    title: 'Positive Self-Talk',
    description: 'Say kind things to yourself',
    instructions: [
      'Think of something that made you worried',
      'Notice what you\'re telling yourself about it',
      'Change it to something kind and helpful',
      'Say: "I can handle this" or "I am brave"',
      'Practice saying it out loud'
    ],
    category: 'reframing',
    duration: 150
  },
  {
    id: 'gratitude-practice',
    title: 'Gratitude Practice',
    description: 'Think about good things in your life',
    instructions: [
      'Think of 3 things you\'re thankful for today',
      'They can be big or small',
      'Say why each one makes you happy',
      'Share one with someone you care about',
      'Remember this feeling'
    ],
    category: 'mindfulness',
    duration: 120
  },
  {
    id: 'friendship-skills',
    title: 'Making Friends',
    description: 'Learn how to be a good friend',
    instructions: [
      'Practice saying "Hi, want to play?"',
      'Listen when others talk to you',
      'Share your toys or games',
      'Say "please" and "thank you"',
      'Be kind even when you\'re upset'
    ],
    category: 'social',
    duration: 200
  }
]