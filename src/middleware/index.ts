import express from "express";
import { get, merge } from "lodash";

import { getUserBySessionToken } from "../db/users";

export const isAuthenticated = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  try {
    const sessionToken = req.cookies["RAJ-AUTH"];

    if (!sessionToken) {
      res.sendStatus(403);
    }

    const existingUser = await getUserBySessionToken(sessionToken);

    if (!existingUser) {
      res.sendStatus(403);
    }

    merge(req, { identity: existingUser });

    return next();
  } catch (error) {
    console.log(error);
    return res.sendStatus(400);
  }
};

export const isOwnner = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  try {
    const { id } = req.params;
    const currentUserId: string = get(
      req,
      "identity._id".toString()
    ).toString();

    if (!currentUserId) {
      return res.sendStatus(400);
    }

    if (currentUserId !== id) {
      return res.sendStatus(403);
    }

    next();
  } catch (error) {
    console.log(error);
    res.sendStatus(400);
  }
};
