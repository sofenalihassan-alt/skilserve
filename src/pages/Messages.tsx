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
import { MessageSquareText, User, Trash2, MoreVertical } from 'lucide-react';
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
  lastMessage: string;
  lastMessageTime: string;
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
    if (selectedUserId && user) {
      fetchMessages(selectedUserId);
      fetchProviderProfile(selectedUserId);
    }
  }, [selectedUserId, user]);

  const fetchProviderProfile = async (userId: string) => {
    const [{ data: providerData }, { data: profileData }] = await Promise.all([
      supabase.from('service_providers').select('business_name, category, hourly_rate').eq('user_id', userId).maybeSingle(),
      supabase.from('profiles').select('avatar_url, full_name').eq('id', userId).maybeSingle(),
    ]);

    if (providerData) {
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

    if (error) return;

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
          lastMessageTime: msg.created_at,
          unreadCount: 0,
        });
      }
      if (msg.receiver_id === user.id && !msg.is_read) {
        convMap.get(partnerId)!.unreadCount++;
      }
    });

    if (userIds.size > 0) {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('id', Array.from(userIds));
      profiles?.forEach((profile) => {
        const conv = convMap.get(profile.id);
        if (conv) conv.userName = profile.full_name || 'Unknown User';
      });
    }

    setConversations(Array.from(convMap.values()));
  };

  const fetchMessages = async (partnerId: string) => {
    if (!user) return;
    const { data } = await supabase
      .from('messages')
      .select('*')
      .or(`and(sender_id.eq.${user.id},receiver_id.eq.${partnerId}),and(sender_id.eq.${partnerId},receiver_id.eq.${user.id})`)
      .order('created_at', { ascending: true });

    setMessages(data || []);
    await supabase.from('messages').update({ is_read: true }).eq('receiver_id', user.id).eq('sender_id', partnerId);
  };

  const subscribeToMessages = () => {
    if (!user) return () => {};
    const channel = supabase
      .channel('messages')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'messages', filter: `receiver_id=eq.${user.id}` }, () => {
        fetchConversations();
        if (selectedUserId) fetchMessages(selectedUserId);
      })
      .subscribe();
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
      sender_id: user.id,
      receiver_id: selectedUserId,
      message: validation.data.message,
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

  const handleDeleteMessage = async (messageId: string) => {
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

  const selectedConvName = conversations.find((c) => c.userId === selectedUserId)?.userName || 'Chat';

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
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold truncate">{conv.userName}</p>
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
                      <CardTitle>{selectedConvName}</CardTitle>
                      {selectedProviderProfile && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span className="capitalize">{selectedProviderProfile.category}</span>
                          <span>•</span>
                          <span>Rs. {selectedProviderProfile.hourly_rate}/hr</span>
                        </div>
                      )}
                    </div>
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
                        <div
                          key={msg.id}
                          className={`flex ${msg.sender_id === user.id ? 'justify-end' : 'justify-start'} group`}
                        >
                          <div className={`max-w-[70%] rounded-lg p-3 relative ${msg.sender_id === user.id ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                            <p className="break-words">{msg.message}</p>
                            <p className="text-xs opacity-70 mt-1">
                              {new Date(msg.created_at).toLocaleTimeString()}
                            </p>
                            {msg.sender_id === user.id && (
                              <button
                                onClick={() => handleDeleteMessage(msg.id)}
                                className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                title="Delete message"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            )}
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
