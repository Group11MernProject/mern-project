import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { MealPlan } from '../models/MealPlan.js';

export const mealPlansRouter = Router();
mealPlansRouter.use(requireAuth);

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

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
    const { recipeId: suppliedRecipeId, id, title, image, category = '', area = '' } = req.body || {};
    // Accept the normalized recipe object's `id` as well as the documented
    // `recipeId` field, so a client-side naming mismatch cannot block planning.
    const recipeId = suppliedRecipeId || id;
    if (!day || !recipeId || !title || !image) {
      return res.status(400).json({ message: 'Choose a valid day and recipe.' });
    }

    let plan = await MealPlan.findOne({ user: req.auth.sub });
    if (!plan) plan = new MealPlan({ user: req.auth.sub, meals: [] });
    plan.meals = plan.meals.filter((meal) => meal.day !== day);
    plan.meals.push({ recipeId, title: title.slice(0, 140), image, category, area, day });
    await plan.save();
    return res.json({ meals: plan.meals, message: `${title} added to ${day}.` });
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
