const MEAL_DB = 'https://www.themealdb.com/api/json/v1/1';

export const fallbackRecipes = [
  { id: '52772', title: 'Teriyaki Chicken Casserole', image: 'https://www.themealdb.com/images/media/meals/wvpsxx1468256321.jpg', category: 'Chicken', area: 'Japanese', instructions: 'A cozy, flavor-packed chicken and rice dinner.' },
  { id: '52771', title: 'Spicy Arrabbiata Penne', image: 'https://www.themealdb.com/images/media/meals/ustsqw1468250014.jpg', category: 'Vegetarian', area: 'Italian', instructions: 'Penne tossed in a bright tomato and chili sauce.' },
  { id: '52977', title: 'Corba', image: 'https://www.themealdb.com/images/media/meals/58oia61564916529.jpg', category: 'Side', area: 'Turkish', instructions: 'A warming red lentil soup with fragrant spices.' },
  { id: '53013', title: 'Big Mac', image: 'https://www.themealdb.com/images/media/meals/urzj1d1587670726.jpg', category: 'Beef', area: 'American', instructions: 'A homemade take on an all-time burger favorite.' },
  { id: '52806', title: 'Tandoori Chicken', image: 'https://www.themealdb.com/images/media/meals/qptpvt1487339892.jpg', category: 'Chicken', area: 'Indian', instructions: 'Yogurt-marinated chicken with warm spices.' },
  { id: '52959', title: 'Baked Salmon with Fennel', image: 'https://www.themealdb.com/images/media/meals/1548772327.jpg', category: 'Seafood', area: 'British', instructions: 'Tender salmon with fresh herbs and fennel.' },
  { id: '53065', title: 'Sushi', image: 'https://www.themealdb.com/images/media/meals/g046bb1663960946.jpg', category: 'Seafood', area: 'Japanese', instructions: 'Fresh, colorful rolls made for sharing.' },
  { id: '52875', title: 'Chicken Ham and Leek Pie', image: 'https://www.themealdb.com/images/media/meals/xrrtss1511555269.jpg', category: 'Chicken', area: 'British', instructions: 'Creamy chicken and leek beneath golden pastry.' },
  { id: '52978', title: 'Kumpir', image: 'https://www.themealdb.com/images/media/meals/mlchx21564916997.jpg', category: 'Side', area: 'Turkish', instructions: 'A generously loaded baked potato.' }
];

function normalize(meal) {
  const ingredients = [];
  for (let index = 1; index <= 20; index += 1) {
    const ingredient = meal[`strIngredient${index}`]?.trim();
    if (ingredient) ingredients.push({ ingredient, measure: meal[`strMeasure${index}`]?.trim() || '' });
  }

  return {
    id: meal.idMeal,
    title: meal.strMeal,
    image: meal.strMealThumb,
    category: meal.strCategory || 'Other',
    area: meal.strArea || 'Global',
    instructions: meal.strInstructions || '',
    source: meal.strSource || meal.strYoutube || '',
    ingredients
  };
}

export async function searchRecipes(query = '') {
  try {
    const response = await fetch(`${MEAL_DB}/search.php?s=${encodeURIComponent(query)}`, {
      signal: AbortSignal.timeout(5000)
    });
    if (!response.ok) throw new Error('Recipe service unavailable');
    const data = await response.json();
    return (data.meals || []).map(normalize);
  } catch {
    const search = query.trim().toLowerCase();
    return fallbackRecipes.filter((recipe) =>
      [recipe.title, recipe.category, recipe.area].some((value) => value.toLowerCase().includes(search))
    );
  }
}

export async function getRecipe(id) {
  try {
    const response = await fetch(`${MEAL_DB}/lookup.php?i=${encodeURIComponent(id)}`, {
      signal: AbortSignal.timeout(5000)
    });
    if (!response.ok) throw new Error('Recipe service unavailable');
    const data = await response.json();
    return data.meals?.[0] ? normalize(data.meals[0]) : null;
  } catch {
    return fallbackRecipes.find((recipe) => recipe.id === id) || null;
  }
}

