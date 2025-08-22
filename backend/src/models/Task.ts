import { Schema, model, Document } from 'mongoose';
import { ObjectId } from 'mongodb';

export type TaskStatus = "Todo" | "In Progress" | "Done";

export interface Task extends Document {
  projectId: ObjectId;
  title: string;
  description: string;
  status: TaskStatus;
  assignee?: ObjectId; // userId
  dueDate?: Date;
  createdAt: Date;
}

const TaskSchema = new Schema<Task>({
  projectId: { type: Schema.Types.ObjectId, required: true, ref: 'Project' }, // Reference to Project model
  title: { type: String, required: true },
  description: { type: String, required: true },
  status: { type: String, enum: ["Todo", "In Progress", "Done"], default: "Todo" },
  assignee: { type: Schema.Types.ObjectId, ref: 'User' }, // Reference to User model
  dueDate: { type: Date },
  createdAt: { type: Date, default: Date.now },
});

const TaskModel = model<Task>('Task', TaskSchema);

export default TaskModel;