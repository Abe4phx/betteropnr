import { OpenerCard } from "@/components/OpenerCard";
import { useTalkSpark } from "@/contexts/TalkSparkContext";
import { Heart } from "lucide-react";

const Saved = () => {
  const { favorites } = useTalkSpark();

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2">
            <Heart className="w-8 h-8 text-primary fill-primary" />
            <h2 className="text-4xl font-heading font-bold">Saved Favorites</h2>
          </div>
          <p className="text-lg text-muted-foreground">
            Your collection of favorite conversation starters
          </p>
        </div>

        {favorites.length === 0 ? (
          <div className="text-center py-12 space-y-4">
            <div className="w-24 h-24 mx-auto bg-muted rounded-full flex items-center justify-center">
              <Heart className="w-12 h-12 text-muted-foreground" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-semibold">No favorites yet</h3>
              <p className="text-muted-foreground">
                Start generating conversation starters and save your favorites!
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {favorites.map((opener) => (
              <OpenerCard key={opener.id} {...opener} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Saved;
