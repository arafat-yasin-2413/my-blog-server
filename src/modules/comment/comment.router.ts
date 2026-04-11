import express, { Router } from "express"
import { commmentControllers } from "./comment.controller";
import auth, { UserRole } from "../../middlewares/auth";

const router = express.Router();

router.get("/:commentId", commmentControllers.getCommentById);
router.get("/author/:authorId", commmentControllers.getCommentsByAuthorId);
router.post("/", auth(UserRole.USER, UserRole.ADMIN), commmentControllers.createComment);
router.delete("/:commentId",auth(UserRole.USER,UserRole.ADMIN),commmentControllers.deleteComment);
router.patch("/:commentId", auth(UserRole.USER, UserRole.ADMIN), commmentControllers.updateComment);

export const commentRouter: Router = router;