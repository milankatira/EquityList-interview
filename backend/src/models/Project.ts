import { Schema, model, Document } from 'mongoose';
import { ObjectId } from 'mongodb';

export interface Project extends Document {
  name: string;
  description: string;
  createdBy: ObjectId; // userId
  createdAt: Date;
}

const ProjectSchema = new Schema<Project>({
  name: { type: String, required: true },
  description: { type: String, required: true },
  createdBy: { type: Schema.Types.ObjectId, required: true, ref: 'User' }, // Reference to User model
  createdAt: { type: Date, default: Date.now },
});

const ProjectModel = model<Project>('Project', ProjectSchema);

export default ProjectModel;