"use client";

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PlusIcon, LogOutIcon, TrashIcon } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '../../components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../../components/ui/alert-dialog"
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import Link from 'next/link';
import api from '@/lib/api';
import toast from 'react-hot-toast';

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
  const [isDeleteProjectModalOpen, setIsDeleteProjectModalOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isCreateProjectModalOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isCreateProjectModalOpen]);

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
      toast.success('Project created successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create project');
    },
  });

  const deleteProjectMutation = useMutation({
    mutationFn: async (projectId: string) => {
      await api.delete(`/projects/${projectId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast.success('Project deleted successfully!');
      setIsDeleteProjectModalOpen(false);
      setProjectToDelete(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete project');
    },
  });

  const handleDeleteProjectClick = (project: Project) => {
    setProjectToDelete(project);
    setIsDeleteProjectModalOpen(true);
  };

  const confirmDeleteProject = () => {
    if (projectToDelete) {
      deleteProjectMutation.mutate(projectToDelete._id);
    }
  };

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    createProjectMutation.mutate({ name: newProjectName, description: newProjectDescription });
  };

  const handleLogout = async () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 dark:bg-gray-900">

      {/* Header */}
      <header className="flex flex-col sm:flex-row items-center justify-between p-6 bg-white dark:bg-gray-800 shadow-sm gap-4">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Dashboard</h1>
        <div className="flex items-center gap-2">
          <Button onClick={() => setIsCreateProjectModalOpen(true)} className="flex items-center gap-2">
            <PlusIcon className="h-4 w-4" /> Create Project
          </Button>
          <Button variant="outline" onClick={handleLogout} className="flex items-center gap-2">
            <LogOutIcon className="h-4 w-4" /> Logout
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-6">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <span className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-black"></span>
            <span className="ml-4 text-lg text-gray-700 dark:text-gray-300">Loading projects...</span>
          </div>
        ) : isError ? (
          <div className="flex justify-center items-center h-64 text-red-500 text-lg">
            Error loading projects. Please try again.
          </div>
        ) : projects && projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500 dark:text-gray-400">
            <PlusIcon className="h-10 w-10 mb-2" />
            <p className="text-lg">No projects yet. Create your first project!</p>
            <Button onClick={() => setIsCreateProjectModalOpen(true)} className="mt-4 ">
              <PlusIcon className="h-4 w-4" /> Create Project
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects?.map((project) => (
              <Link key={project._id} href={`/projects/${project._id}`} className="focus:outline-none focus:ring-2 focus:ring-black rounded">
                <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <div className="flex flex-col">
                      <CardTitle className="truncate">{project.name}</CardTitle>
                      <CardDescription>{new Date(project.createdAt).toLocaleDateString()}</CardDescription>
                    </div>
                    <Button variant="ghost" size="icon" onClick={(e) => {
                      e.preventDefault();
                      handleDeleteProjectClick(project);
                    }}>
                      <TrashIcon className="h-5 w-5 text-gray-500 hover:text-red-500" />
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
                      {project.description}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </main>

      {/* Create Project Modal */}
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
                  ref={inputRef}
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  required
                  autoFocus
                  placeholder="Enter project name"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newProjectDescription}
                  onChange={(e) => setNewProjectDescription(e.target.value)}
                  required
                  placeholder="Describe your project"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={createProjectMutation.isPending} className="bg-black hover:bg-gray-700 text-white w-full">
                {createProjectMutation.isPending ? 'Creating...' : 'Create Project'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Project Confirmation Dialog */}
      <AlertDialog open={isDeleteProjectModalOpen} onOpenChange={setIsDeleteProjectModalOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the project
              <span className="font-bold"> {projectToDelete?.name}</span> and all its associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteProject} className="bg-red-500 hover:bg-red-600 text-white">
              {deleteProjectMutation.isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}