import bcrypt from "bcrypt";
import pool from "../config/db.js";
import { registerSchema, loginSchema } from "../validators/auth_validator.js";
import jwt from "jsonwebtoken";

export const register = async (req, res, next) => {
  try {
    const result = registerSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        message: "Validation failed.",
      });
    }

    const { username, email, password } = result.data;

    const existingUser = await pool.query(
      `
            select id from users where username = $1 or email = $2;
            `,
      [username, email],
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({
        message: "Username or email already exists.",
      });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const newUser = await pool.query(
      `
        insert into users (username ,email , password_hash) values ($1,$2,$3) returning id,username,email,created_at;
        `,
      [username, email, passwordHash],
    );

    return res.status(201).json({
      message: "User registered successfully.",
      user: newUser.rows[0],
    });
  } catch (err) {
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    const result = loginSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        message: "Validation failed.",
      });
    }

    const { email, password } = result.data;

    const user = await pool.query(
      `
  SELECT id, username, email, password_hash
  FROM users
  WHERE email = $1
  `,
      [email],
    );

    if (user.rows.length === 0) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }
    const existingUser = user.rows[0];

    const passwordMatch = await bcrypt.compare(
      password,
      existingUser.password_hash,
    );

    if (!passwordMatch) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const token = jwt.sign(
      {
        userId: existingUser.id,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRES_IN,
      },
    );

    return res.status(200).json({
      message: "Login successful.",
      token,
      user: {
        id: existingUser.id,
        username: existingUser.username,
        email: existingUser.email,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const getMe = async (req, res, next) => {
  try {
    const user = await pool.query(
      `
        select id,username,email,created_at from users where id = $1
      `,
      [req.user.userId],
    );

    if (user.rows.length === 0) {
      return res.status(404).json({
        message: "User not found.",
      });
    }

    return res.status(200).json({
      user: user.rows[0],
    });
  } catch (err) {
    next(err);
  }
};
