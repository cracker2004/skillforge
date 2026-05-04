import mongoose, { Schema, Document, Types } from "mongoose";

export interface IAssessmentDocument extends Document {
  title: string;
  description: string;
  category: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  questions: {
    text: string;
    type: "mcq" | "true_false";
    options: { text: string; isCorrect: boolean }[];
    explanation?: string;
    points: number;
  }[];
  timeLimit: number;
  passingScore: number;
  tags: string[];
  createdBy: Types.ObjectId;
  isPublished: boolean;
  totalPoints: number;
  attemptCount: number;
}

const OptionSchema = new Schema(
  { text: { type: String, required: true }, isCorrect: { type: Boolean, required: true } },
  { _id: false }
);

const QuestionSchema = new Schema(
  {
    text: { type: String, required: true },
    type: { type: String, enum: ["mcq", "true_false"], default: "mcq" },
    options: { type: [OptionSchema], required: true },
    explanation: { type: String },
    points: { type: Number, default: 10, min: 1 },
  },
  { _id: true }
);

const AssessmentSchema = new Schema<IAssessmentDocument>(
  {
    title: { type: String, required: true, trim: true, minlength: 3, maxlength: 100 },
    description: { type: String, required: true, maxlength: 1000 },
    category: { type: String, required: true, trim: true },
    difficulty: { type: String, enum: ["beginner", "intermediate", "advanced"], default: "beginner" },
    questions: { type: [QuestionSchema], required: true },
    timeLimit: { type: Number, required: true, min: 5, max: 180 },
    passingScore: { type: Number, default: 70, min: 0, max: 100 },
    tags: [{ type: String, trim: true }],
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    isPublished: { type: Boolean, default: true },
    totalPoints: { type: Number, default: 0 },
    attemptCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

AssessmentSchema.pre("save", function () {
  this.totalPoints = this.questions.reduce((sum, q) => sum + q.points, 0);
});

AssessmentSchema.index({ category: 1, difficulty: 1 });
AssessmentSchema.index({ createdBy: 1 });
AssessmentSchema.index({ tags: 1 });

export default mongoose.models.Assessment ||
  mongoose.model<IAssessmentDocument>("Assessment", AssessmentSchema);
