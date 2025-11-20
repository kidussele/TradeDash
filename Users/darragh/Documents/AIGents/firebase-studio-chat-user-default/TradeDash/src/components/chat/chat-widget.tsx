
'use client';

import { useState, useMemo } from 'react';
import { useUser, useFirestore, useCollection, useMemoFirebase, addDocumentNonBlocking, setDocumentNonBlocking } from '@/firebase';
import { collection, query, where, getDocs, serverTimestamp, orderBy } from 'firebase/firestore';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageSquare, Paperclip, Send, Users, X, User as UserIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

// Types
type UserProfile = { id: string; displayName: string; photoURL?: string; email: string; };
type UserStatus = { id: string; status: 'online' | 'offline'; };
type ChatRoom = { id:string; name: string; members: string[]; type: 'group' | 'private'; };
type ChatMessage = { id: string; senderId: string; text: string; timestamp: any, senderName: string, senderAvatar: string; };

function UserList({ users, statuses, onSelectUser, currentUserId }: { users: UserProfile[], statuses: UserStatus[], onSelectUser: (user: UserProfile) => void, currentUserId: string }) {
    const combinedUsers = useMemo(() => 
        users.filter(u => u.id !== currentUserId)
        .map(user => {
            const status = statuses.find(s => s.id === user.id);
            return { ...user, status: status?.status || 'offline' };
        }), [users, statuses, currentUserId]);

    return (
        <div className="space-y-2">
            <h3 className="px-4 text-xs font-semibold text-muted-foreground">Users</h3>
            <ScrollArea className="h-48">
                {combinedUsers.map(user => (
                    <Button
                        key={user.id}
                        variant="ghost"
                        className="w-full justify-start h-auto p-2"
                        onClick={() => onSelectUser(user)}
                    >
                        <div className="relative">
                            <Avatar className="h-8 w-8">
                                <AvatarImage src={user.photoURL} alt={user.displayName} />
                                <AvatarFallback>{user.displayName?.[0]}</AvatarFallback>
                            </Avatar>
                            <span className={cn("absolute bottom-0 right-0 block h-2 w-2 rounded-full", user.status === 'online' ? 'bg-positive' : 'bg-muted')} />
                        </div>
                        <span className="ml-2 truncate">{user.displayName}</span>
                    </Button>
                ))}
            </ScrollArea>
        </div>
    )
}

function ChatRoomList({ rooms, onSelectRoom, activeRoomId, users, currentUserId }: { rooms: ChatRoom[], onSelectRoom: (roomId: string) => void, activeRoomId: string | null, users: UserProfile[], currentUserId: string }) {
    
    const getPrivateRoomName = (room: ChatRoom) => {
        const otherMemberId = room.members.find(id => id !== currentUserId);
        const otherUser = users.find(u => u.id === otherMemberId);
        return otherUser?.displayName || 'Private Chat';
    }

    return (
        <div className="space-y-2">
            <h3 className="px-4 text-xs font-semibold text-muted-foreground">Conversations</h3>
            <ScrollArea className="h-48">
                {rooms.map(room => (
                    <Button
                        key={room.id}
                        variant={room.id === activeRoomId ? 'secondary' : 'ghost'}
                        className="w-full justify-start h-auto p-2"
                        onClick={() => onSelectRoom(room.id)}
                    >
                        <Avatar className="h-8 w-8">
                            {room.type === 'private' ? <UserIcon className="size-4" /> : <Users className="size-4" />}
                        </Avatar>
                        <span className="ml-2 truncate">
                           {room.type === 'private' ? getPrivateRoomName(room) : room.name}
                        </span>
                    </Button>
                ))}
            </ScrollArea>
        </div>
    )
}


