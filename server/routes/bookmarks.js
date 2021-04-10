const express = require("express");
const { Bookmark } = require("../db/models");

const router = express.Router();

router.get("/bookmarks", (req, res, next) => {
  Bookmark.findAll({ order: ["probeId"] })
    .then(bookmarks => {
      res.json(bookmarks);
    })
    .catch(next);
});

router.get("/probes/:probeId/bookmarks", (req, res, next) => {
  const { probeId } = req.params;

  Bookmark.findAll({ where: { probeId }, order: ["time"] })
    .then(bookmarks => {
      res.json(bookmarks);
    })
    .catch(next);
});

router.post("/probes/:probeId/bookmarks", (req, res, next) => {
  const { probeId } = req.params;

  Bookmark.create({ ...req.body, probeId })
    .then(bookmark => {
      res.status(201).json(bookmark);
    })
    .catch(next);
});

router.get("/bookmarks/:id", (req, res, next) => {
  const { id } = req.params;

  Bookmark.findByPk(id)
    .then(bookmark => {
      if (!bookmark) {
        return res.status(404).end();
      }

      res.json(bookmark);
    })
    .catch(next);
});

router.patch("/bookmarks/:id", (req, res, next) => {
  const { id } = req.params;

  Bookmark.findByPk(id)
    .then(bookmark => {
      if (!bookmark) {
        return res.status(404).end();
      }

      return bookmark.update(req.body);
    })
    .then(bookmark => {
      res.json(bookmark);
    })
    .catch(next);
});

router.delete("/bookmarks/:id", (req, res, next) => {
  const { id } = req.params;

  Bookmark.findByPk(id)
    .then(bookmark => {
      if (!bookmark) {
        return res.status(404).end();
      }

      return bookmark.destroy();
    })
    .then(() => {
      res.status(204).end();
    })
    .catch(next);
});

module.exports = router;
