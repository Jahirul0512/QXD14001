import React, { useState, useCallback, useRef, useEffect } from 'react';
import { ChatMessage, Recommendation } from './types';
import { sendMessage } from './services/geminiService';
import { SendIcon, LoadingSpinner, RisenovaLogoIcon, AlertTriangleIcon, TrashIcon } from './components/Icons';
import { MarkdownRenderer } from './components/MarkdownRenderer';
import { HtmlRenderer } from './components/HtmlRenderer';
import { ConfirmationModal } from './components/ConfirmationModal';
import { RecommendationCard } from './components/RecommendationCard';

const initialMessage: ChatMessage = { 
    role: 'model', content: "Hello! I'm your AI assistant. How can I help you today?" 
};

const RECOMMENDATION_REGEX = /```json:recommendations\s*([\s\S]*?)\s*```/;

const parseRecommendations = (content: string): { recommendations: Recommendation[] | null, cleanedContent: string } => {
    const match = content.match(RECOMMENDATION_REGEX);
    if (!match || !match[1]) {
        return { recommendations: null, cleanedContent: content };
    }

    try {
        const jsonString = match[1];
        const recommendations = JSON.parse(jsonString);
        
        if (!Array.isArray(recommendations) || recommendations.some(r => typeof r.title !== 'string' || typeof r.rationale !== 'string' || !Array.isArray(r.actionItems))) {
            return { recommendations: null, cleanedContent: content };
        }

        const cleanedContent = content.replace(RECOMMENDATION_REGEX, '').trim();
        return { recommendations, cleanedContent };
    } catch (error) {
        console.error("Failed to parse recommendations JSON:", error);
        return { recommendations: null, cleanedContent: content };
    }
};

