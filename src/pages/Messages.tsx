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
import { MessageSquareText, User, Trash2, MoreVertical, Phone as PhoneIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { messageSchema, getSafeErrorMessage } from '@/lib/validation';
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
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'message' | 'conversation'; id?: string } | null>(null);

  useEffect(() => {
    if (user) {
      fetchConversations();
      const cleanup = subscribeToMessages();
      const state = location.state as { providerId?: string; providerName?: string } | null;
      if (state?.providerId) setSelectedUserId(state.providerId);
      return cleanup;
    }
  }, [user]);

  useEffect(() => {
    if (selectedUserId && user) fetchMessages(selectedUserId);
  }, [selectedUserId, user]);

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

  const subscribeToMessages = () => {
    if (!user) return () => {};
    const channel = supabase.channel('messages')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'messages', filter: `receiver_id=eq.${user.id}` }, () => {
        fetchConversations();
        if (selectedUserId) fetchMessages(selectedUserId);
      }).subscribe();
    return () => { supabase.removeChannel(channel); };
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
      fetchMessages(selectedUserId);
      fetchConversations();
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
      await supabase.from('messages').delete().eq('id', deleteTarget.id).eq('sender_id', user.id);
      if (selectedUserId) fetchMessages(selectedUserId);
    } else if (deleteTarget.type === 'conversation' && selectedUserId) {
      await supabase.from('messages').delete()
        .or(`and(sender_id.eq.${user.id},receiver_id.eq.${selectedUserId}),and(sender_id.eq.${selectedUserId},receiver_id.eq.${user.id})`);
      setSelectedUserId(null);
      setMessages([]);
    }
    fetchConversations();
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

    // Record call history
    await supabase.from('call_history' as any).insert({
      caller_id: user.id, receiver_id: partnerId, call_type: isMobile ? 'direct' : 'whatsapp', phone_number: cleanPhone,
    } as any);

    if (isMobile) {
      // On mobile, offer both options
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

  const selectedConv = conversations.find((c) => c.userId === selectedUserId);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">{t('messages')}</h1>
        
        <div className="grid md:grid-cols-3 gap-4 h-[600px]">
          <Card className="md:col-span-1">
            <CardHeader><CardTitle>{t('all_messages')}</CardTitle></CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[500px]">
                {conversations.length === 0 ? (
                  <p className="text-center text-muted-foreground p-4">{t('no_messages')}</p>
                ) : conversations.map((conv) => (
                  <div
                    key={conv.userId}
                    onClick={() => setSelectedUserId(conv.userId)}
                    className={`p-4 border-b cursor-pointer hover:bg-muted/50 transition-colors ${selectedUserId === conv.userId ? 'bg-muted' : ''}`}
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
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
                        <div className="h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs">
                          {conv.unreadCount}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </ScrollArea>
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            {selectedConv ? (
              <>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={selectedConv.avatarUrl || undefined} />
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {selectedConv.userName.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-1">
                      <CardTitle>{selectedConv.userName}</CardTitle>
                      {selectedConv.category && (
                        <p className="text-sm text-accent capitalize">{selectedConv.category}</p>
                      )}
                    </div>
                    <Button variant="outline" size="icon" onClick={() => handleCall(selectedConv.userId, selectedConv.phone)} title="Call">
                      <PhoneIcon className="h-4 w-4" />
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4" /></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={handleDeleteConversation} className="text-destructive">
                          <Trash2 className="h-4 w-4 me-2" /> Delete Conversation
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent className="flex flex-col h-[520px]">
                  <ScrollArea className="flex-1 pr-4">
                    <div className="space-y-4">
                      {messages.map((msg) => (
                        <div key={msg.id} className={`flex ${msg.sender_id === user.id ? 'justify-end' : 'justify-start'} group`}>
                          <div className={`max-w-[70%] rounded-lg p-3 relative ${msg.sender_id === user.id ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                            <p className="break-words">{msg.message}</p>
                            <p className="text-xs opacity-70 mt-1">{new Date(msg.created_at).toLocaleTimeString()}</p>
                            {msg.sender_id === user.id && (
                              <button onClick={() => handleDeleteMessage(msg.id)}
                                className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                title="Delete message">
                                <Trash2 className="h-3 w-3" />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                  <div className="flex gap-2 mt-4">
                    <Input value={newMessage} onChange={(e) => setNewMessage(e.target.value)}
                      placeholder={t('type_message')} onKeyPress={(e) => e.key === 'Enter' && sendMessage()} disabled={loading} />
                    <Button onClick={sendMessage} disabled={loading || !newMessage.trim()}>
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
