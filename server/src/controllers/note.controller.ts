import { asyncHandler } from '../utils/asyncHandler.js';
import { getUserId } from '../middlewares/auth.middleware.js';
import { sendData } from '../utils/response.js';
import * as noteService from '../services/note.service.js';

export const list = asyncHandler(async (req, res) => {
  sendData(res, await noteService.listNotes(getUserId(req)));
});

export const getById = asyncHandler(async (req, res) => {
  sendData(res, await noteService.getNote(getUserId(req), req.params.id));
});

export const create = asyncHandler(async (req, res) => {
  const note = await noteService.createNote(getUserId(req), req.body);
  sendData(res, note, 201);
});

export const update = asyncHandler(async (req, res) => {
  sendData(res, await noteService.updateNote(getUserId(req), req.params.id, req.body));
});

export const review = asyncHandler(async (req, res) => {
  sendData(res, await noteService.markReviewed(getUserId(req), req.params.id));
});

export const remove = asyncHandler(async (req, res) => {
  sendData(res, await noteService.deleteNote(getUserId(req), req.params.id));
});
