export async function onRequestGet(context: any) {
  try {
    const { request } = context;
    const url = new URL(request.url);
    const householdId = url.searchParams.get('householdId');
    
    if (!householdId) {
      return new Response(JSON.stringify({ error: 'Household ID required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Mock data matching your development environment
    const mockData = {
      people: [
        { id: 1, householdId: 1, nickname: 'Dad', pin: '1234', isAdmin: true, currentStreak: 5, totalPoints: 150, avatar: 'blue' },
        { id: 2, householdId: 1, nickname: 'Mum', pin: '5678', isAdmin: false, currentStreak: 3, totalPoints: 120, avatar: 'pink' },
        { id: 3, householdId: 1, nickname: 'Seb', pin: '9999', isAdmin: false, currentStreak: 2, totalPoints: 80, avatar: 'green' },
        { id: 4, householdId: 1, nickname: 'Tessa', pin: '1111', isAdmin: false, currentStreak: 4, totalPoints: 100, avatar: 'purple' }
      ],
      taskInstances: [
        {
          id: 6,
          taskId: 2,
          assignedTo: 3,
          isSecondary: false,
          dueDate: '2025-06-09T23:59:59.000Z',
          completedAt: null,
          isCompleted: false,
          pointsEarned: 0,
          isOverdue: true,
          currentPriority: 1,
          task: {
            id: 2,
            householdId: 1,
            title: 'Make Bed',
            description: 'Make your bed neatly each morning',
            estimatedMinutes: 5,
            points: 10,
            isRecurring: true,
            priority: 1
          }
        },
        {
          id: 1,
          taskId: 5,
          assignedTo: 1,
          isSecondary: false,
          dueDate: '2025-06-10T23:59:59.000Z',
          completedAt: null,
          isCompleted: false,
          pointsEarned: 0,
          isOverdue: false,
          currentPriority: 1,
          task: {
            id: 5,
            householdId: 1,
            title: 'Empty Dishwasher',
            description: 'Unload clean dishes and put away',
            estimatedMinutes: 15,
            points: 20,
            isRecurring: true,
            priority: 1
          }
        },
        {
          id: 2,
          taskId: 2,
          assignedTo: 3,
          isSecondary: false,
          dueDate: '2025-06-10T23:59:59.000Z',
          completedAt: null,
          isCompleted: false,
          pointsEarned: 0,
          isOverdue: false,
          currentPriority: 1,
          task: {
            id: 2,
            householdId: 1,
            title: 'Make Bed',
            description: 'Make your bed neatly each morning',
            estimatedMinutes: 5,
            points: 10,
            isRecurring: true,
            priority: 1
          }
        },
        {
          id: 3,
          taskId: 3,
          assignedTo: 4,
          isSecondary: false,
          dueDate: '2025-06-10T23:59:59.000Z',
          completedAt: null,
          isCompleted: false,
          pointsEarned: 0,
          isOverdue: false,
          currentPriority: 1,
          task: {
            id: 3,
            householdId: 1,
            title: 'Feed Pets',
            description: 'Feed the cats and dog',
            estimatedMinutes: 10,
            points: 15,
            isRecurring: true,
            priority: 1
          }
        },
        {
          id: 4,
          taskId: 4,
          assignedTo: 2,
          isSecondary: false,
          dueDate: '2025-06-10T23:59:59.000Z',
          completedAt: null,
          isCompleted: false,
          pointsEarned: 0,
          isOverdue: false,
          currentPriority: 1,
          task: {
            id: 4,
            householdId: 1,
            title: 'Clean Bathroom',
            description: 'Clean and tidy the bathroom',
            estimatedMinutes: 20,
            points: 25,
            isRecurring: true,
            priority: 1
          }
        },
        {
          id: 5,
          taskId: 6,
          assignedTo: 1,
          isSecondary: false,
          dueDate: '2025-06-10T23:59:59.000Z',
          completedAt: null,
          isCompleted: false,
          pointsEarned: 0,
          isOverdue: false,
          currentPriority: 1,
          task: {
            id: 6,
            householdId: 1,
            title: 'Take Out Trash',
            description: 'Take bins to curb for collection',
            estimatedMinutes: 10,
            points: 15,
            isRecurring: true,
            priority: 1
          }
        }
      ]
    };

    return new Response(JSON.stringify(mockData), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}