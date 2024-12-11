export interface User {
    id: string;
    email: string;
    username: string;
    password: string;
    createdAt: string;
  }
  
  export interface AudioItem {
    id: string;
    userId: string;
    username: string;
    url: string;
    duration: number;
    createdAt: string;
    status: 'pending' | 'playing' | 'completed';
  }
  
  export interface QueueState {
    items: AudioItem[];
    currentlyPlaying: AudioItem | null;
  }