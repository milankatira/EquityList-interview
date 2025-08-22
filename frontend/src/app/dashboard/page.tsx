"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PlusIcon } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '../../components/ui/dialog';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import Link from 'next/link';
import api from '@/lib/api';

interface Project {
  _id: string;
  name: string;
  description: string;
  createdAt: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isCreateProjectModalOpen, setIsCreateProjectModalOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDescription, setNewProjectDescription] = useState('');

  const { data: projects, isLoading, isError } = useQuery<Project[]>({
    queryKey: ['projects'],
    queryFn: async () => {
      const response = await api.get('/projects');
      return response.data;
    },
  });

  const createProjectMutation = useMutation({
    mutationFn: async (newProject: { name: string; description: string }) => {
      const response = await api.post('/projects', newProject);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      setIsCreateProjectModalOpen(false);
      setNewProjectName('');
      setNewProjectDescription('');
    },
    onError: (error: any) => {
      alert(error.response?.data?.message || 'Failed to create project');
    },
  });

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    createProjectMutation.mutate({ name: newProjectName, description: newProjectDescription });
  };

  const handleLogout = async () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');

  };

  if (isLoading) return <div className="p-6">Loading projects...</div>;
  if (isError) return <div className="p-6 text-red-500">Error loading projects. Please try again.</div>;

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 dark:bg-gray-900">
      <header className="flex items-center justify-between p-6 bg-white dark:bg-gray-800 shadow-sm">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="flex items-center gap-4">
          <Button onClick={() => setIsCreateProjectModalOpen(true)}>
            <PlusIcon className="mr-2 h-4 w-4" /> Create New Project
          </Button>
          <Button variant="outline" onClick={handleLogout}>
            Logout
          </Button>
        </div>
      </header>
      <main className="flex-1 p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects?.map((project) => (
          <Link key={project._id} href={`/projects/${project._id}`}>
            <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle>{project.name}</CardTitle>
                <CardDescription>{new Date(project.createdAt).toLocaleDateString()}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
                  {project.description}
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </main>

      <Dialog open={isCreateProjectModalOpen} onOpenChange={setIsCreateProjectModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create New Project</DialogTitle>
            <DialogDescription>
              Fill in the details for your new project.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateProject}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Project Name</Label>
                <Input
                  id="name"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newProjectDescription}
                  onChange={(e) => setNewProjectDescription(e.target.value)}
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={createProjectMutation.isPending}>
                {createProjectMutation.isPending ? 'Creating...' : 'Create Project'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
