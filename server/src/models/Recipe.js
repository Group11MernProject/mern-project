import mongoose from 'mongoose';

const ingredientSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },

    quantity: {
      type: Number,
      default: null,
      min: 0
    },

    unit: {
      type: String,
      default: '',
      trim: true
    }
  },
  {
    _id: false
  }
);

const recipeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },

    externalRecipeId: {
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
      default: '',
      trim: true
    },

    ingredients: {
      type: [ingredientSchema],
      default: []
    },

    instructions: {
      type: String,
      default: '',
      trim: true
    },

    savedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

recipeSchema.index(
  {
    userId: 1,
    externalRecipeId: 1
  },
  {
    unique: true
  }
);

export const Recipe = mongoose.model('Recipe', recipeSchema);