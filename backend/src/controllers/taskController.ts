import { Request, Response } from 'express';
import TaskModel, { Task, TaskStatus } from '../models/Task';
import mongoose from 'mongoose';

interface AuthRequest extends Request {
  user?: { id: mongoose.Types.ObjectId };
}

export const createTask = async (req: AuthRequest, res: Response) => {
  try {
    const { projectId } = req.params;
    const { title, description, status, assignee, dueDate } = req.body;

    if (!title || !description || !status || !projectId) {
      return res.status(400).json({ message: 'Please enter all required fields' });
    }

    const newTask = new TaskModel({
      projectId: new mongoose.Types.ObjectId(projectId),
      title,
      description,
      status: status as TaskStatus,
      assignee: assignee ? new mongoose.Types.ObjectId(assignee) : undefined,
      dueDate: dueDate ? new Date(dueDate) : undefined,
      createdAt: new Date(),
    });

    const createdTask = await newTask.save();

    res.status(201).json(createdTask);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getTasksByProject = async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;

    const tasks = await TaskModel.find({ projectId: new mongoose.Types.ObjectId(projectId) });

    res.status(200).json(tasks);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateTask = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, description, status, assignee, dueDate } = req.body;

    const updatedTask: Partial<Task> = {
      title,
      description,
      status: status as TaskStatus,
      assignee: assignee ? new mongoose.Types.ObjectId(assignee) : undefined,
      dueDate: dueDate ? new Date(dueDate) : undefined,
    };

    const task = await TaskModel.findByIdAndUpdate(
      id,
      { $set: updatedTask },
      { new: true } // Return the updated document
    );

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.status(200).json(task);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const deleteTask = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const result = await TaskModel.findByIdAndDelete(id);

    if (!result) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.status(200).json({ message: 'Task removed' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};