function MessageArea({ roomId }: { roomId: string | null }) {
    const firestore = useFirestore();
    const { user } = useUser();
    const [newMessage, setNewMessage] = useState('');
    
    const messagesRef = useMemoFirebase(() => roomId ? collection(firestore, `chatRooms/${roomId}/messages`) : null, [roomId, firestore]);
    const messagesQuery = useMemoFirebase(() => messagesRef ? query(messagesRef, orderBy('timestamp', 'asc')) : null, [messagesRef]);
    const { data: messages = [] } = useCollection<ChatMessage>(messagesQuery);
    
    const handleSendMessage = async () => {
        if (!newMessage.trim() || !user || !roomId || !messagesRef) return;

        const messageData: Omit<ChatMessage, 'id'> = {
            senderId: user.uid,
            senderName: user.displayName || 'User',
            senderAvatar: user.photoURL || '',
            text: newMessage,
            timestamp: serverTimestamp(),
        };

        await addDocumentNonBlocking(messagesRef, messageData);

        const roomRef = doc(firestore, 'chatRooms', roomId);
        setDocumentNonBlocking(roomRef, {
            lastMessage: {
                text: newMessage,
                timestamp: serverTimestamp()
            }
        }, { merge: true });
        
        setNewMessage('');
    };

    if (!roomId) return (
        <div className="flex h-full flex-col items-center justify-center text-center text-muted-foreground p-4">
            <MessageSquare className="size-10 mb-2"/>
            <p className="font-medium">Select a conversation</p>
            <p className="text-xs">Choose a user or a group to start chatting.</p>
        </div>
    );

    return (
        <div className="flex flex-col h-full bg-muted/50 rounded-b-lg">
            <ScrollArea className="flex-grow p-4">
                <div className="space-y-4">
                    {messages.map(msg => (
                        <div key={msg.id} className={cn("flex items-end gap-2", msg.senderId === user?.uid ? "justify-end" : "justify-start")}>
                            {msg.senderId !== user?.uid && (
                                <Avatar className="h-6 w-6">
                                    <AvatarImage src={msg.senderAvatar} />
                                    <AvatarFallback>{msg.senderName?.[0]}</AvatarFallback>
                                </Avatar>
                            )}
                            <div className={cn("max-w-xs rounded-lg px-3 py-2 text-sm", msg.senderId === user?.uid ? "bg-primary text-primary-foreground" : "bg-background")}>
                                {msg.text}
                            </div>
                        </div>
                    ))}
                </div>
            </ScrollArea>
            <div className="p-2 border-t bg-background">
                <div className="relative">
                    <Input 
                        placeholder="Type a message..."
                        className="pr-16"
                        value={newMessage}
                        onChange={e => setNewMessage(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleSendMessage}>
                            <Send className="size-4" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}


export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeRoomId, setActiveRoomId] = useState<string | null>(null);
  const { user } = useUser();
  const firestore = useFirestore();

  // Data fetching
  const usersRef = useMemoFirebase(() => collection(firestore, 'users'), [firestore]);
  const { data: users = [] } = useCollection<UserProfile>(usersRef);

  const statusesRef = useMemoFirebase(() => collection(firestore, 'userStatus'), [firestore]);
  const { data: statuses = [] } = useCollection<UserStatus>(statusesRef);
  
  const roomsRef = useMemoFirebase(() => user ? query(collection(firestore, 'chatRooms'), where('members', 'array-contains', user.uid)) : null, [user, firestore]);
  const { data: rooms = [] } = useCollection<ChatRoom>(roomsRef);

  const handleSelectUser = async (selectedUser: UserProfile) => {
    if (!user) return;

    const privateRoomId = [user.uid, selectedUser.id].sort().join('_');
    const existingRoom = rooms.find(r => r.id === privateRoomId);

    if (existingRoom) {
        setActiveRoomId(existingRoom.id);
    } else {
        const newRoomData = {
            name: `${user.displayName} & ${selectedUser.displayName}`,
            type: 'private',
            members: [user.uid, selectedUser.id],
        };
        const roomRef = doc(firestore, 'chatRooms', privateRoomId);
        await setDocumentNonBlocking(roomRef, newRoomData, {});
        setActiveRoomId(privateRoomId);
    }
  }

  // Effect to ensure a "General" room exists.
   useMemo(() => {
    if (user && rooms.length === 0) {
      const generalRoomRef = collection(firestore, 'chatRooms');
      const q = query(generalRoomRef, where('name', '==', 'General'));
      getDocs(q).then(snapshot => {
        if (snapshot.empty) {
          addDocumentNonBlocking(generalRoomRef, {
            name: 'General',
            type: 'group',
            members: users.map(u => u.id)
          });
        }
      });
    }
  }, [user, firestore, rooms, users]);


  if (!user) return null;

  return (
    <>
      {isOpen && (
        <Card className="fixed bottom-20 right-4 z-50 w-full max-w-[700px] h-[500px] shadow-2xl flex">
          <div className="w-1/3 border-r flex flex-col">
              <CardHeader>
                <CardTitle className="text-base">Conversations</CardTitle>
              </CardHeader>
              <CardContent className="p-2 flex-grow">
                 <ChatRoomList rooms={rooms as ChatRoom[]} onSelectRoom={setActiveRoomId} activeRoomId={activeRoomId} users={users as UserProfile[]} currentUserId={user.uid} />
                 <div className="my-2"><hr /></div>
                 <UserList users={users as UserProfile[]} statuses={statuses as UserStatus[]} onSelectUser={handleSelectUser} currentUserId={user.uid} />
              </CardContent>
          </div>
          <div className="w-2/3 flex flex-col">
              <MessageArea roomId={activeRoomId} />
          </div>
        </Card>
      )}
      <Button
        className="fixed bottom-4 right-4 z-50 h-14 w-14 rounded-full shadow-lg"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="h-6 w-6" /> : <MessageSquare className="h-6 w-6" />}
        <span className="sr-only">Toggle Chat</span>
      </Button>
    </>
  );
}
