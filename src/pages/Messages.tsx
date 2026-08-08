import { useState, useEffect, useRef } from 'react';
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
import { MessageSquareText, Trash2, MoreVertical, Phone as PhoneIcon, ArrowLeft, ImageIcon, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { messageSchema, getSafeErrorMessage } from '@/lib/validation';
import { ChatImageUpload, MAX_CHAT_IMAGES } from '@/components/ChatImageUpload';
import { ChatImageLightbox } from '@/components/ChatImageLightbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

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
  avatarUrl: string | null;
  category: string | null;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  phone: string | null;
}

const Messages = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();
  const location = useLocation();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedUserInfo, setSelectedUserInfo] = useState<{ name: string; avatarUrl: string | null; category: string | null; phone: string | null } | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'message' | 'conversation'; id?: string } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;
    fetchConversations();
    const channel = supabase.channel('messages-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'messages', filter: `receiver_id=eq.${user.id}` }, () => {
        fetchConversations();
        if (selectedUserId) fetchMessages(selectedUserId);
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'messages', filter: `sender_id=eq.${user.id}` }, () => {
        fetchConversations();
        if (selectedUserId) fetchMessages(selectedUserId);
      })
      .subscribe();

    // Handle navigation state for new conversations
    const state = location.state as { providerId?: string; providerName?: string } | null;
    if (state?.providerId) {
      setSelectedUserId(state.providerId);
      // Fetch user info for the new conversation partner
      fetchUserInfo(state.providerId);
    }

    return () => { supabase.removeChannel(channel); };
  }, [user]);

  useEffect(() => {
    if (selectedUserId && user) fetchMessages(selectedUserId);
  }, [selectedUserId, user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchUserInfo = async (userId: string) => {
    const [{ data: profile }, { data: provider }] = await Promise.all([
      supabase.from('profiles').select('full_name, avatar_url, phone').eq('id', userId).maybeSingle(),
      supabase.from('service_providers').select('category').eq('user_id', userId).maybeSingle(),
    ]);
    setSelectedUserInfo({
      name: profile?.full_name || 'Unknown User',
      avatarUrl: profile?.avatar_url || null,
      category: provider?.category || null,
      phone: profile?.phone || null,
    });
  };

  const fetchConversations = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('messages').select('*')
      .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
      .order('created_at', { ascending: false });
    if (error) return;

    const convMap = new Map<string, Conversation>();
    const userIds = new Set<string>();

    data?.forEach((msg) => {
      const partnerId = msg.sender_id === user.id ? msg.receiver_id : msg.sender_id;
      userIds.add(partnerId);
      if (!convMap.has(partnerId)) {
        convMap.set(partnerId, {
          userId: partnerId, userName: '', avatarUrl: null, category: null,
          lastMessage: msg.message, lastMessageTime: msg.created_at, unreadCount: 0, phone: null,
        });
      }
      if (msg.receiver_id === user.id && !msg.is_read) {
        convMap.get(partnerId)!.unreadCount++;
      }
    });

    if (userIds.size > 0) {
      const ids = Array.from(userIds);
      const [{ data: profiles }, { data: providers }] = await Promise.all([
        supabase.from('profiles').select('id, full_name, avatar_url, phone').in('id', ids),
        supabase.from('service_providers').select('user_id, category').in('user_id', ids),
      ]);
      const providerMap = new Map(providers?.map(p => [p.user_id, p.category]) || []);
      profiles?.forEach((profile) => {
        const conv = convMap.get(profile.id);
        if (conv) {
          conv.userName = profile.full_name || 'Unknown User';
          conv.avatarUrl = profile.avatar_url;
          conv.phone = profile.phone;
          conv.category = providerMap.get(profile.id) || null;
        }
      });
    }

    setConversations(Array.from(convMap.values()));
  };

  const fetchMessages = async (partnerId: string) => {
    if (!user) return;
    const { data } = await supabase.from('messages').select('*')
      .or(`and(sender_id.eq.${user.id},receiver_id.eq.${partnerId}),and(sender_id.eq.${partnerId},receiver_id.eq.${user.id})`)
      .order('created_at', { ascending: true });
    setMessages(data || []);
    await supabase.from('messages').update({ is_read: true }).eq('receiver_id', user.id).eq('sender_id', partnerId);
  };

  const sendMessage = async () => {
    if (!selectedUserId || !user) return;
    const validation = messageSchema.safeParse({ message: newMessage });
    if (!validation.success) {
      toast({ title: 'Validation Error', description: validation.error.errors[0].message, variant: 'destructive' });
      return;
    }
    setLoading(true);
    const { error } = await supabase.from('messages').insert({
      sender_id: user.id, receiver_id: selectedUserId, message: validation.data.message,
    });
    if (error) {
      toast({ title: 'Error', description: getSafeErrorMessage(error), variant: 'destructive' });
    } else {
      setNewMessage('');
      await fetchMessages(selectedUserId);
      await fetchConversations();
    }
    setLoading(false);
  };

  const handleDeleteMessage = (messageId: string) => {
    setDeleteTarget({ type: 'message', id: messageId });
    setDeleteDialogOpen(true);
  };

  const handleDeleteConversation = () => {
    if (!selectedUserId) return;
    setDeleteTarget({ type: 'conversation' });
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!user || !deleteTarget) return;
    if (deleteTarget.type === 'message' && deleteTarget.id) {
      await supabase.from('messages').delete().eq('id', deleteTarget.id);
      if (selectedUserId) await fetchMessages(selectedUserId);
    } else if (deleteTarget.type === 'conversation' && selectedUserId) {
      await supabase.from('messages').delete()
        .or(`and(sender_id.eq.${user.id},receiver_id.eq.${selectedUserId}),and(sender_id.eq.${selectedUserId},receiver_id.eq.${user.id})`);
      setSelectedUserId(null);
      setSelectedUserInfo(null);
      setMessages([]);
    }
    await fetchConversations();
    setDeleteDialogOpen(false);
    setDeleteTarget(null);
    toast({ title: 'Deleted', description: deleteTarget.type === 'message' ? 'Message deleted' : 'Conversation deleted' });
  };

  const handleCall = async (partnerId: string, phone: string | null) => {
    if (!phone || !user) {
      toast({ title: 'No Phone', description: 'This user has not added a phone number.', variant: 'destructive' });
      return;
    }
    const cleanPhone = phone.replace(/[^0-9+]/g, '');
    const isMobile = /Android|iPhone|iPad/i.test(navigator.userAgent);

    await supabase.from('call_history').insert({
      caller_id: user.id, receiver_id: partnerId, call_type: isMobile ? 'direct' : 'whatsapp', phone_number: cleanPhone,
    });

    if (isMobile) {
      const useWhatsApp = confirm('Open WhatsApp? (Cancel for direct call)');
      if (useWhatsApp) {
        window.open(`https://wa.me/${cleanPhone.replace('+', '')}`, '_blank');
      } else {
        window.open(`tel:${cleanPhone}`, '_self');
      }
    } else {
      window.open(`https://wa.me/${cleanPhone.replace('+', '')}`, '_blank');
    }
    toast({ title: 'Call Initiated', description: `Connecting to ${phone}` });
  };

  const selectConversation = (userId: string) => {
    setSelectedUserId(userId);
    const conv = conversations.find(c => c.userId === userId);
    if (conv) {
      setSelectedUserInfo({ name: conv.userName, avatarUrl: conv.avatarUrl, category: conv.category, phone: conv.phone });
    } else {
      fetchUserInfo(userId);
    }
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

  const showChatOnMobile = !!selectedUserId;
  const chatPartnerName = selectedUserInfo?.name || 'Unknown User';
  const chatPartnerAvatar = selectedUserInfo?.avatarUrl;
  const chatPartnerCategory = selectedUserInfo?.category;
  const chatPartnerPhone = selectedUserInfo?.phone;

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">

      <Header />
      <div className="container mx-auto px-4 py-4 md:py-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6">{t('messages')}</h1>

        <div className="grid md:grid-cols-3 gap-4 h-[calc(100dvh-240px)] md:h-[600px]">
          {/* Conversation List */}
          <Card className={`md:col-span-1 ${showChatOnMobile ? 'hidden md:block' : ''}`}>
            <CardHeader className="pb-3"><CardTitle className="text-lg">{t('all_messages')}</CardTitle></CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[calc(100dvh-360px)] md:h-[500px]">
                {conversations.length === 0 ? (
                  <p className="text-center text-muted-foreground p-4">{t('no_messages')}</p>
                ) : conversations.map((conv) => (
                  <div
                    key={conv.userId}
                    onClick={() => selectConversation(conv.userId)}
                    className={`p-3 md:p-4 border-b cursor-pointer hover:bg-muted/50 transition-colors ${selectedUserId === conv.userId ? 'bg-muted' : ''}`}
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10 shrink-0">
                        <AvatarImage src={conv.avatarUrl || undefined} />
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {conv.userName.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold truncate">{conv.userName}</p>
                        {conv.category && (
                          <p className="text-xs text-accent capitalize">{conv.category}</p>
                        )}
                        <p className="text-sm text-muted-foreground truncate">{conv.lastMessage}</p>
                      </div>
                      {conv.unreadCount > 0 && (
                        <div className="h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs shrink-0">
                          {conv.unreadCount}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Chat Area */}
          <Card className={`md:col-span-2 ${!showChatOnMobile ? 'hidden md:block' : ''}`}>
            {selectedUserId ? (
              <>
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <Button variant="ghost" size="icon" className="md:hidden shrink-0" onClick={() => { setSelectedUserId(null); setSelectedUserInfo(null); }}>
                      <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <Avatar className="h-10 w-10 shrink-0">
                      <AvatarImage src={chatPartnerAvatar || undefined} />
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {chatPartnerName.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-base truncate">{chatPartnerName}</CardTitle>
                      {chatPartnerCategory && (
                        <p className="text-xs text-accent capitalize">{chatPartnerCategory}</p>
                      )}
                    </div>
                    <Button variant="outline" size="icon" className="shrink-0" onClick={() => handleCall(selectedUserId, chatPartnerPhone)} title="Call">
                      <PhoneIcon className="h-4 w-4" />
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="shrink-0"><MoreVertical className="h-4 w-4" /></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={handleDeleteConversation} className="text-destructive">
                          <Trash2 className="h-4 w-4 me-2" /> Delete Conversation
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent className="flex flex-col h-[calc(100dvh-380px)] md:h-[520px]">
                  <ScrollArea className="flex-1 pr-2 md:pr-4">
                    <div className="space-y-3">
                      {messages.length === 0 && (
                        <p className="text-center text-muted-foreground py-8">No messages yet. Say hello!</p>
                      )}
                      {messages.map((msg) => (
                        <div key={msg.id} className={`flex ${msg.sender_id === user.id ? 'justify-end' : 'justify-start'} group`}>
                          <div className={`max-w-[80%] md:max-w-[70%] rounded-lg p-3 relative ${msg.sender_id === user.id ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                            <p className="break-words text-sm">{msg.message}</p>
                            <p className="text-[10px] opacity-70 mt-1">{new Date(msg.created_at).toLocaleTimeString()}</p>
                            <button onClick={() => handleDeleteMessage(msg.id)}
                              className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                              title="Delete message">
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      ))}
                      <div ref={messagesEndRef} />
                    </div>
                  </ScrollArea>
                  <div className="flex gap-2 mt-3">
                    <Input value={newMessage} onChange={(e) => setNewMessage(e.target.value)}
                      placeholder={t('type_message')} onKeyDown={(e) => e.key === 'Enter' && sendMessage()} disabled={loading} className="text-sm" />
                    <Button onClick={sendMessage} disabled={loading || !newMessage.trim()} size="sm">
                      <MessageSquareText className="h-4 w-4" />
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

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget?.type === 'conversation'
                ? 'This will delete the entire conversation. This action cannot be undone.'
                : 'This will delete the selected message. This action cannot be undone.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Messages;
