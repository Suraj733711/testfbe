import React, { useState, useEffect, useRef } from 'react';
import '../App.css';

// Using environment variable for API URL
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Inject keyframe programmatically for the aura to avoid touching index.css further for this specific component
const styleEl = document.createElement('style');
styleEl.innerHTML = `
@keyframes saiyanAura {
  0% { box-shadow: 0 0 10px rgba(245, 158, 11, 0.4), 0 0 20px rgba(30, 58, 138, 0.2); }
  50% { box-shadow: 0 0 25px rgba(245, 158, 11, 0.9), 0 0 50px rgba(30, 58, 138, 0.8); }
  100% { box-shadow: 0 0 10px rgba(245, 158, 11, 0.4), 0 0 20px rgba(30, 58, 138, 0.2); }
}
`;
document.head.appendChild(styleEl);

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

const AIAssistant = ({ onUpdate, apiUrl }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [messages, setMessages] = useState([{ role: 'ai', text: 'I am Vegeta, Prince of all Saiyans. Tell me what tasks you need crushed today! ✦' }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  
  const recognition = useRef(null);

  useEffect(() => {
    if (SpeechRecognition) {
      recognition.current = new SpeechRecognition();
      recognition.current.continuous = false;
      recognition.current.interimResults = false;
      recognition.current.lang = 'en-US';

      recognition.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        handleSend(transcript);
      };

      recognition.current.onerror = (event) => {
        console.error('Speech recognition error', event.error);
        setIsListening(false);
      };

      recognition.current.onend = () => {
        setIsListening(false);
      };
    }
  }, []);

  const handleSend = async (text) => {
    if (!text.trim()) return;
    
    // Add user message
    setMessages(prev => [...prev, { role: 'user', text }]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch(`${apiUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text })
      });
      
      const data = await response.json();
      
      setMessages(prev => [...prev, { role: 'ai', text: data.response }]);
      
      // Speak the response via browser Text-to-Speech
      if (window.speechSynthesis) {
        const utterance = new SpeechSynthesisUtterance(data.response);
        
        // Vegeta voice tuning
        utterance.pitch = 0.5; // Deeper pitch
        utterance.rate = 1.1; // Slightly impatient speed
        
        const setAndSpeak = () => {
          const voices = window.speechSynthesis.getVoices();
          // Attempt to find a standard strong male voice
          const strongVoice = voices.find(v => 
            v.name.includes('David') || 
            v.name.includes('Mark') ||
            v.name.includes('Male') ||
            v.name.includes('UK English Male')
          );
          if (strongVoice) {
            utterance.voice = strongVoice;
          }
          window.speechSynthesis.speak(utterance);
        };

        // Voices sometimes load asynchronously in the browser
        if (window.speechSynthesis.getVoices().length === 0) {
          window.speechSynthesis.onvoiceschanged = setAndSpeak;
        } else {
          setAndSpeak();
        }
      }

      // If tasks were updated, trigger a refresh of the views
      if (data.actions_executed > 0 && onUpdate) {
        onUpdate();
      }

    } catch (err) {
      setMessages(prev => [...prev, { role: 'ai', text: 'Sorry, I had trouble connecting to the server.' }]);
    } finally {
      setLoading(false);
    }
  };

  const toggleListen = () => {
    if (isListening) {
      recognition.current?.stop();
    } else {
      // Small visual queue start
      setIsListening(true);
      recognition.current?.start();
    }
  };

  return (
    <>
      {isOpen && (
        <div style={{
          position: 'fixed', bottom: '80px', right: '24px', width: '340px', 
          background: '#1a1c23', border: '1px solid rgba(255,255,255,0.1)', 
          borderRadius: '16px', boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
          display: 'flex', flexDirection: 'column', zIndex: 1000, overflow: 'hidden',
          animation: 'fadeIn 0.2s ease-out'
        }}>
          <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontSize: '1rem', color: '#fff', fontWeight: 600 }}>✦ AI Assistant</h3>
            <button onClick={() => setIsOpen(false)} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '1.2rem', padding: '0 0.5rem' }}>✕</button>
          </div>
          
          <div style={{ height: '320px', overflowY: 'auto', padding: '1.5rem 1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {messages.map((msg, i) => (
              <div key={i} style={{ 
                alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                background: msg.role === 'user' ? '#1e3a8a' : 'rgba(248, 250, 252, 0.05)',
                color: msg.role === 'user' ? '#f8fafc' : '#f59e0b',
                padding: '0.75rem 1rem', borderRadius: '12px', maxWidth: '85%',
                fontSize: '0.9rem', lineHeight: 1.4,
                boxShadow: msg.role === 'user' ? '0 4px 12px rgba(30, 58, 138, 0.4)' : 'none',
                border: msg.role !== 'user' ? '1px solid rgba(245, 158, 11, 0.2)' : 'none'
              }}>
                {msg.text}
              </div>
            ))}
            {loading && <div style={{ color: '#f59e0b', fontSize: '0.85rem', alignSelf: 'flex-start', marginLeft: '0.5rem' }}>Powering up... ✧</div>}
          </div>

          <div style={{ padding: '1rem', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', gap: '0.5rem', background: '#020617' }}>
            <input 
              value={input} 
              onChange={e => setInput(e.target.value)}
              onKeyPress={e => e.key === 'Enter' && handleSend(input)}
              placeholder="Ask me anything..."
              style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '0.65rem 0.85rem', color: '#fff', fontSize: '0.9rem', outline: 'none' }}
              onFocus={(e) => e.target.style.borderColor = '#f59e0b'}
              onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
            />
            {SpeechRecognition && (
              <button onClick={toggleListen} title="Voice Command" style={{ background: isListening ? '#ef4444' : 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '8px', width: '42px', cursor: 'pointer', transition: '0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: '1.2rem' }}>{isListening ? '⏹' : '🎤'}</span>
              </button>
            )}
            <button onClick={() => handleSend(input)} style={{ background: '#1e3a8a', color: '#fff', border: '1px solid #f59e0b', borderRadius: '8px', padding: '0 1rem', cursor: 'pointer', fontWeight: 600 }}>
              Send
            </button>
          </div>
        </div>
      )}

      <button 
        onClick={() => setIsOpen(!isOpen)}
        title="Open AI Assistant"
        style={{
          position: 'fixed', bottom: '24px', right: '24px', width: '56px', height: '56px',
          borderRadius: '50%', background: 'linear-gradient(135deg, #1e3a8a, #172554)', border: '2px solid #f59e0b', color: '#f59e0b',
          boxShadow: '0 4px 16px rgba(245, 158, 11, 0.3)', cursor: 'pointer', zIndex: 1000,
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem',
          transition: 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          animation: 'saiyanAura 2s infinite'
        }}
        onMouseEnter={(e) => { e.target.style.transform = 'scale(1.1)'; e.target.style.animation = 'none'; e.target.style.boxShadow = '0 0 20px rgba(245, 158, 11, 0.8)'; }}
        onMouseLeave={(e) => { e.target.style.transform = 'scale(1)'; e.target.style.animation = 'saiyanAura 2s infinite'; }}
      >
        V
      </button>
    </>
  );
};

export default AIAssistant;
