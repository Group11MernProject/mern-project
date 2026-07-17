import mongoose from 'mongoose';

const groceryItemSchema = new mongoose.Schema(
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
    },

    checked: {
      type: Boolean,
      default: false
    }
  },
  {
    _id: true
  }
);

const customItemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },

    checked: {
      type: Boolean,
      default: false
    }
  },
  {
    _id: true
  }
);

const groceryListSchema = new mongoose.Schema(
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

    items: {
      type: [groceryItemSchema],
      default: []
    },

    customItems: {
      type: [customItemSchema],
      default: []
    }
  },
  {
    timestamps: true
  }
);

groceryListSchema.index(
  {
    userId: 1,
    weekStartDate: 1
  },
  {
    unique: true
  }
);

export const GroceryList = mongoose.model(
  'GroceryList',
  groceryListSchema
);