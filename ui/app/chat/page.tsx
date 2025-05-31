"use client"
import { useEffect } from 'react';
import '@n8n/chat/style.css';
import './chat.css';
import { createChat } from '@n8n/chat';

export default function ChatPage() {
  useEffect(() => {
    createChat({
        webhookUrl: '',
        webhookConfig: {
            method: 'POST',
            headers: {}
        },
        target: '#n8n-chat',
        mode: 'fullscreen',
        chatInputKey: 'chatInput',
        chatSessionKey: 'sessionId',
        metadata: {},
        showWelcomeScreen: true,
        defaultLanguage: 'en',
        initialMessages: [
            'Hi there! 👋',
            'My name is Nathan. And i hate juventus'
        ],
        i18n: {
            en: {
                title: 'Hi there! 👋',
                subtitle: "Start a chat. We're here to help you 24/7.",
                footer: '',
                getStarted: 'New Conversation',
                inputPlaceholder: 'Type your question..',
            },
        },
    });
  }, []);

  return (
    <>
      <div id="n8n-chat"></div>
      {/* Global chat styles moved to chat.css */}
    </>
  );
}