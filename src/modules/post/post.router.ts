import express, { Router } from "express"
import { postController } from "./post.controller";
import auth, { UserRole } from "../../middlewares/auth";

const router = express.Router();

router.get("/", postController.getAllPost);
router.post("/", auth(UserRole.USER, UserRole.ADMIN), postController.createPost);
router.get("/:id",postController.getPostById)

export const postRouter: Router = router;