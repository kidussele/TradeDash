import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function NewsPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Market News</CardTitle>
        <CardDescription>
          Latest news and economic events from around the world. Integration with a news feed is coming soon.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-center h-64 border-2 border-dashed rounded-lg">
          <p className="text-muted-foreground">News feed will be displayed here.</p>
        </div>
      </CardContent>
    </Card>
  );
}
