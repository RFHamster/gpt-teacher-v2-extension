export interface ChatSessionMetadata {
    sessionId: string;
    itemId: string;
    itemTitle: string;
    startedAt: string;
    status: 'active' | 'ended';
}

export interface ChatMessage {
    id: string;
    content: string;
    sender: 'user' | 'assistant';
    timestamp: string;
}

export interface ChatCacheData {
    session: ChatSessionMetadata;
    messages: ChatMessage[];
}
