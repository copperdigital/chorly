import { Card, CardContent } from "@/components/ui/card";
import { getAvatarClass, getInitial } from "@/lib/utils";
import { Trophy, Crown } from "lucide-react";
import { cn } from "@/lib/utils";

interface LeaderboardProps {
  people: Array<{
    id: number;
    nickname: string;
    avatar: string;
    currentStreak: number;
    totalPoints: number;
  }>;
}

export default function Leaderboard({ people }: LeaderboardProps) {
  // Sort people by total points (descending)
  const sortedPeople = [...people].sort((a, b) => b.totalPoints - a.totalPoints);

  // Calculate completion percentage (mock data for now)
  const getCompletionPercentage = (person: any) => {
    // This would be calculated based on actual task completion data
    // For now, we'll use a simple formula based on points
    return Math.min(Math.round((person.totalPoints / 400) * 100), 100);
  };

  return (
    <Card className="overflow-hidden">
      <div className="bg-gradient-to-r from-purple-500 to-pink-600 px-6 py-4">
        <h3 className="text-lg font-semibold text-white flex items-center">
          <Trophy className="mr-2" />
          Family Leaderboard
        </h3>
        <p className="text-purple-100 text-sm">This week's top performers</p>
      </div>
      <CardContent className="p-6">
        <div className="space-y-3">
          {sortedPeople.map((person, index) => (
            <div key={person.id} className="flex items-center space-x-4 p-3 rounded-lg hover:bg-slate-50 transition-colors">
              <div className="flex items-center justify-center w-8 h-8">
                <span className={cn(
                  "text-lg font-bold",
                  index === 0 ? "text-accent" : "text-slate-500"
                )}>
                  {index + 1}
                </span>
              </div>
              
              <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center",
                getAvatarClass(person.avatar)
              )}>
                <span className="text-white font-semibold">
                  {getInitial(person.nickname)}
                </span>
              </div>
              
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-slate-800">{person.nickname}</h4>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="text-sm font-semibold text-slate-800">{person.totalPoints} pts</p>
                      <p className="text-xs text-slate-500">{getCompletionPercentage(person)}% completion</p>
                    </div>
                    {index === 0 && (
                      <Crown className="w-5 h-5 text-accent" />
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
