export const swaggerSpec = {
  openapi: '3.0.3',
  info: {
    title: 'PlatePilot API',
    version: '1.0.0',
    description: 'JSON API for recipe discovery, authentication, and weekly meal planning.'
  },
  servers: [{ url: '/api', description: 'Current server' }],
  tags: [{ name: 'System' }, { name: 'Recipes' }, { name: 'Authentication' }, { name: 'Meal plan' }],
  components: {
    securitySchemes: { bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' } },
    schemas: {
      Recipe: {
        type: 'object',
        properties: {
          id: { type: 'string', example: '52772' },
          title: { type: 'string', example: 'Teriyaki Chicken Casserole' },
          image: { type: 'string', format: 'uri' },
          category: { type: 'string', example: 'Chicken' },
          area: { type: 'string', example: 'Japanese' }
        }
      }
    }
  },
  paths: {
    '/health': {
      get: { tags: ['System'], summary: 'Check API health', responses: { 200: { description: 'API is healthy' } } }
    },
    '/recipes': {
      get: {
        tags: ['Recipes'], summary: 'Search recipes through TheMealDB',
        parameters: [{ in: 'query', name: 'search', schema: { type: 'string' }, example: 'chicken' }],
        responses: { 200: { description: 'Recipe results' } }
      }
    },
    '/recipes/{id}': {
      get: {
        tags: ['Recipes'], summary: 'Get one recipe',
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Recipe detail' }, 404: { description: 'Not found' } }
      }
    },
    '/auth/register': {
      post: {
        tags: ['Authentication'], summary: 'Create an account and send verification email',
        requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['name', 'email', 'password'], properties: { name: { type: 'string' }, email: { type: 'string', format: 'email' }, password: { type: 'string', format: 'password' } } } } } },
        responses: { 201: { description: 'Account created' }, 400: { description: 'Invalid input' } }
      }
    },
    '/auth/login': {
      post: {
        tags: ['Authentication'], summary: 'Sign in with email and password',
        requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', properties: { email: { type: 'string' }, password: { type: 'string' } } } } } },
        responses: { 200: { description: 'Signed in' }, 401: { description: 'Invalid credentials' } }
      }
    },
    '/meal-plans': {
      get: { tags: ['Meal plan'], summary: 'Get the current weekly plan', security: [{ bearerAuth: [] }], responses: { 200: { description: 'Weekly meals' }, 401: { description: 'Not authenticated' } } }
    },
    '/meal-plans/{day}': {
      put: {
        tags: ['Meal plan'], summary: 'Assign a recipe to a weekday', security: [{ bearerAuth: [] }],
        parameters: [{ in: 'path', name: 'day', required: true, schema: { type: 'string', example: 'Monday' } }],
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/Recipe' } } } },
        responses: { 200: { description: 'Plan updated' }, 401: { description: 'Not authenticated' } }
      },
      delete: {
        tags: ['Meal plan'], summary: 'Remove a recipe from a weekday', security: [{ bearerAuth: [] }],
        parameters: [{ in: 'path', name: 'day', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Meal removed' } }
      }
    }
  }
};

