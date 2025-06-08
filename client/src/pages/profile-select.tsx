import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth-context";
import { getAvatarClass, getInitial, getCompletionPercentage, getStreakDisplay } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { User, LogOut, Star, Flame, CheckCircle2 } from "lucide-react";

export default function ProfileSelect() {
  const { household, people, selectProfile, logout } = useAuth();

  const { data: dashboardData } = useQuery({
    queryKey: ["/api/dashboard", household?.id],
    queryFn: async () => {
      const response = await fetch(`/api/dashboard?householdId=${household?.id}`);
      if (!response.ok) throw new Error('Failed to fetch dashboard data');
      return response.json();
    },
    enabled: !!household?.id,
  });

  const handleSelectProfile = (personId: number) => {
    selectProfile(personId);
  };

  const taskInstances = dashboardData?.taskInstances || [];

  // Calculate stats for each person
  const peopleWithStats = people.map((person: any) => {
    const personTasks = taskInstances.filter((ti: any) => ti.assignedTo === person.id);
    const completedTasks = personTasks.filter((ti: any) => ti.isCompleted);
    const completion = getCompletionPercentage(completedTasks.length, personTasks.length);
    
    return {
      ...person,
      tasksToday: personTasks.length,
      completedToday: completedTasks.length,
      completionPercentage: completion
    };
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="max-w-4xl mx-auto">
        <Card className="mb-6 shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-2xl font-bold text-slate-800 mb-2">
              Welcome to Chory
            </CardTitle>
            <p className="text-slate-600">
              Choose your profile to see today's tasks
            </p>
          </CardHeader>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {peopleWithStats.map((person) => (
            <Card 
              key={person.id}
              className="cursor-pointer transition-all duration-200 border-2 hover:scale-105 border-slate-200 hover:border-primary bg-white shadow-sm hover:shadow-lg"
              onClick={() => handleSelectProfile(person.id)}
            >
              <CardContent className="p-6 text-center">
                {/* Large Avatar */}
                <div className={cn(
                  "w-24 h-24 rounded-full mx-auto mb-4 flex items-center justify-center shadow-lg",
                  getAvatarClass(person.avatar)
                )}>
                  <span className="text-white text-3xl font-bold">
                    {getInitial(person.nickname)}
                  </span>
                </div>

                {/* Name */}
                <h3 className="text-xl font-bold text-slate-800 mb-4">
                  {person.nickname}
                </h3>

                {/* Stats Grid */}
                <div className="space-y-3 mb-4">
                  {/* Task Completion Today */}
                  <div className="flex items-center justify-between bg-slate-50 rounded-lg p-3">
                    <div className="flex items-center space-x-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-medium text-slate-700">Today</span>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-slate-800">
                        {person.completedToday}/{person.tasksToday}
                      </div>
                      <div className="text-xs text-slate-500">
                        {person.completionPercentage}% done
                      </div>
                    </div>
                  </div>

                  {/* Total Points */}
                  <div className="flex items-center justify-between bg-amber-50 rounded-lg p-3">
                    <div className="flex items-center space-x-2">
                      <Star className="w-4 h-4 text-amber-600" />
                      <span className="text-sm font-medium text-slate-700">Points</span>
                    </div>
                    <div className="text-lg font-bold text-amber-700">
                      {person.totalPoints || 0}
                    </div>
                  </div>

                  {/* Current Streak */}
                  <div className="flex items-center justify-between bg-orange-50 rounded-lg p-3">
                    <div className="flex items-center space-x-2">
                      <Flame className="w-4 h-4 text-orange-600" />
                      <span className="text-sm font-medium text-slate-700">Streak</span>
                    </div>
                    <div className="text-lg font-bold text-orange-700">
                      {getStreakDisplay(person.currentStreak || 0)}
                    </div>
                  </div>
                </div>

                {/* Select Button */}
                <Button className="w-full" size="lg">
                  <User className="w-4 h-4 mr-2" />
                  Select Profile
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-6">
          <Button 
            variant="ghost" 
            onClick={logout}
            className="text-slate-500 hover:text-slate-700"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Switch Family
          </Button>
        </div>
      </div>
    </div>
  );
}