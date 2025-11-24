
'use client';
import { useState, useMemo, useEffect, useRef } from 'react';
import { useUser, useCollection, useFirestore, useMemoFirebase, addDocumentNonBlocking, setDocumentNonBlocking } from '@/firebase';
import { collection, query, where, doc, getDocs, serverTimestamp, orderBy, Timestamp, updateDoc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MessageSquare, Expand, X, Users, MessageCircle, Paperclip, Pencil, Minus, Smile, Reply } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';
import EmojiPicker, { EmojiClickData } from 'emoji-picker-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';


type UserProfile = {
  id: string;
  displayName: string;
  photoURL?: string;
  email: string;
};

type UserStatus = {
  id: string;
  online: boolean;
  lastChanged: any;
};

type ChatRoom = {
  id: string;
  name: string;
  type: 'group' | 'private';
  members: string[];
  lastMessage?: { text: string; timestamp: Timestamp, senderId: string };
};

type ReplyContext = {
    messageId: string;
    senderId: string;
    text?: string;
    imageUrl?: string;
}

type ChatMessage = {
  id: string;
  text?: string;
  imageUrl?: string;
  senderId: string;
  timestamp: any;
  members: string[]; // Denormalized for security rules
  replyTo?: ReplyContext;
};

const isImageUrl = (url: string) => {
    return /\.(jpeg|jpg|gif|png|webp)$/.test(url.toLowerCase());
}

