import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { getAvatarClass, getInitial, getCompletionPercentage } from "@/lib/utils";
import { Flame, Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface FamilyProgressProps {
  people: Array<{
    id: number;
    nickname: string;
    avatar: string;
    currentStreak: number;
    totalPoints: number;
  }>;
  taskInstances: Array<{
    assignedTo: number;
    isCompleted: boolean;
    isSecondary: boolean;
  }>;
}

export default function FamilyProgress({ people, taskInstances }: FamilyProgressProps) {
  const getPersonProgress = (personId: number) => {
    const personTasks = taskInstances.filter(ti => ti.assignedTo === personId && !ti.isSecondary);
    const completedTasks = personTasks.filter(ti => ti.isCompleted);
    return {
      completed: completedTasks.length,
      total: personTasks.length,
      percentage: getCompletionPercentage(completedTasks.length, personTasks.length)
    };
  };

  return (
    <div className="mb-8">
      <h2 className="text-lg font-semibold text-slate-800 mb-4">Family Progress Today</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {people.map((person) => {
          const progress = getPersonProgress(person.id);
          return (
            <Card key={person.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center space-y-3">
                  <div className={cn(
                    "w-12 h-12 rounded-full flex items-center justify-center",
                    getAvatarClass(person.avatar)
                  )}>
                    <span className="text-white font-semibold">
                      {getInitial(person.nickname)}
                    </span>
                  </div>
                  
                  <div className="text-center">
                    <p className="font-medium text-slate-800">{person.nickname}</p>
                    <div className="flex items-center justify-center space-x-3 mt-1">
                      <div className="flex items-center space-x-1">
                        <Flame className="w-4 h-4 text-orange-500" />
                        <span className="text-xs text-slate-600">{person.currentStreak}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Star className="w-4 h-4 text-accent" />
                        <span className="text-xs text-slate-600">{person.totalPoints}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="w-full">
                    <Progress value={progress.percentage} className="h-2" />
                  </div>
                  
                  <p className="text-xs text-slate-500">
                    {progress.completed} of {progress.total} done
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
