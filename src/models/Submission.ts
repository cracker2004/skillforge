import mongoose, { Schema, Document, Types } from "mongoose";

export interface ISubmissionDocument extends Document {
  userId: Types.ObjectId;
  assessmentId: Types.ObjectId;
  answers: { questionIndex: number; selectedOption: number }[];
  score: number;
  totalPoints: number;
  percentage: number;
  passed: boolean;
  timeSpent: number;
  completedAt: Date;
}

const SubmissionSchema = new Schema<ISubmissionDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    assessmentId: { type: Schema.Types.ObjectId, ref: "Assessment", required: true },
    answers: [
      {
        questionIndex: { type: Number, required: true },
        selectedOption: { type: Number, required: true },
        _id: false,
      },
    ],
    score: { type: Number, required: true, default: 0 },
    totalPoints: { type: Number, required: true },
    percentage: { type: Number, required: true },
    passed: { type: Boolean, required: true },
    timeSpent: { type: Number, default: 0 },
    completedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

SubmissionSchema.index({ userId: 1, assessmentId: 1 });
SubmissionSchema.index({ userId: 1, completedAt: -1 });

export default mongoose.models.Submission ||
  mongoose.model<ISubmissionDocument>("Submission", SubmissionSchema);