export function ChatWidget() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);
  const [activeTab, setActiveTab] = useState<'chats' | 'users'>('chats');
  const [activeRoomId, setActiveRoomId] = useState<string | null>('general');
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [lastReadTimestamps, setLastReadTimestamps] = useState<Record<string, Timestamp>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');
  const [replyTo, setReplyTo] = useState<ChatMessage | null>(null);
  
  // --- Data Fetching ---
  const usersRef = useMemoFirebase(() => collection(firestore, 'users'), [firestore]);
  const { data: allUsersData } = useCollection<UserProfile>(usersRef);
  const allUsers = allUsersData || [];

  const userStatusRef = useMemoFirebase(() => collection(firestore, 'userStatus'), [firestore]);
  const { data: userStatusesData } = useCollection<UserStatus>(userStatusRef);
  const userStatuses = userStatusesData || [];

  const chatRoomsRef = useMemoFirebase(() => user ? query(collection(firestore, 'chatRooms'), where('members', 'array-contains', user.uid)) : null, [user, firestore]);
  const { data: chatRoomsData } = useCollection<ChatRoom>(chatRoomsRef);
  const chatRooms = chatRoomsData || [];

  const messagesQuery = useMemoFirebase(() => 
    activeRoomId ? query(collection(firestore, 'chatRooms', activeRoomId, 'messages'), orderBy('timestamp', 'asc')) : null, 
  [activeRoomId, firestore]);
  const { data: messagesData } = useCollection<ChatMessage>(messagesQuery);
  const messages = messagesData || [];

  // --- Memoized Data Processing ---
  const usersWithStatus = useMemo(() => {
    return allUsers.map(u => {
      const status = userStatuses.find(s => s.id === u.id);
      return { ...u, online: status?.online ?? false };
    }).filter(u => u.id !== user?.uid);
  }, [allUsers, userStatuses, user?.uid]);

  const sortedMessages = useMemo(() => 
    [...(messages || [])].sort((a,b) => (a.timestamp?.toDate() || 0) - (b.timestamp?.toDate() || 0)),
  [messages]);

  const activeRoom = useMemo(() => chatRooms?.find(r => r.id === activeRoomId), [chatRooms, activeRoomId]);
  
  // --- Effects ---
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [sortedMessages]);

  useEffect(() => {
    // Create 'general' chat room if it doesn't exist for the user
    if (user && chatRooms && allUsers.length > 0 && !chatRooms.find(r => r.id === 'general')) {
      const generalRoomRef = doc(firestore, 'chatRooms', 'general');
      const allUserIds = allUsers.map(u => u.id);
      // Ensure the current user is included if not already in allUsers
      if (!allUserIds.includes(user.uid)) {
        allUserIds.push(user.uid);
      }
      setDocumentNonBlocking(generalRoomRef, {
          name: 'General',
          type: 'group',
          members: allUserIds,
      }, { merge: true });
    }
  }, [chatRooms, user, firestore, allUsers]);

  // --- Event Handlers ---
  const handleSendMessage = async (imageUrlToSend?: string) => {
    const messageText = newMessage.trim();
    if ((!messageText && !imageUrlToSend) || !user || !activeRoomId || !activeRoom) return;

    const messagePayload: Partial<Omit<ChatMessage, 'id' | 'timestamp'>> & { replyTo?: Partial<ReplyContext> } = {
      senderId: user.uid,
      members: activeRoom.members,
    };
    
    // Check if the pasted text is an image URL
    if (messageText && isImageUrl(messageText) && !imageUrlToSend) {
        messagePayload.imageUrl = messageText;
    } else if (messageText) {
        messagePayload.text = messageText;
    }

    if (imageUrlToSend) {
      messagePayload.imageUrl = imageUrlToSend;
    }
    
    if (replyTo) {
        const replyContext: Partial<ReplyContext> = {
            messageId: replyTo.id,
            senderId: replyTo.senderId,
        };
        if (replyTo.text) {
            replyContext.text = replyTo.text;
        }
        if (replyTo.imageUrl) {
            replyContext.imageUrl = replyTo.imageUrl;
        }
        messagePayload.replyTo = replyContext;
    }
    
    const messagesColRef = collection(firestore, 'chatRooms', activeRoomId, 'messages');
    await addDocumentNonBlocking(messagesColRef, { ...messagePayload, timestamp: serverTimestamp() });
    
    const roomDocRef = doc(firestore, 'chatRooms', activeRoomId);
    let lastMessageText = messagePayload.text;
    if (messagePayload.imageUrl) {
        lastMessageText = messagePayload.text ? `Image & Text` : 'Image';
    }

    setDocumentNonBlocking(roomDocRef, {
        lastMessage: {
            text: lastMessageText,
            timestamp: serverTimestamp(),
            senderId: user.uid,
        }
    }, { merge: true });

    setNewMessage('');
    setReplyTo(null);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        handleSendMessage();
    }
  };
  
  const handleUserClick = async (targetUser: UserProfile) => {
    if (!user) return;
    
    const memberIds = [user.uid, targetUser.id].sort();
    const roomId = memberIds.join('_');
    
    const roomRef = doc(firestore, 'chatRooms', roomId);
    const existingRoom = chatRooms?.find(r => r.id === roomId);

    if (existingRoom) {
      handleRoomSelect(existingRoom.id);
    } else {
      await setDocumentNonBlocking(roomRef, {
        name: ``, // Private chats don't need a name
        type: 'private',
        members: memberIds,
      });
      // The useCollection hook for chat rooms will automatically pick up the new room.
      // We can then select it.
      handleRoomSelect(roomId);
    }
    setActiveTab('chats');
  }

  const handleRoomSelect = (roomId: string) => {
    setActiveRoomId(roomId);
    const room = chatRooms.find(r => r.id === roomId);
    if(room?.lastMessage?.timestamp) {
        setLastReadTimestamps(prev => ({
            ...prev,
            [roomId]: room.lastMessage!.timestamp
        }));
    }
  }

  const getRoomDisplayName = (room: ChatRoom) => {
    if (room.type === 'group') return room.name;
    if (!user) return 'Private Chat';

    const otherUserId = room.members.find(id => id !== user.uid);
    const otherUser = allUsers.find(u => u.id === otherUserId);
    return otherUser?.displayName || 'Private Chat';
  }

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 1 * 1024 * 1024) { // 1MB limit
        toast({
            variant: 'destructive',
            title: 'File too large',
            description: 'Please upload an image smaller than 1MB.',
        });
        return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
        const response = await fetch('/api/upload', {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'File upload failed');
        }

        const { url } = await response.json();
        await handleSendMessage(url);

    } catch (error) {
        console.error(error);
        toast({
            variant: 'destructive',
            title: 'Upload Failed',
            description: (error as Error).message || 'Could not upload the image.',
        });
    } finally {
        setIsUploading(false);
        // Reset file input
        if(fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    }
  };

  const handleStartEdit = (message: ChatMessage) => {
    if (message.text) {
        setEditingMessageId(message.id);
        setEditingText(message.text);
    }
  };

  const handleCancelEdit = () => {
    setEditingMessageId(null);
    setEditingText('');
  };

  const handleSaveEdit = async () => {
    if (!editingMessageId || !activeRoomId) return;
    
    const messageRef = doc(firestore, 'chatRooms', activeRoomId, 'messages', editingMessageId);
    try {
        await updateDoc(messageRef, { text: editingText });
        handleCancelEdit();
    } catch (error) {
        console.error("Error updating message:", error);
        toast({
            variant: 'destructive',
            title: 'Update Failed',
            description: 'Could not save your changes.',
        });
    }
  };
  
  const handleEmojiClick = (emojiData: EmojiClickData) => {
    setNewMessage(prev => prev + emojiData.emoji);
  }

  const handleDoubleClick = (message: ChatMessage) => {
    setReplyTo(message);
  }

  if (!user) return null;

  if (!isOpen) {
    const hasUnreadMessages = chatRooms.some(room => 
      room.lastMessage && 
      room.lastMessage.senderId !== user.uid &&
      (!lastReadTimestamps[room.id] || room.lastMessage.timestamp.toMillis() > lastReadTimestamps[room.id].toMillis())
    );

    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button onClick={() => setIsOpen(true)} className="rounded-full w-16 h-16 shadow-lg relative">
          <MessageSquare className="h-8 w-8" />
          {hasUnreadMessages && (
            <span className="absolute top-1 left-1 block h-3 w-3 rounded-full bg-red-500 ring-2 ring-background" />
          )}
        </Button>
      </div>
    );
  }

  const getSender = (senderId: string) => allUsers.find(u => u.id === senderId);

  return (
    <div className={cn("fixed bottom-4 right-4 z-50 transition-all", isExpanded ? "w-[480px] h-[450px]" : "w-auto")}>
       <Card 
        className={cn("w-full h-full flex flex-col shadow-lg bg-cover bg-center relative overflow-hidden", !isExpanded && "h-14")}
        style={{ backgroundImage: "url('https://i.pinimg.com/564x/f9/72/46/f97246ee37ec2482753e83ec5b629fc5.jpg')"}}
      >
        <div className="absolute inset-0 bg-black/50 z-0 backdrop-blur-md"/>
        <div className="relative z-10 flex flex-col h-full">

        <CardHeader className="flex flex-row items-center justify-between p-3 border-b border-white/10 bg-black/20">
          <CardTitle className="text-lg font-semibold text-white">{activeRoom ? getRoomDisplayName(activeRoom) : 'Chat'}</CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="h-6 w-6 text-white/80 hover:text-white hover:bg-white/10" onClick={() => setIsExpanded(!isExpanded)}>
              {isExpanded ? <Minus className="h-4 w-4" /> : <Expand className="h-4 w-4" />}
            </Button>
            <Button variant="ghost" size="icon" className="h-6 w-6 text-white/80 hover:text-white hover:bg-white/10" onClick={() => setIsOpen(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        {isExpanded && (
          <div className="flex flex-grow min-h-0">
            {/* Sidebar */}
             <div className="w-[72px] border-r border-white/10 bg-black/20 flex flex-col items-center">
              <div className="p-2 border-b border-white/10">
                 <div className="flex flex-col gap-1 rounded-md bg-white/5 p-1">
                    <TooltipProvider>
                       <Tooltip>
                         <TooltipTrigger asChild>
                           <Button size="sm" variant={activeTab === 'chats' ? 'secondary': 'ghost'} className="h-9 w-9 p-0 text-white/80 hover:text-white hover:bg-white/10 data-[state=active]:bg-white/20" onClick={() => setActiveTab('chats')}><MessageCircle /></Button>
                         </TooltipTrigger>
                         <TooltipContent side="right"><p>Chats</p></TooltipContent>
                       </Tooltip>
                       <Tooltip>
                         <TooltipTrigger asChild>
                           <Button size="sm" variant={activeTab === 'users' ? 'secondary': 'ghost'} className="h-9 w-9 p-0 text-white/80 hover:text-white hover:bg-white/10 data-[state=active]:bg-white/20" onClick={() => setActiveTab('users')}><Users/></Button>
                         </TooltipTrigger>
                         <TooltipContent side="right"><p>Users</p></TooltipContent>
                       </Tooltip>
                    </TooltipProvider>
                </div>
              </div>
              <ScrollArea className="flex-grow w-full">
                {activeTab === 'chats' && (
                  <div className="p-2 space-y-2 flex flex-col items-center">
                    {chatRooms?.sort((a,b) => (b.lastMessage?.timestamp?.toDate() || 0) - (a.lastMessage?.timestamp?.toDate() || 0)).map(room => {
                        const isUnread = room.lastMessage && 
                                       room.lastMessage.senderId !== user.uid &&
                                       (!lastReadTimestamps[room.id] || room.lastMessage.timestamp.toMillis() > lastReadTimestamps[room.id].toMillis());
                        
                        let otherUser: (UserProfile & {online?: boolean}) | undefined;
                        if (room.type === 'private') {
                            const otherUserId = room.members.find(id => id !== user.uid);
                            otherUser = usersWithStatus.find(u => u.id === otherUserId);
                        }
                        
                        const displayName = getRoomDisplayName(room);
                        const isActive = activeRoomId === room.id;

                        return (
                        <TooltipProvider key={room.id}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="ghost" className={cn("w-12 h-12 p-0 rounded-full relative", isActive && "ring-2 ring-primary")} onClick={() => handleRoomSelect(room.id)}>
                                    <Avatar className="h-10 w-10">
                                        <AvatarImage src={room.type === 'group' ? undefined : otherUser?.photoURL} />
                                        <AvatarFallback>{displayName.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                     {room.type === 'private' && otherUser && (
                                        <div className={cn(
                                            "absolute bottom-0 right-0 block h-3 w-3 rounded-full ring-2 ring-background", 
                                            otherUser?.online ? 'bg-green-500' : 'bg-red-500'
                                        )} />
                                    )}
                                     {isUnread && <div className="absolute top-0 left-0 h-3 w-3 rounded-full bg-blue-500 ring-2 ring-background" />}
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent side="right">
                                <p className="font-bold">{displayName}</p>
                                {room.lastMessage && <p className="text-xs text-muted-foreground">{room.lastMessage.text}</p>}
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        )
                    })}
                  </div>
                )}
                {activeTab === 'users' && (
                  <div className="p-2 space-y-2 flex flex-col items-center">
                    {usersWithStatus.map(u => (
                       <TooltipProvider key={u.id}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="ghost" className="w-12 h-12 p-0 rounded-full relative" onClick={() => handleUserClick(u)}>
                                    <Avatar className="h-10 w-10">
                                        <AvatarImage src={u.photoURL} />
                                        <AvatarFallback>{u.displayName.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <div className={cn("absolute bottom-0 right-0 block h-3 w-3 rounded-full ring-2 ring-background", u.online ? 'bg-green-500' : 'bg-red-500')} />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent side="right"><p>{u.displayName}</p></TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </div>

            {/* Main chat area */}
            <div className="flex-grow flex flex-col">
              <ScrollArea className="flex-grow p-4">
                <div className="space-y-4">
                  {sortedMessages.map(message => {
                    const sender = getSender(message.senderId);
                    const isCurrentUser = message.senderId === user.uid;
                    const isEditing = editingMessageId === message.id;

                    return (
                      <div key={message.id} className={cn("flex items-end gap-2 group", isCurrentUser ? "justify-end" : "justify-start")} onDoubleClick={() => handleDoubleClick(message as ChatMessage)}>
                        {!isCurrentUser && (
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={sender?.photoURL} />
                            <AvatarFallback>{sender?.displayName?.charAt(0) ?? 'U'}</AvatarFallback>
                          </Avatar>
                        )}
                         {isCurrentUser && message.text && !isEditing && (
                            <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 text-white/80 hover:text-white hover:bg-white/10" onClick={() => handleStartEdit(message as ChatMessage)}>
                                <Pencil className="h-4 w-4" />
                            </Button>
                        )}
                        <div className={cn("max-w-xs rounded-lg text-sm", isCurrentUser ? "bg-white/20 text-white" : "bg-white/10 text-white", isEditing ? "w-full" : "p-2")}>
                           {!isCurrentUser && sender && <p className="font-bold mb-1 px-2 pt-2 text-primary">{sender.displayName}</p>}
                           
                           {message.replyTo && (
                             <div className="bg-black/20 p-2 rounded-md mb-2 text-xs opacity-80">
                               <p className="font-semibold text-white/80">{getSender(message.replyTo.senderId)?.displayName}</p>
                               <p className="truncate text-white/60">{message.replyTo.text || "Image"}</p>
                             </div>
                           )}
                          
                           <div className={cn(!isCurrentUser && 'px-2 pb-2')}>
                            {isEditing ? (
                               <div className="p-1">
                                  <Input 
                                      value={editingText} 
                                      onChange={(e) => setEditingText(e.target.value)}
                                      className="h-8 bg-black/50 border-white/20 text-white"
                                      onKeyDown={(e) => {
                                          if (e.key === 'Enter') handleSaveEdit();
                                          if (e.key === 'Escape') handleCancelEdit();
                                      }}
                                  />
                                  <div className="text-xs mt-1.5 flex justify-end gap-2 text-white/80">
                                       <button onClick={handleCancelEdit} className="hover:underline">Cancel</button>
                                       <button onClick={handleSaveEdit} className="font-semibold hover:underline">Save</button>
                                  </div>
                              </div>
                            ) : (
                              <>
                                  {message.text && <p className="whitespace-pre-wrap">{message.text}</p>}
                                  {message.imageUrl && (
                                      // eslint-disable-next-line @next/next/no-img-element
                                      <img src={message.imageUrl} alt="Shared image" className="mt-2 rounded-md max-w-full h-auto cursor-pointer" onClick={() => window.open(message.imageUrl, '_blank')} />
                                  )}
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div ref={messagesEndRef} />
              </ScrollArea>
              
               {replyTo && (
                <div className="p-2 border-t border-white/10 text-xs bg-black/30 flex justify-between items-center text-white">
                    <div className="flex items-center gap-2 truncate">
                        <Reply className="h-4 w-4 flex-shrink-0" />
                        <div className="truncate">
                            <p className="font-semibold">Replying to {getSender(replyTo.senderId)?.displayName}</p>
                            <p className="text-white/60 truncate">{replyTo.text || "Image"}</p>
                        </div>
                    </div>
                    <Button variant="ghost" size="icon" className="h-6 w-6 text-white/80 hover:text-white" onClick={() => setReplyTo(null)}>
                        <X className="h-4 w-4" />
                    </Button>
                </div>
              )}

              <CardFooter className="p-2 border-t border-white/10 bg-black/20 flex items-start gap-2">
                 <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    accept="image/png, image/jpeg, image/gif"
                    disabled={isUploading}
                 />
                <div className="flex-grow relative">
                    <Textarea 
                        value={newMessage} 
                        onChange={e => setNewMessage(e.target.value)} 
                        placeholder="Type a message..."
                        onKeyDown={handleKeyDown}
                        disabled={isUploading}
                        className="flex-grow resize-none min-h-[initial] h-9 pr-10 bg-white/10 border-white/20 text-white placeholder:text-white/50"
                        rows={1}
                    />
                    <Popover>
                        <PopoverTrigger asChild>
                             <Button variant="ghost" size="icon" className="absolute right-1 bottom-1 h-7 w-7 text-white/80 hover:text-white">
                                <Smile className="h-5 w-5"/>
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0 border-0 mb-2">
                             <EmojiPicker onEmojiClick={handleEmojiClick} />
                        </PopoverContent>
                    </Popover>
                </div>
                  <div className="flex flex-col gap-1">
                    <Button type="button" variant="ghost" size="icon" className="text-white/80 hover:text-white" onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
                        <Paperclip className="h-5 w-5" />
                    </Button>
                    <Button type="submit" size="icon" onClick={() => handleSendMessage()} disabled={isUploading || (!newMessage.trim() && !replyTo)}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-send-horizontal"><path d="m3 3 3 9-3 9 19-9Z"/><path d="M6 12h16"/></svg>
                    </Button>
                 </div>
              </CardFooter>
            </div>
          </div>
        )}
        </div>
      </Card>
    </div>
  );
}
