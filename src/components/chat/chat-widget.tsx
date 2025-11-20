
'use client';
import { useState, useMemo, useEffect, useRef } from 'react';
import { useUser, useCollection, useFirestore, useMemoFirebase, addDocumentNonBlocking, setDocumentNonBlocking } from '@/firebase';
import { collection, query, where, doc, getDocs, serverTimestamp, orderBy, Timestamp } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MessageSquare, Minus, X, Expand, Users, MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

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

type ChatMessage = {
  id: string;
  text: string;
  senderId: string;
  timestamp: any;
  members: string[]; // Denormalized for security rules
};

export function ChatWidget() {
  const { user } = useUser();
  const firestore = useFirestore();
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);
  const [activeTab, setActiveTab] = useState<'chats' | 'users'>('chats');
  const [activeRoomId, setActiveRoomId] = useState<string | null>('general');
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [lastReadTimestamps, setLastReadTimestamps] = useState<Record<string, Timestamp>>({});
  
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
    [...(messages || [])].sort((a,b) => a.timestamp?.toDate() - b.timestamp?.toDate()), 
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
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !user || !activeRoomId || !activeRoom) return;

    const messagesColRef = collection(firestore, 'chatRooms', activeRoomId, 'messages');
    await addDocumentNonBlocking(messagesColRef, {
      text: newMessage,
      senderId: user.uid,
      timestamp: serverTimestamp(),
      members: activeRoom.members,
    });
    
    const roomDocRef = doc(firestore, 'chatRooms', activeRoomId);
    setDocumentNonBlocking(roomDocRef, {
        lastMessage: {
            text: newMessage,
            timestamp: serverTimestamp(),
            senderId: user.uid,
        }
    }, { merge: true });

    setNewMessage('');
  };
  
  const handleUserClick = async (targetUser: UserProfile) => {
    if (!user) return;
    
    const memberIds = [user.uid, targetUser.id].sort();
    const roomId = memberIds.join('_');
    
    const existingRoom = chatRooms?.find(r => r.id === roomId);

    if (existingRoom) {
      handleRoomSelect(existingRoom.id);
    } else {
      const newRoomRef = doc(firestore, 'chatRooms', roomId);
      await setDocumentNonBlocking(newRoomRef, {
        name: ``,
        type: 'private',
        members: memberIds,
      });
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

  if (!user) return null;

  if (!isOpen) {
    const hasUnreadMessages = chatRooms.some(room => 
      room.lastMessage && 
      room.lastMessage.senderId !== user.uid &&
      (!lastReadTimestamps[room.id] || room.lastMessage.timestamp > lastReadTimestamps[room.id])
    );

    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button onClick={() => setIsOpen(true)} className="rounded-full w-16 h-16 shadow-lg relative">
          <MessageSquare className="h-8 w-8" />
          {hasUnreadMessages && (
            <span className="absolute top-0.5 left-0.5 block h-3 w-3 rounded-full bg-red-500 ring-2 ring-background" />
          )}
        </Button>
      </div>
    );
  }

  const getSender = (senderId: string) => allUsers.find(u => u.id === senderId);

  return (
    <div className={cn("fixed bottom-4 right-4 z-50 transition-all", isExpanded ? "w-[480px] h-[450px]" : "w-[300px] h-14")}>
      <Card className="w-full h-full flex flex-col shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between p-3 border-b">
          <CardTitle className="text-lg font-semibold">{activeRoom ? getRoomDisplayName(activeRoom) : 'Chat'}</CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setIsExpanded(!isExpanded)}>
              {isExpanded ? <Minus className="h-4 w-4" /> : <Expand className="h-4 w-4" />}
            </Button>
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setIsOpen(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        {isExpanded && (
          <div className="flex flex-grow min-h-0">
            {/* Sidebar */}
             <div className="w-[72px] border-r flex flex-col items-center">
              <div className="p-2 border-b">
                 <div className="flex flex-col gap-1 rounded-md bg-muted p-1">
                    <TooltipProvider>
                       <Tooltip>
                         <TooltipTrigger asChild>
                           <Button size="sm" variant={activeTab === 'chats' ? 'secondary': 'ghost'} className="h-9 w-9 p-0" onClick={() => setActiveTab('chats')}><MessageCircle /></Button>
                         </TooltipTrigger>
                         <TooltipContent side="right"><p>Chats</p></TooltipContent>
                       </Tooltip>
                       <Tooltip>
                         <TooltipTrigger asChild>
                           <Button size="sm" variant={activeTab === 'users' ? 'secondary': 'ghost'} className="h-9 w-9 p-0" onClick={() => setActiveTab('users')}><Users/></Button>
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
                                       (!lastReadTimestamps[room.id] || room.lastMessage.timestamp > lastReadTimestamps[room.id]);
                        
                        let otherUser: (UserProfile & {online?: boolean}) | undefined;
                        if (room.type === 'private') {
                            const otherUserId = room.members.find(id => id !== user.uid);
                            otherUser = usersWithStatus.find(u => u.id === otherUserId);
                        }
                        
                        const displayName = getRoomDisplayName(room);

                        return (
                        <TooltipProvider key={room.id}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                                <Button key={room.id} variant={activeRoomId === room.id ? "secondary": "ghost"} className="w-12 h-12 p-0 rounded-full relative" onClick={() => handleRoomSelect(room.id)}>
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
                    return (
                      <div key={message.id} className={cn("flex items-end gap-2", isCurrentUser ? "justify-end" : "justify-start")}>
                        {!isCurrentUser && (
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={sender?.photoURL} />
                            <AvatarFallback>{sender?.displayName?.charAt(0) ?? 'U'}</AvatarFallback>
                          </Avatar>
                        )}
                        <div className={cn("max-w-xs rounded-lg p-3 text-sm", isCurrentUser ? "bg-primary text-primary-foreground" : "bg-muted")}>
                          {!isCurrentUser && <p className="font-bold mb-1">{sender?.displayName}</p>}
                          <p>{message.text}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div ref={messagesEndRef} />
              </ScrollArea>
              <CardFooter className="p-2 border-t">
                <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} className="w-full flex gap-2">
                  <Input value={newMessage} onChange={e => setNewMessage(e.target.value)} placeholder="Type a message..." />
                  <Button type="submit">Send</Button>
                </form>
              </CardFooter>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
