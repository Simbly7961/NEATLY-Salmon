import { pool } from "../utils/db.js";
import { Router } from "express";

const usersRouter = Router();

usersRouter.get("/", async (req, res) => {
  const result = await pool.query("SELECT * FROM users");
  return res.json({
    data: result.rows,
  });
});
usersRouter.get("/profiles", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM profiles WHERE username = 'iron'"
    );

    // Assuming you expect only one row for the given condition
    if (result.rows.length === 1) {
      return res.json({
        data: result.rows[0], // Return the first (and presumably only) row as an object
      });
    } else {
      return res.status(404).json({
        message: "No matching data found",
      });
    }
  } catch (error) {
    console.error("Error fetching data from profiles table:", error);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
});

usersRouter.post("/register", async (req, res) => {
  const newPost = {
    ...req.body,
  };
  try {
    await pool.query(
      `INSERT INTO users(email, password, first_name, last_name, creditcard)    
            VALUES ($1, $2, $3, $4, $5)`,
      [
        newPost.email,
        newPost.password,
        newPost.first_name,
        newPost.last_name,
        newPost.creditcard,
      ]
    );
    // await pool.query()
  } catch (error) {
    return res.json({
      message: `There is Error database!!! ${newPost.first_name}`,
    });
  }

  return res.json({
    message: `Post has been created successfully.`,
  });
});

export default usersRouter;
