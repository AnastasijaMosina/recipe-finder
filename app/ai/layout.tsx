import { AiConversationProvider } from '../domain/ai/AiConversationContext';

export default function AiLayout({ children }: { children: React.ReactNode }) {
  return <AiConversationProvider>{children}</AiConversationProvider>;
}
