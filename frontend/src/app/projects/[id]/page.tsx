"use client";

import { useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PlusIcon, Trash2Icon, EditIcon, ArrowLeftIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';

import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import api from '@/lib/api';
import toast from 'react-hot-toast';

import {
  DndContext,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  useDroppable,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Input } from '@/components/ui/input';

interface Project {
  _id: string;
  name: string;
  description: string;
  createdBy: string;
  createdAt: string;
}

interface Task {
  _id: string;
  projectId: string;
  title: string;
  description: string;
  status: "Todo" | "In Progress" | "Done";
  assignee?: string;
  dueDate?: string;
  createdAt: string;
}

interface User {
  _id: string;
  name: string;
  email: string;
}

interface TaskCardProps {
  task: Task;
  users: User[] | undefined;
  handleEditTask: (task: Task) => void;
  handleDeleteTask: (taskId: string) => void;
}

function TaskCard({ task, users, handleEditTask, handleDeleteTask }: TaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task._id });



  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 0,
    opacity: isDragging ? 0.8 : 1,
  };

  return (
    <Card ref={setNodeRef} style={style} className="touch-action-none">
      <CardHeader {...attributes} {...listeners} > {/* This div will be the drag handle */}
        <CardTitle>{task.title}</CardTitle>
        <CardDescription>{task.assignee ? `Assigned to: ${users?.find(u => u._id === task.assignee)?.name}` : 'Unassigned'}</CardDescription>
      </CardHeader>
      <CardContent className="flex justify-between items-center">
        <p className="text-sm text-gray-600 dark:text-gray-400">{task.description}</p>
        <div className="flex gap-2">
          <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); handleEditTask(task); }}>
            <EditIcon className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); handleDeleteTask(task._id); }}>
            <Trash2Icon className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

interface ColumnProps {
  id: string;
  title: string;
  tasks: Task[];
  users: User[] | undefined;
  handleEditTask: (task: Task) => void;
  handleDeleteTask: (taskId: string) => void;
}

function Column({ id, title, tasks, users, handleEditTask, handleDeleteTask }: ColumnProps) {
  const { setNodeRef } = useDroppable({
    id: id,
  });



  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">{title}</h2>
      <SortableContext items={tasks.map(task => task._id)} strategy={verticalListSortingStrategy}>
        <div ref={setNodeRef} id={id} className="min-h-[100px] rounded-md p-2 bg-gray-50 dark:bg-gray-700"> {/* Added ref and a background for visibility */}
          {tasks.map(task => (
            <TaskCard
              key={task._id}
              task={task}
              users={users}
              handleEditTask={handleEditTask}
              handleDeleteTask={handleDeleteTask}
            />
          ))}
        </div>
      </SortableContext>
    </div>
  );
}

