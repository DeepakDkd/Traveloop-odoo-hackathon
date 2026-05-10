import { Router } from "express";

import {
  getNotes,
  createNote,
  updateNote,
  deleteNote,
  searchNotes,
} from "../controller/note.controller.js";

import { protect } from "../middleware/auth.middleware.js";

const router = Router({ mergeParams: true });

router.use(protect);

router.get("/", getNotes);

router.get("/search", searchNotes);

router.post("/", createNote);

router.patch("/:noteId", updateNote);

router.delete("/:noteId", deleteNote);

export default router;