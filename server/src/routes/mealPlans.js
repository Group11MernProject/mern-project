import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { MealPlan } from '../models/MealPlan.js';

export const mealPlansRouter = Router();
mealPlansRouter.use(requireAuth);

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

function isValidUrl(value = '') {
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

mealPlansRouter.get('/', async (req, res, next) => {
  try {
    const plan = await MealPlan.findOneAndUpdate(
      { user: req.auth.sub },
      { $setOnInsert: { user: req.auth.sub, meals: [] } },
      { upsert: true, new: true }
    );
    return res.json({ meals: plan.meals });
  } catch (error) {
    return next(error);
  }
});

mealPlansRouter.put('/:day', async (req, res, next) => {
  try {
    const day = days.find((item) => item.toLowerCase() === req.params.day.toLowerCase());
    const { recipeId = '', title = '', image = '', category = '', area = '' } = req.body || {};

    const trimmedRecipeId = String(recipeId).trim();
    const trimmedTitle = title.trim();
    const trimmedImage = image.trim();
    const trimmedCategory = category.trim().slice(0, 60);
    const trimmedArea = area.trim().slice(0, 60);

    if (!day || !trimmedRecipeId || !trimmedTitle || !isValidUrl(trimmedImage)) {
      return res.status(400).json({ message: 'Choose a valid day and recipe.' });
    }

    let plan = await MealPlan.findOne({ user: req.auth.sub });
    if (!plan) plan = new MealPlan({ user: req.auth.sub, meals: [] });
    plan.meals = plan.meals.filter((meal) => meal.day !== day);
    plan.meals.push({
      recipeId: trimmedRecipeId,
      title: trimmedTitle.slice(0, 140),
      image: trimmedImage,
      category: trimmedCategory,
      area: trimmedArea,
      day
    });
    await plan.save();
    return res.json({ meals: plan.meals, message: `${trimmedTitle} added to ${day}.` });
  } catch (error) {
    return next(error);
  }
});

mealPlansRouter.delete('/:day', async (req, res, next) => {
  try {
    const day = days.find((item) => item.toLowerCase() === req.params.day.toLowerCase());
    if (!day) return res.status(400).json({ message: 'Choose a valid day.' });
    const plan = await MealPlan.findOne({ user: req.auth.sub });
    if (!plan) return res.json({ meals: [] });
    plan.meals = plan.meals.filter((meal) => meal.day !== day);
    await plan.save();
    return res.json({ meals: plan.meals, message: `${day} is open again.` });
  } catch (error) {
    return next(error);
  }
});