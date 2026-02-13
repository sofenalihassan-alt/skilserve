import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Header } from '@/components/Header';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useLanguage } from '@/contexts/LanguageContext';
import { Send, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { messageSchema, getSafeErrorMessage } from '@/lib/validation';

interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  message: string;
  created_at: string;
  is_read: boolean;
}

interface Conversation {
  userId: string;
  userName: string;
  lastMessage: string;
  unreadCount: number;
}

interface ProviderProfile {
  business_name: string;
  category: string;
  hourly_rate: number;
  avatar_url: string | null;
  full_name: string;
}

const Messages = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();
  const location = useLocation();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedProviderProfile, setSelectedProviderProfile] = useState<ProviderProfile | null>(null);

  useEffect(() => {
    if (user) {
      fetchConversations();
      subscribeToMessages();
      
      // Auto-select provider from navigation state
      const state = location.state as { providerId?: string; providerName?: string } | null;
      if (state?.providerId) {
        setSelectedUserId(state.providerId);
      }
    }
  }, [user]);

  useEffect(() => {
    if (selectedUserId && user) {
      fetchMessages(selectedUserId);
      fetchProviderProfile(selectedUserId);
    }
  }, [selectedUserId, user]);

  const fetchProviderProfile = async (userId: string) => {
    const { data: providerData, error: providerError } = await supabase
      .from('service_providers')
      .select('business_name, category, hourly_rate')
      .eq('user_id', userId)
      .maybeSingle();

    const { data: profileData } = await supabase
      .from('profiles')
      .select('avatar_url, full_name')
      .eq('id', userId)
      .maybeSingle();

    if (!providerError && providerData) {
      setSelectedProviderProfile({
        ...providerData,
        avatar_url: profileData?.avatar_url || null,
        full_name: profileData?.full_name || 'User',
      });
    } else {
      setSelectedProviderProfile(null);
    }
  };

  const fetchConversations = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching conversations:', error);
      return;
    }

    // Group messages by conversation partner and fetch names
    const convMap = new Map<string, Conversation>();
    const userIds = new Set<string>();

    data?.forEach((msg) => {
      const partnerId = msg.sender_id === user.id ? msg.receiver_id : msg.sender_id;
      userIds.add(partnerId);
      
      if (!convMap.has(partnerId)) {
        convMap.set(partnerId, {
          userId: partnerId,
          userName: '',
          lastMessage: msg.message,
          unreadCount: 0,
        });
      }

      if (msg.receiver_id === user.id && !msg.is_read) {
        const conv = convMap.get(partnerId)!;
        conv.unreadCount++;
      }
    });

    // Fetch user names
    if (userIds.size > 0) {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('id', Array.from(userIds));

      profiles?.forEach((profile) => {
        const conv = convMap.get(profile.id);
        if (conv) {
          conv.userName = profile.full_name || 'Unknown User';
        }
      });
    }

    setConversations(Array.from(convMap.values()));
  };

  const fetchMessages = async (partnerId: string) => {
    if (!user) return;

    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .or(`and(sender_id.eq.${user.id},receiver_id.eq.${partnerId}),and(sender_id.eq.${partnerId},receiver_id.eq.${user.id})`)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching messages:', error);
      return;
    }

    setMessages(data || []);

    // Mark messages as read
    await supabase
      .from('messages')
      .update({ is_read: true })
      .eq('receiver_id', user.id)
      .eq('sender_id', partnerId);
  };

  const subscribeToMessages = () => {
    if (!user) return;

    const channel = supabase
      .channel('messages')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
          filter: `receiver_id=eq.${user.id}`,
        },
        () => {
          fetchConversations();
          if (selectedUserId) {
            fetchMessages(selectedUserId);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const sendMessage = async () => {
    if (!selectedUserId || !user) return;

    // Validate message with zod
    const validation = messageSchema.safeParse({ message: newMessage });
    
    if (!validation.success) {
      const firstError = validation.error.errors[0];
      toast({
        title: 'Validation Error',
        description: firstError.message,
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    const { error } = await supabase.from('messages').insert({
      sender_id: user.id,
      receiver_id: selectedUserId,
      message: validation.data.message,
    });

    if (error) {
      toast({
        title: 'Error',
        description: getSafeErrorMessage(error),
        variant: 'destructive',
      });
    } else {
      setNewMessage('');
      fetchMessages(selectedUserId);
      fetchConversations();
    }
    setLoading(false);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <p className="text-center">{t('login')} to view messages</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">{t('messages')}</h1>
        
        <div className="grid md:grid-cols-3 gap-4 h-[600px]">
          {/* Conversations List */}
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle>{t('all_messages')}</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[500px]">
                {conversations.length === 0 ? (
                  <p className="text-center text-muted-foreground p-4">{t('no_messages')}</p>
                ) : (
                  conversations.map((conv) => (
                    <div
                      key={conv.userId}
                      onClick={() => setSelectedUserId(conv.userId)}
                      className={`p-4 border-b cursor-pointer hover:bg-muted/50 transition-colors ${
                        selectedUserId === conv.userId ? 'bg-muted' : ''
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold truncate">{conv.userName}</p>
                          <p className="text-sm text-muted-foreground truncate">
                            {conv.lastMessage}
                          </p>
                        </div>
                        {conv.unreadCount > 0 && (
                          <div className="h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs">
                            {conv.unreadCount}
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Messages Area */}
          <Card className="md:col-span-2">
            {selectedUserId ? (
              <>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    {selectedProviderProfile && (
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={selectedProviderProfile.avatar_url || undefined} />
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {selectedProviderProfile.full_name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <div className="flex-1 space-y-1">
                      <CardTitle>
                        {conversations.find((c) => c.userId === selectedUserId)?.userName || 'Chat'}
                      </CardTitle>
                      {selectedProviderProfile && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span className="capitalize">{selectedProviderProfile.category}</span>
                          <span>•</span>
                          <span>${selectedProviderProfile.hourly_rate}/hr</span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex flex-col h-[520px]">
                  <ScrollArea className="flex-1 pr-4">
                    <div className="space-y-4">
                      {messages.map((msg) => (
                        <div
                          key={msg.id}
                          className={`flex ${
                            msg.sender_id === user.id ? 'justify-end' : 'justify-start'
                          }`}
                        >
                          <div
                            className={`max-w-[70%] rounded-lg p-3 ${
                              msg.sender_id === user.id
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted'
                            }`}
                          >
                            <p className="break-words">{msg.message}</p>
                            <p className="text-xs opacity-70 mt-1">
                              {new Date(msg.created_at).toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                  
                  <div className="flex gap-2 mt-4">
                    <Input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder={t('type_message')}
                      onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                      disabled={loading}
                    />
                    <Button onClick={sendMessage} disabled={loading || !newMessage.trim()}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground">
                <p>Select a conversation to start messaging</p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Messages;
