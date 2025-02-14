const express = require('express');
const cors = require('cors');
const sql = require('./db_config/supabaseClient');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const admin = require("firebase-admin");
const serviceAccount = require("./serviceAccount.json"); // Replace with actual path

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://chefster-e2086.firebaseio.com" // Replace with your Firebase URL
});

const db = admin.firestore(); // Initialize Firestore


app.get('/recipes', async (req, res) => {
    try {
        const recipes = await sql`SELECT * FROM recipes`;
        res.json(recipes);
    } catch (error) {
        console.error('Error fetching recipes:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.get('/recipes/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const recipe = await sql`SELECT * FROM recipes WHERE id = ${id}`;
        if (recipe.length > 0) {
            res.json(recipe[0]);
        } else {
            res.status(404).json({ error: 'Recipe not found' });
        }
    } catch (error) {
        console.error('Error fetching recipe:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.get('/recipes/mealType/:mealType', async (req, res) => {
    const { mealType } = req.params;
    try {
        const recipes = await sql`SELECT * FROM recipes WHERE meal_type = ${mealType}`;
        res.json(recipes);
    } catch (error) {
        console.error('Error fetching recipes by meal type:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.get('/recipes/dietType/:dietType', async (req, res) => {
    const { dietType } = req.params;

    try {
        const recipes = await sql`SELECT * FROM recipes WHERE diet_type = ${dietType}`;
        res.status(200).json(recipes);
    } catch (error) {
        console.error('Error fetching recipes by diet type:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }

})

// get all the recipes including the step instructions
app.get('/recipes_with_steps', async (req, res) => {
    try {
        const recipes = await sql`
            SELECT r.*, COALESCE(json_agg(cs.*) FILTER (WHERE cs.id IS NOT NULL), '[]') as steps
            FROM recipes r
            LEFT JOIN cooking_steps cs ON r.id = cs.recipe_id
            GROUP BY r.id
        `;
        res.json(recipes);
    } catch (error) {
        console.error('Error fetching recipes with steps:', error.message);
        res.status(500).json({ error: error.message });
    }
});

// get the recipes based on the cooking time, number of servings, and meal_type, and ingredients
// Take a look for the node.js pg module
app.get('/recipes_filter', async (req, res) => {
    const { cookingTime, mealType, dietType, ingredients } = req.query;
    // Parse ingredients from query, if provided
    const ingredientsArray = ingredients ? ingredients.split(',') : [];

    try {
        const recipes = await sql`
        SELECT 
           r.recipe_name,
           r.cooking_time,
           r.servings,
           r."energy(kcal)" as energy,
           r.ingredients, -- This column contains the full formatted ingredients list
           r.id,
           r.image_uri,
           COALESCE(json_agg(DISTINCT cs.*) FILTER (WHERE cs.id IS NOT NULL), '[]') as steps
        FROM recipes r
        LEFT JOIN cooking_steps cs ON r.id = cs.recipe_id
        JOIN recipe_meal_type rmt ON r.id = rmt.recipe_id
        JOIN meal_type mt ON rmt.meal_type_id = mt.id
        JOIN diet_type dt ON r.diet_type = dt.id
        WHERE r.cooking_time <= ${cookingTime}::int
          AND LOWER(mt.meal_type) = LOWER(${mealType})::text
          AND LOWER(dt.diet_type) = LOWER(${dietType})::text
          ${ingredientsArray.length > 0
                ? sql`
                AND r.id IN (
                  SELECT ri.recipe_id
                  FROM recipe_ingredient ri
                  JOIN ingredients i ON ri.ingredient_id = i.id
                  WHERE LOWER(TRIM(i.ingredient_name)) ILIKE ANY(${sql.array(
                    ingredientsArray.map(name => `%${name.trim().toLowerCase()}%`)
                )})
                )
              `
                : sql``}
        GROUP BY r.id
        ORDER BY r.cooking_time;
      `;

        console.log("Executing query with results:", recipes);
        console.log("Executing query with parameters:", {
            cookingTime,
            mealType,
            dietType,
            ingredientsArray
        });

        res.status(200).json(recipes);
    } catch (error) {
        console.error('Error filtering recipes:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


// search for the ingredients and store them into array
app.get('/ingredients', async (req, res) => {
    const { ingredient } = req.query;

    try {
        const ingredients = await sql`
            SELECT ingredient_name
            FROM ingredients
            WHERE ingredient_name ILIKE ${'%' + ingredient + '%'}
            LIMIT 5;
        `;

        const ingredientNames = ingredients.map((ingredient) => ingredient.ingredient_name);
        console.log('Ingredients:', ingredientNames);
        res.status(200).json(ingredientNames);
    } catch (error) {
        console.error('Error fetching ingredients:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});



const http = require('http');
const { Server } = require('socket.io');

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Adjust as needed
    methods: ["GET", "POST"],
  },
});

io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('sendMessage', async (messageData) => {
        // try {
        //     await db.collection('privateMessages').add({
        //         ...messageData,
        //         timestamp: admin.firestore.FieldValue.serverTimestamp(),
        //     });

            // io.emit('receiveMessage', messageData); // Broadcast to all users
        // } catch (error) {
        //     console.error("Error saving message:", error);
        // }
    });

    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});




const PORT = process.env.PORT || 6000;
server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
