import { useState } from 'react';
import { MessageCircle, X, Send } from 'lucide-react';
import { apiService } from '../services/api';
import './AIChatWidget.css';

interface Message {
    role: 'user' | 'assistant';
    content: string;
    timestamp: string;
}

export default function AIChatWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSend = async () => {
        if (!input.trim() || loading) return;

        const userMessage: Message = {
            role: 'user',
            content: input,
            timestamp: new Date().toISOString(),
        };

        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setLoading(true);

        try {
            const response = await apiService.chat(input);

            const assistantMessage: Message = {
                role: 'assistant',
                content: response.message,
                timestamp: response.timestamp,
            };

            setMessages(prev => [...prev, assistantMessage]);
        } catch (error) {
            console.error('Chat error:', error);
            const errorMessage: Message = {
                role: 'assistant',
                content: 'Lo siento, hubo un error. Por favor intenta de nuevo.',
                timestamp: new Date().toISOString(),
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <>
            {/* Floating Chat Button */}
            {!isOpen && (
                <button className="chat-fab" onClick={() => setIsOpen(true)}>
                    <MessageCircle size={24} />
                </button>
            )}

            {/* Chat Window */}
            {isOpen && (
                <div className="chat-widget">
                    <div className="chat-header">
                        <div className="chat-header-content">
                            <MessageCircle size={20} />
                            <h3>Asistente IA</h3>
                        </div>
                        <button className="chat-close" onClick={() => setIsOpen(false)}>
                            <X size={20} />
                        </button>
                    </div>

                    <div className="chat-messages">
                        {messages.length === 0 && (
                            <div className="chat-empty">
                                <MessageCircle size={48} />
                                <p>¡Hola! Soy tu asistente de productividad.</p>
                                <p className="chat-hint">Pregúntame sobre tus tareas o pídeme consejos.</p>
                            </div>
                        )}
                        {messages.map((msg, idx) => (
                            <div key={idx} className={`chat-message ${msg.role}`}>
                                <div className="message-content">{msg.content}</div>
                            </div>
                        ))}
                        {loading && (
                            <div className="chat-message assistant">
                                <div className="message-content loading">
                                    <span></span><span></span><span></span>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="chat-input">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="Escribe tu mensaje..."
                            disabled={loading}
                        />
                        <button onClick={handleSend} disabled={!input.trim() || loading}>
                            <Send size={20} />
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}
