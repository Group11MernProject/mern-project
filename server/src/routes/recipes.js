import { Router } from 'express';
import { getRecipe, searchRecipes } from '../services/recipes.js';

export const recipesRouter = Router();

recipesRouter.get('/', async (req, res, next) => {
  try {
    const query = typeof req.query.search === 'string' ? req.query.search.slice(0, 80) : '';
    const recipes = await searchRecipes(query);
    return res.json({ recipes, count: recipes.length, source: 'TheMealDB' });
  } catch (error) {
    return next(error);
  }
});

recipesRouter.get('/:id', async (req, res, next) => {
  try {
    const recipe = await getRecipe(req.params.id);
    if (!recipe) return res.status(404).json({ message: 'Recipe not found.' });
    return res.json({ recipe, source: 'TheMealDB' });
  } catch (error) {
    return next(error);
  }
});

