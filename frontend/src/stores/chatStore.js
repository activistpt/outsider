import { create } from 'zustand';

const useChatStore = create((set) => ({
  messages: [],
  users: [],
  currentRoom: 'general',
  
  setMessages: (messages) => set({ messages }),
  addMessage: (message) => set((state) => ({ 
    messages: [...state.messages, message] 
  })),
  setUsers: (users) => set({ users }),
  setCurrentRoom: (room) => set({ currentRoom: room })
}));

export default useChatStore;
