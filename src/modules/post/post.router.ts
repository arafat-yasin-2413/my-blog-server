import express, { Router } from "express"
import { postController } from "./post.controller";
import auth, { UserRole } from "../../middlewares/auth";

const router = express.Router();

router.get("/", postController.getAllPost);
router.post("/", auth(UserRole.USER, UserRole.ADMIN), postController.createPost);
router.get("/:id",postController.getPostById);
router.get("/user/my-posts",auth(UserRole.USER, UserRole.ADMIN), postController.getMyPost);
router.patch("/:postId", auth(UserRole.USER, UserRole.ADMIN), postController.updatePost);

export const postRouter: Router = router;