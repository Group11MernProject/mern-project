import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { getRecipe, searchRecipes } from '../services/recipes.js';

export const recipesRouter = Router();

const recipeApiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // 30 requests per minute per IP
  message: { message: 'Too many recipe requests. Please slow down.' },
  standardHeaders: true,
  legacyHeaders: false,
});

recipesRouter.use(recipeApiLimiter);

recipesRouter.get('/', async (req, res, next) => {
  try {
    const query = typeof req.query.search === 'string' ? req.query.search.trim().slice(0, 80) : '';
    const recipes = await searchRecipes(query);
    return res.json({ recipes, count: recipes.length, source: 'TheMealDB' });
  } catch (error) {
    return next(error);
  }
});

recipesRouter.get('/:id', async (req, res, next) => {
  try {
    const id = req.params.id.trim();
    if (!/^\d+$/.test(id)) {
      return res.status(400).json({ message: 'Recipe id must be numeric.' });
    }

    const recipe = await getRecipe(id);
    if (!recipe) return res.status(404).json({ message: 'Recipe not found.' });
    return res.json({ recipe, source: 'TheMealDB' });
  } catch (error) {
    return next(error);
  }
});