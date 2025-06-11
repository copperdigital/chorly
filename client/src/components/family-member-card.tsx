import { type FamilyMemberWithStats } from "@shared/schema";
import { Card } from "@/components/ui/card";

interface FamilyMemberCardProps {
  member: FamilyMemberWithStats;
  isSelected: boolean;
  isCompact?: boolean;
  onSelect: () => void;
}

export default function FamilyMemberCard({ member, isSelected, isCompact = false, onSelect }: FamilyMemberCardProps) {
  if (isCompact) {
    return (
      <Card 
        className={`min-w-[120px] p-4 card-hover transition-all duration-300 shadow-lg ${
          isSelected ? 'ring-2 ring-primary opacity-100 shadow-xl' : 'opacity-60 hover:opacity-80'
        }`}
        onClick={onSelect}
      >
        <div className="flex flex-col items-center space-y-2">
          <div 
            className="w-12 h-12 rounded-full flex items-center justify-center text-white text-lg font-bold"
            style={{ background: `linear-gradient(135deg, ${member.color}, ${member.color}dd)` }}
          >
            {member.name.charAt(0).toUpperCase()}
          </div>
          <h3 className="text-sm font-semibold text-gray-900 text-center">{member.name}</h3>
        </div>
      </Card>
    );
  }

  return (
    <Card 
      className={`min-w-[280px] p-6 card-hover transition-all duration-300 ${
        isSelected ? 'ring-2 ring-primary shadow-xl' : 'shadow-lg'
      }`}
      onClick={onSelect}
    >
      <div className="flex items-center space-x-4 mb-4">
        <div 
          className="w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl font-bold"
          style={{ background: `linear-gradient(135deg, ${member.color}, ${member.color}dd)` }}
        >
          {member.name.charAt(0).toUpperCase()}
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{member.name}</h3>
          <p className="text-sm text-gray-500 capitalize">
            {member.role} {member.age && `(${member.age})`}
          </p>
        </div>
      </div>
      
      {/* Streak Counter */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-4 mb-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Current Streak</p>
            <p className="text-2xl font-bold text-green-600">{member.currentStreak} days</p>
          </div>
          <div className="text-3xl">🔥</div>
        </div>
      </div>

      {/* Daily Progress */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-700">Today's Tasks</span>
          <span className="text-sm text-gray-500">
            {member.tasksCompletedToday}/{member.tasksAssignedToday}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div 
            className="bg-gradient-to-r from-green-500 to-blue-500 h-3 rounded-full transition-all duration-500"
            style={{ width: `${member.progressPercentage}%` }}
          />
        </div>
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-500">Points Today</span>
          <span 
            className="text-sm font-semibold"
            style={{ color: member.color }}
          >
            {member.pointsEarnedToday} pts
          </span>
        </div>
      </div>
    </Card>
  );
}
