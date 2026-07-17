import mongoose from 'mongoose';

const mealSchema = new mongoose.Schema(
  {
    recipeId: { type: String, required: true },
    title: { type: String, required: true },
    image: { type: String, required: true },
    category: { type: String },
    area: { type: String },
    day: {
      type: String,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      required: true
    }
  },
  { _id: true, timestamps: true }
);

const mealPlanSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    meals: [mealSchema]
  },
  { timestamps: true }
);

export const MealPlan = mongoose.model('MealPlan', mealPlanSchema);

