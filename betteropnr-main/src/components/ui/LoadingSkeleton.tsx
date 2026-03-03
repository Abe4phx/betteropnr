import { Card } from "@/components/ui/card";

export const LoadingSkeleton = () => {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <Card key={i} className="p-6 space-y-4">
          <div 
            className="h-4 rounded-lg bg-gradient-to-r from-muted via-muted-foreground/10 to-muted animate-shimmer"
            style={{ backgroundSize: '200% 100%' }}
          />
          <div 
            className="h-4 rounded-lg bg-gradient-to-r from-muted via-muted-foreground/10 to-muted animate-shimmer w-3/4"
            style={{ backgroundSize: '200% 100%' }}
          />
          <div 
            className="h-4 rounded-lg bg-gradient-to-r from-muted via-muted-foreground/10 to-muted animate-shimmer w-1/2"
            style={{ backgroundSize: '200% 100%' }}
          />
        </Card>
      ))}
    </div>
  );
};
