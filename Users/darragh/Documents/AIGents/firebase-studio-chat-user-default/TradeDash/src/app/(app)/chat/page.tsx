
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { MessageSquare } from "lucide-react";

export default function ChatPage() {
    return (
        <div className="flex items-center justify-center h-[calc(100vh-10rem)]">
            <Card className="w-full max-w-lg text-center">
                <CardHeader>
                    <div className="mx-auto bg-muted p-3 rounded-full">
                        <MessageSquare className="size-8 text-muted-foreground" />
                    </div>
                     <CardTitle className="mt-4">Chat Widget</CardTitle>
                    <CardDescription>
                        Your chat is now available as a widget. Look for the message icon in the bottom-right corner of your screen to start a conversation.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">
                        This page is no longer used for chat. You can remove it from the sidebar if you wish.
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
