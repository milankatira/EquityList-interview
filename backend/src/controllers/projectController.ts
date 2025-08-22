import { Request, Response } from 'express';
import ProjectModel, { Project } from '../models/Project';
import { User } from '../models/User'; // For AuthRequest interface
import mongoose from 'mongoose';

interface AuthRequest extends Request {
  user?: { id: mongoose.Types.ObjectId };
}

export const createProject = async (req: AuthRequest, res: Response) => {
  try {
    const { name, description } = req.body;

    if (!name || !description) {
      return res.status(400).json({ message: 'Please enter all fields' });
    }

    const newProject = new ProjectModel({
      name,
      description,
      createdBy: req.user!.id,
      createdAt: new Date(),
    });

    const createdProject = await newProject.save();

    res.status(201).json(createdProject);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getProjects = async (req: AuthRequest, res: Response) => {
  try {
    const projects = await ProjectModel.find({ createdBy: req.user!.id });

    res.status(200).json(projects);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getProjectById = async (req: Request, res: Response) => {
  try {
    const project = await ProjectModel.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    res.status(200).json(project);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const deleteProject = async (req: Request, res: Response) => {
  try {
    const result = await ProjectModel.findByIdAndDelete(req.params.id);

    if (!result) {
      return res.status(404).json({ message: 'Project not found' });
    }

    res.status(200).json({ message: 'Project removed' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};