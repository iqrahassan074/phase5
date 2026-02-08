
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, Type } from '@google/genai';
import { ICONS } from '../constants';
import { Priority, RecurrenceRule, Task } from '../types';

interface TaskChatInputProps {
  onTaskCreated: (task: Omit<Task, 'id' | 'createdAt' | 'isCompleted'>) => void;
  isOpen: boolean;
  onClose: () => void;
}

const TaskChatInput: React.FC<TaskChatInputProps> = ({ onTaskCreated, isOpen, onClose }) => {
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'ai'; text: string }[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userText = inputValue;
    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    setInputValue('');
    setIsLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: userText,
        config: {
          systemInstruction: `You are TaskFlow AI, an advanced productivity agent. Today is ${new Date().toLocaleString()}. Respond in JSON with fields: title, description, dueDate, reminderTime, priority, tags, recurrence, isTaskCreation (boolean), conversationalResponse.`,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              description: { type: Type.STRING },
              dueDate: { type: Type.STRING },
              reminderTime: { type: Type.STRING },
              priority: { type: Type.STRING, enum: ['LOW', 'MEDIUM', 'HIGH'] },
              tags: { type: Type.ARRAY, items: { type: Type.STRING } },
              recurrence: { type: Type.STRING, enum: ['DAILY', 'WEEKLY', 'MONTHLY', 'NONE'] },
              isTaskCreation: { type: Type.BOOLEAN },
              conversationalResponse: { type: Type.STRING }
            },
            required: ['isTaskCreation', 'conversationalResponse']
          }
        },
      });

      const result = JSON.parse(response.text);

      if (result.isTaskCreation) {
        onTaskCreated({
          title: result.title || "New Task",
          description: result.description || "",
          dueDate: result.dueDate || new Date().toISOString(),
          reminderTime: result.reminderTime,
          priority: (result.priority as Priority) || Priority.MEDIUM,
          tags: result.tags || [],
          recurrence: (result.recurrence as RecurrenceRule) || RecurrenceRule.NONE,
        });
      }

      setMessages(prev => [...prev, { role: 'ai', text: result.conversationalResponse }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'ai', text: "Service error. Please try again." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Mobile Overlay */}
      <div 
        className={`fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />

      <div className={`fixed lg:static inset-y-0 right-0 w-full sm:w-96 h-full flex flex-col bg-white border-l border-slate-100 shadow-2xl lg:shadow-none z-50 transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}`}>
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-slate-900 flex items-center justify-center text-white shadow-xl shadow-slate-200">
              <ICONS.Sparkles />
            </div>
            <div>
              <h2 className="text-sm font-black text-slate-900 uppercase tracking-tighter">Flow Assist</h2>
              <p className="text-[10px] text-emerald-500 font-black uppercase tracking-widest mt-0.5">Ready</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="lg:hidden p-2 text-slate-400 hover:text-slate-900 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
        </div>

        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth custom-scrollbar"
        >
          {messages.length === 0 && (
            <div className="bg-slate-50 rounded-[2rem] p-6 border border-slate-100/50">
              <p className="text-sm text-slate-900 font-bold leading-relaxed mb-4">
                Hey! Describe what you want to do, and I'll handle the scheduling.
              </p>
              <div className="space-y-3">
                {["Sync with team tomorrow at 10am #work", "Book gym sessions daily starting now"].map(suggestion => (
                  <button 
                    key={suggestion}
                    onClick={() => setInputValue(suggestion)}
                    className="w-full text-left p-3 rounded-2xl bg-white border border-slate-100 text-xs font-bold text-indigo-600 hover:border-indigo-200 transition-all shadow-sm"
                  >
                    "{suggestion}"
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
              <div className={`max-w-[90%] rounded-[1.5rem] px-5 py-4 text-sm font-bold shadow-sm leading-relaxed ${
                msg.role === 'user' 
                  ? 'bg-slate-900 text-white rounded-br-none' 
                  : 'bg-indigo-50 text-indigo-900 rounded-bl-none border border-indigo-100'
              }`}>
                {msg.text}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-slate-50 border border-slate-100 rounded-[1.5rem] rounded-bl-none p-4 shadow-sm flex gap-1.5">
                <span className="w-1.5 h-1.5 bg-slate-900 rounded-full animate-bounce"></span>
                <span className="w-1.5 h-1.5 bg-slate-900 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-1.5 h-1.5 bg-slate-900 rounded-full animate-bounce [animation-delay:0.4s]"></span>
              </div>
            </div>
          )}
        </div>

        <div className="p-6 bg-white border-t border-slate-100">
          <div className="relative group">
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="What's next?"
              className="w-full bg-slate-50 border border-slate-200/50 rounded-[1.5rem] py-4 pl-6 pr-14 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all resize-none min-h-[60px]"
              rows={1}
            />
            <button 
              onClick={handleSend}
              disabled={isLoading || !inputValue.trim()}
              className="absolute right-3 bottom-3 p-2.5 bg-slate-900 text-white rounded-2xl hover:bg-slate-800 disabled:opacity-20 transition-all shadow-xl active:scale-90"
            >
              <ICONS.Send />
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default TaskChatInput;
