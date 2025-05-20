import express from "express";
import { userRouter } from './user';
import { chatRouter } from './chat';

const mainRouter: express.Router = express.Router();

mainRouter.use("/user", userRouter);
mainRouter.use("/chat", chatRouter);

export { mainRouter };

