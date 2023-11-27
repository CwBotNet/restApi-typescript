import express from "express";

import { getUserByEmail, createUser } from "../db/users";
import { authentication, random } from "../helpers";

// Define a function to handle the login request
export const login = async (req: express.Request, res: express.Response) => {
  try {
    // Get the email and password from the request body
    const { email, password } = req.body;

    // Check if the email and password are provided
    if (!email || !password) {
      // If not, send a 400 (Bad Request) status code
      return res.sendStatus(400);
    }

    // Find the user by email in the database and select the salt and password fields
    const user = await getUserByEmail(email).select(
      "+authentication.salt +authentication.password"
    );

    // Check if the user exists
    if (!user) {
      // If not, send a 400 (Bad Request) status code
      return res.sendStatus(400);
    }

    // Generate a hash from the salt and password
    const validHash = authentication(user.authentication!.salt!, password);
    // Get the password hash from the user object
    const userHash: any = user.authentication!.password;
    // Compare the hashes
    if (userHash != validHash) {
      // If they are not equal, send a 403 (Forbidden) status code
      return res.sendStatus(403);
    }

    // Generate a random salt
    const salt = random();
    // Generate a session token from the salt and the user id
    user.authentication!.sessionToken = authentication(salt, user._id.toString()).toString();

    // Save the user object to the database
    await user.save();

    // Set a cookie with the session token
    res.cookie("RAJ-AUTH", user.authentication!.sessionToken, {
      domain: "localhost",
      path: "/",
    });

    // Send a 200 (OK) status code and the user object as JSON
    return res.status(200).json(user).end();
  } catch (error) {
    // If there is an error, log it and send a 400 (Bad Request) status code
    console.log(error);
    return res.sendStatus(400);
  }
};

// Define a function to handle the register request
export const register = async (req: express.Request, res: express.Response) => {
  try {
    // Get the email, password, and username from the request body
    const { email, password, username } = req.body;

    // Check if the email, password, and username are provided
    if (!email || !password || !username) {
      // If not, send a 400 (Bad Request) status code
      return res.sendStatus(400);
    }

    // Find the user by email in the database
    const existingUser = await getUserByEmail(email);

    // Check if the user already exists
    if (existingUser) {
      // If yes, send a 400 (Bad Request) status code
      return res.sendStatus(400);
    }

    // Generate a random salt
    const salt = random();
    // Create a new user object with the email, username, and authentication fields
    const user = await createUser({
      email,
      username,
      authentication: {
        salt,
        // Generate a password hash from the salt and password
        password: authentication(salt, password),
      },
    });

    // Send a 200 (OK) status code and the user object as JSON
    return res.status(200).json(user).end();
  } catch (error) {
    // If there is an error, log it and send a 400 (Bad Request) status code
    console.log(error);
    return res.sendStatus(400);
  }
};
