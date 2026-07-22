import mongoose from 'mongoose';

const mealSchema = new mongoose.Schema(
  {
    recipeId: {
      type: String,
      required: true,
      trim: true
    },

    title: {
      type: String,
      required: true,
      trim: true
    },

    image: {
      type: String,
      required: true,
      trim: true
    },

    category: {
      type: String,
      default: '',
      trim: true
    },

    area: {
      type: String,
      default: '',
      trim: true
    },

    day: {
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
    }
  },
  {
    _id: false
  }
);

const mealPlanSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true
    },

    meals: {
      type: [mealSchema],
      default: []
    }
  },
  {
    timestamps: true
  }
);

export const MealPlan = mongoose.model('MealPlan', mealPlanSchema);