const App: React.FC = () => {
    const [messages, setMessages] = useState<ChatMessage[]>(() => {
        try {
            const savedMessages = localStorage.getItem('chatHistory');
            if (savedMessages) {
                const parsedMessages = JSON.parse(savedMessages);
                if (Array.isArray(parsedMessages) && parsedMessages.length > 0) {
                    return parsedMessages;
                }
            }
        } catch (error) {
            console.error("Failed to load messages from localStorage", error);
        }
        return [initialMessage];
    });

    const [input, setInput] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [isClearModalOpen, setIsClearModalOpen] = useState<boolean>(false);
    const chatContainerRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);


    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [messages, isLoading]);

    // Save messages to local storage, and clear it when chat is reset.
    useEffect(() => {
        try {
            const isInitialState = messages.length === 1 && messages[0].content === initialMessage.content;
            if (isInitialState && messages.length > 0) { // Check length to avoid clearing on initial empty state
                localStorage.removeItem('chatHistory');
            } else if (messages.length > 0) {
                localStorage.setItem('chatHistory', JSON.stringify(messages));
            }
        } catch (error) {
            console.error("Failed to save messages to localStorage", error);
        }
    }, [messages]);
    
    // Auto-resize textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto'; // Reset height
            const scrollHeight = textareaRef.current.scrollHeight;
            textareaRef.current.style.height = `${scrollHeight}px`;
        }
    }, [input]);

    const isHtml = (content: string): boolean => {
        const trimmedContent = content.trim().toLowerCase();
        return trimmedContent.startsWith('<!doctype html>') || trimmedContent.startsWith('<html>');
    };


    const handleSend = useCallback(async () => {
        const trimmedInput = input.trim();
        if (!trimmedInput || isLoading) {
            return;
        }

        setIsLoading(true);
        setError(null);

        const userMessage: ChatMessage = { role: 'user', content: trimmedInput };
        setMessages(prev => [...prev, userMessage]);
        setInput('');

        try {
            const response = await sendMessage(trimmedInput);
            const { recommendations, cleanedContent } = parseRecommendations(response);
            const modelMessage: ChatMessage = { 
                role: 'model', 
                content: cleanedContent,
                recommendations: recommendations || undefined,
            };
            setMessages(prev => [...prev, modelMessage]);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
            setError(errorMessage);
             const errorResponseMessage: ChatMessage = { role: 'model', content: `Sorry, something went wrong: ${errorMessage}` };
            setMessages(prev => [...prev, errorResponseMessage]);
        } finally {
            setIsLoading(false);
        }
    }, [input, isLoading]);

    const handleRetry = useCallback(async () => {
        const lastUserMessage = [...messages].reverse().find(msg => msg.role === 'user');

        if (!lastUserMessage) {
            setError("Could not find a message to retry. Please type a new message.");
            return;
        }

        setIsLoading(true);
        setError(null);

        // Remove the previous error model message
        setMessages(prev => prev.slice(0, -1));

        try {
            const response = await sendMessage(lastUserMessage.content);
            const { recommendations, cleanedContent } = parseRecommendations(response);
            const modelMessage: ChatMessage = { 
                role: 'model', 
                content: cleanedContent,
                recommendations: recommendations || undefined,
            };
            setMessages(prev => [...prev, modelMessage]);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
            setError(errorMessage);
            const errorResponseMessage: ChatMessage = { role: 'model', content: `Sorry, something went wrong: ${errorMessage}` };
            setMessages(prev => [...prev, errorResponseMessage]);
        } finally {
            setIsLoading(false);
        }
    }, [messages]);
    
    const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const confirmClearChat = useCallback(() => {
        setMessages([initialMessage]);
        setError(null);
        setIsClearModalOpen(false);
    }, []);

    return (
        <div className="flex flex-col h-screen bg-brand-bg text-brand-text-primary font-sans">
            <header className="bg-brand-surface border-b border-brand-border p-4 flex-shrink-0">
                <div className="container mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3">
                         <RisenovaLogoIcon className="w-6 h-6 text-brand-primary" />
                         <h1 className="text-xl font-bold text-brand-text-primary">Risenova</h1>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="text-brand-text-secondary text-sm hidden sm:block">Conversational AI</div>
                        <button
                            onClick={() => setIsClearModalOpen(true)}
                            className="flex items-center gap-2 px-3 py-1.5 text-sm text-brand-text-secondary border border-brand-border rounded-md hover:bg-brand-border hover:text-brand-text-primary transition-colors duration-200"
                            aria-label="Clear chat history"
                        >
                           <TrashIcon className="w-4 h-4" />
                           <span className="hidden sm:inline">Clear Chat</span>
                        </button>
                    </div>
                </div>
            </header>

            <main ref={chatContainerRef} className="flex-grow p-4 md:p-6 overflow-y-auto">
                <div className="container mx-auto space-y-4 md:space-y-6">
                    {messages.map((msg, index) => (
                        <div key={index} className={`flex items-end gap-3 animate-fade-in ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                           {msg.role === 'model' && <div className="w-8 h-8 rounded-full bg-brand-secondary flex items-center justify-center flex-shrink-0"><RisenovaLogoIcon className="w-5 h-5 text-white"/></div>}
                            <div className={`p-4 rounded-2xl ${
                                msg.role === 'user' 
                                ? 'bg-user-bubble rounded-br-none max-w-[90%] md:max-w-[80%] lg:max-w-2xl' 
                                : 'bg-model-bubble rounded-bl-none border border-brand-border max-w-[90%] md:max-w-[90%] lg:max-w-4xl'
                            }`}>
                                {msg.role === 'model' ? (
                                    <div>
                                        {isHtml(msg.content) ? (
                                            <HtmlRenderer htmlContent={msg.content} />
                                        ) : (
                                            msg.content && <MarkdownRenderer content={msg.content} />
                                        )}
                                        {msg.recommendations && msg.recommendations.length > 0 && (
                                            <div className="mt-4 border-t border-brand-border pt-4">
                                                <h3 className="text-lg font-semibold text-brand-text-primary mb-3">Recommendations</h3>
                                                {msg.recommendations.map((rec, i) => (
                                                    <RecommendationCard key={`${index}-${i}`} recommendation={rec} />
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <p className="text-brand-text-primary whitespace-pre-wrap">{msg.content}</p>
                                )}
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex items-end gap-3 animate-fade-in justify-start">
                            <div className="w-8 h-8 rounded-full bg-brand-secondary flex items-center justify-center flex-shrink-0">
                                <RisenovaLogoIcon className="w-5 h-5 text-white" />
                            </div>
                            <div className="p-4 rounded-2xl bg-model-bubble rounded-bl-none border border-brand-border">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-brand-primary rounded-full animate-[typing-bubble_1.2s_ease-in-out_infinite]"></div>
                                    <div className="w-2 h-2 bg-brand-primary rounded-full animate-[typing-bubble_1.2s_ease-in-out_0.2s_infinite]"></div>
                                    <div className="w-2 h-2 bg-brand-primary rounded-full animate-[typing-bubble_1.2s_ease-in-out_0.4s_infinite]"></div>
                                </div>
                            </div>
                        </div>
                    )}
                     {error && (
                        <div role="alert" className="bg-red-900/50 border border-red-500 text-red-300 p-4 rounded-lg flex items-center justify-between animate-fade-in">
                            <div className="flex items-center">
                                <AlertTriangleIcon className="w-6 h-6 mr-3 flex-shrink-0" />
                                <div>
                                    <h3 className="font-bold">Error</h3>
                                    <p className="text-sm">{error}</p>
                                </div>
                            </div>
                            <button
                                onClick={handleRetry}
                                className="ml-4 px-3 py-1.5 text-sm font-semibold bg-red-500/20 border border-red-500 rounded-md hover:bg-red-500/40 transition-colors duration-200 flex-shrink-0"
                                aria-label="Retry sending the message"
                            >
                                Retry
                            </button>
                        </div>
                    )}
                </div>
            </main>
            
            <footer className="p-4 md:p-6 bg-brand-surface border-t border-brand-border flex-shrink-0">
                <div className="container mx-auto">
                    <div className="relative flex items-end">
                        <textarea
                            ref={textareaRef}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyPress}
                            className="w-full max-h-40 p-3 pr-14 bg-brand-bg border border-brand-border rounded-lg focus:ring-2 focus:ring-brand-primary focus:outline-none transition text-sm resize-none overflow-y-auto"
                            placeholder="Type your message..."
                            disabled={isLoading}
                            aria-label="Chat input"
                            rows={1}
                        />
                        <button
                            onClick={handleSend}
                            disabled={isLoading || !input.trim()}
                            className="absolute right-3 bottom-2.5 p-2 bg-brand-primary hover:bg-brand-secondary text-white font-semibold rounded-md transition-colors duration-300 disabled:bg-gray-500 disabled:cursor-not-allowed"
                            aria-label="Send message"
                        >
                           <SendIcon className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </footer>
             <ConfirmationModal
                isOpen={isClearModalOpen}
                onClose={() => setIsClearModalOpen(false)}
                onConfirm={confirmClearChat}
                title="Clear Conversation"
            >
                Are you sure you want to delete the entire chat history? This action cannot be undone.
            </ConfirmationModal>
        </div>
    );
};

export default App;