export default function ProjectDetailPage() {
  const { id: projectId } = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [isCreateTaskModalOpen, setIsCreateTaskModalOpen] = useState(false);
  const [isEditTaskModalOpen, setIsEditTaskModalOpen] = useState(false);
  const [currentTask, setCurrentTask] = useState<Task | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [newTaskStatus, setNewTaskStatus] = useState<Task['status']>('Todo');
  const [newTaskAssignee, setNewTaskAssignee] = useState('');
  const [newTaskDueDate, setNewTaskDueDate] = useState('');

  const { data: project, isLoading: isLoadingProject, isError: isErrorProject } = useQuery<Project>({
    queryKey: ['project', projectId],
    queryFn: async () => {
      const response = await api.get(`/projects/${projectId}`);
      return response.data;
    },
    enabled: !!projectId,
  });

  const { data: fetchedTasks, isLoading: isLoadingTasks, isError: isErrorTasks } = useQuery<Task[]>({
    queryKey: ['tasks', projectId],
    queryFn: async () => {
      const response = await api.get(`/projects/${projectId}/tasks`);
      return response.data;
    },
    enabled: !!projectId,
  });

  const [tasks, setTasks] = useState<Task[]>([]);

  // Update local tasks state when fetchedTasks changes
  useMemo(() => {
    if (fetchedTasks) {
      setTasks(fetchedTasks);
    }
  }, [fetchedTasks]);

  const { data: users, isLoading: isLoadingUsers, isError: isErrorUsers } = useQuery<User[]>({
    queryKey: ['users'],
    queryFn: async () => {
      const response = await api.get('/users');
      return response.data;
    },
  });

  const createTaskMutation = useMutation({
    mutationFn: async (newTask: Omit<Task, '_id' | 'createdAt' | 'projectId'>) => {
      const response = await api.post(`/projects/${projectId}/tasks`, newTask);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', projectId] });
      setIsCreateTaskModalOpen(false);
      setNewTaskTitle('');
      setNewTaskDescription('');
      setNewTaskStatus('Todo');
      setNewTaskAssignee('');
      setNewTaskDueDate('');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create task');
    },
  });

  const updateTaskMutation = useMutation({
    mutationFn: async (updatedTask: Partial<Task> & { _id: string }) => {
      const response = await api.put(`/tasks/${updatedTask._id}`, updatedTask);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', projectId] });
      setIsEditTaskModalOpen(false);
      setCurrentTask(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update task');
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: async (taskId: string) => {
      await api.delete(`/tasks/${taskId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', projectId] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete task');
    },
  });

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    createTaskMutation.mutate({
      title: newTaskTitle,
      description: newTaskDescription,
      status: newTaskStatus,
      assignee: newTaskAssignee || undefined,
      dueDate: newTaskDueDate || undefined,
    });
  };

  const handleEditTask = (task: Task) => {
    setCurrentTask(task);
    setNewTaskTitle(task.title);
    setNewTaskDescription(task.description);
    setNewTaskStatus(task.status);
    setNewTaskAssignee(task.assignee || '');
    setNewTaskDueDate(task.dueDate || '');
    setIsEditTaskModalOpen(true);
  };

  const handleUpdateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentTask) return;
    updateTaskMutation.mutate({
      _id: currentTask._id,
      title: newTaskTitle,
      description: newTaskDescription,
      status: newTaskStatus,
      assignee: newTaskAssignee || undefined,
      dueDate: newTaskDueDate || undefined,
    });
  };

  const handleDeleteTask = (taskId: string) => {
    if (confirm('Are you sure you want to delete this task?')) {
      deleteTaskMutation.mutate(taskId);
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        delay: 0, // milliseconds
        tolerance: 5, // pixels
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;



    if (!over) return;

    const activeId = String(active.id);
    const overId = String(over.id);

    const activeTask = tasks.find(task => task._id === activeId);
    let targetColumnId: Task['status'] | null = null;

    if (overId === 'Todo' || overId === 'In Progress' || overId === 'Done') {
      targetColumnId = overId as Task['status'];
    } else {
      const overTask = tasks.find(task => task._id === overId);
      targetColumnId = overTask?.status || null;
    }



    if (!activeTask || !targetColumnId) return;

    const activeColumnId = activeTask.status;

    if (activeColumnId === targetColumnId) {
      // Reordering within the same column
      setTasks(prevTasks => {
        const oldIndex = prevTasks.findIndex(task => task._id === activeId);
        const newIndex = prevTasks.findIndex(task => task._id === overId);

        if (oldIndex !== -1 && newIndex !== -1) {
          const newTasks = arrayMove(prevTasks, oldIndex, newIndex);

          return newTasks;
        }
        return prevTasks;
      });
    } else {
      // Moving between columns
      const newStatus: Task['status'] = targetColumnId;

      // Optimistic UI update
      setTasks(prevTasks => {
        const updated = prevTasks.map(task =>
          task._id === activeId ? { ...task, status: newStatus } : task
        );

        return updated;
      });

      // API call to update the task status
      updateTaskMutation.mutate({ _id: activeId, status: newStatus });
    }
  };

  if (isLoadingProject || isLoadingTasks || isLoadingUsers) return <div className="p-6">Loading...</div>;
  if (isErrorProject || isErrorTasks || isErrorUsers) return <div className="p-6 text-red-500">Error loading data.</div>;
  if (!project) return <div className="p-6">Project not found.</div>;

  const tasksTodo = tasks?.filter(task => task.status === 'Todo');
  const tasksInProgress = tasks?.filter(task => task.status === 'In Progress');
  const tasksDone = tasks?.filter(task => task.status === 'Done');

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 dark:bg-gray-900">
      <header className="flex items-center justify-between p-6 bg-white dark:bg-gray-800 shadow-sm">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeftIcon className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{project.name}</h1>
            <p className="text-gray-600 dark:text-gray-400">{project.description}</p>
          </div>
        </div>
        <Button onClick={() => setIsCreateTaskModalOpen(true)}>
          <PlusIcon className="mr-2 h-4 w-4" /> Add New Task
        </Button>
      </header>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragEnd={onDragEnd}
      >
        <main className="flex-1 p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Column
            id="Todo"
            title="Todo"
            tasks={tasksTodo}
            users={users}
            handleEditTask={handleEditTask}
            handleDeleteTask={handleDeleteTask}
          />
          <Column
            id="In Progress"
            title="In Progress"
            tasks={tasksInProgress}
            users={users}
            handleEditTask={handleEditTask}
            handleDeleteTask={handleDeleteTask}
          />
          <Column
            id="Done"
            title="Done"
            tasks={tasksDone}
            users={users}
            handleEditTask={handleEditTask}
            handleDeleteTask={handleDeleteTask}
          />
        </main>
      </DndContext>

      {/* Create Task Modal */}
      <Dialog open={isCreateTaskModalOpen} onOpenChange={setIsCreateTaskModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create New Task</DialogTitle>
            <DialogDescription>
              Fill in the details for your new task.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateTask}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Task Title</Label>
                <Input
                  id="title"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newTaskDescription}
                  onChange={(e) => setNewTaskDescription(e.target.value)}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="status">Status</Label>
                <Select value={newTaskStatus} onValueChange={(value: Task['status']) => setNewTaskStatus(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Todo">Todo</SelectItem>
                    <SelectItem value="In Progress">In Progress</SelectItem>
                    <SelectItem value="Done">Done</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="assignee">Assignee</Label>
                <Select value={newTaskAssignee} onValueChange={(value) => setNewTaskAssignee(value === "unassigned-option" ? "" : value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select assignee" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unassigned-option">Unassigned</SelectItem>
                    {users?.map(user => (
                      <SelectItem key={user._id} value={user._id}>{user.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="dueDate">Due Date</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={newTaskDueDate}
                  onChange={(e) => setNewTaskDueDate(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={createTaskMutation.isPending}>
                {createTaskMutation.isPending ? 'Creating...' : 'Create Task'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Task Modal */}
      <Dialog open={isEditTaskModalOpen} onOpenChange={setIsEditTaskModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
            <DialogDescription>
              Update the details for this task.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateTask}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="editTitle">Task Title</Label>
                <Input
                  id="editTitle"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="editDescription">Description</Label>
                <Textarea
                  id="editDescription"
                  value={newTaskDescription}
                  onChange={(e) => setNewTaskDescription(e.target.value)}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="editStatus">Status</Label>
                <Select value={newTaskStatus} onValueChange={(value: Task['status']) => setNewTaskStatus(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Todo">Todo</SelectItem>
                    <SelectItem value="In Progress">In Progress</SelectItem>
                    <SelectItem value="Done">Done</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="editAssignee">Assignee</Label>
                <Select value={newTaskAssignee} onValueChange={(value) => setNewTaskAssignee(value === "unassigned-option" ? "" : value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select assignee" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unassigned-option">Unassigned</SelectItem>
                    {users?.map(user => (
                      <SelectItem key={user._id} value={user._id}>{user.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="editDueDate">Due Date</Label>
                <Input
                  id="editDueDate"
                  type="date"
                  value={newTaskDueDate}
                  onChange={(e) => setNewTaskDueDate(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={updateTaskMutation.isPending}>
                {updateTaskMutation.isPending ? 'Updating...' : 'Update Task'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}