const express = require('express');
const router = express.Router();
const {
  searchAdvocates,
  searchInternships
} = require('../controllers/search.controller');

/**
 * @swagger
 * /search/advocates:
 *   get:
 *     summary: Search advocates
 *     tags: [Search]
 */
router.get('/advocates', searchAdvocates);

/**
 * @swagger
 * /search/internships:
 *   get:
 *     summary: Search internships
 *     tags: [Search]
 */
router.get('/internships', searchInternships);

module.exports = router;
