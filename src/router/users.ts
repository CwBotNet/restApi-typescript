import express from "express";
import { getAllUsers, updateUser, deleteUser } from "../controllers/users";
import { isAuthenticated, isOwnner } from "../middleware/index";

export default (router: express.Router) => {
  router.get("/users", isAuthenticated, getAllUsers);
  router.delete("/users/:id", isAuthenticated, isOwnner, deleteUser);
  router.patch("/users/:id", isAuthenticated, isOwnner, updateUser);
};
