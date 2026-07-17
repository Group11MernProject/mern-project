import mongoose from 'mongoose';

const mealPlanSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },

    weekStartDate: {
      type: Date,
      required: true,
      index: true
    },

    dayOfWeek: {
      type: String,
      required: true,
      enum: [
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday',
        'Sunday'
      ]
    },

    recipeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Recipe',
      required: true
    },

    mealType: {
      type: String,
      enum: ['breakfast', 'lunch', 'dinner'],
      default: null
    }
  },
  {
    timestamps: true
  }
);

mealPlanSchema.index({
  userId: 1,
  weekStartDate: 1,
  dayOfWeek: 1,
  mealType: 1
});

export const MealPlan = mongoose.model('MealPlan', mealPlanSchema);