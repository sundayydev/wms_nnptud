var express = require('express');
var router = express.Router();
let categoryModel = require('../models/Category')

/* GET all categories */
router.get('/', async function (req, res, next) {
  let data = await categoryModel.find();
  res.send(data);
});

/* GET category by ID */
router.get('/:id', async function (req, res, next) {
  try {
    let id = req.params.id;
    let result = await categoryModel.findById(id);
    if (result) {
      res.send(result);
    } else {
      res.status(404).send({ message: "ID NOT FOUND" });
    }
  } catch (error) {
    res.status(404).send({ message: error.message });
  }
});

/* POST create category */
router.post('/', async function (req, res) {
  try {
    let newCate = new categoryModel({
      name: req.body.name,
      description: req.body.description,
      parentCategory: req.body.parentCategory || null
    });
    await newCate.save();
    res.send(newCate);
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
});

/* PUT update category */
router.put('/:id', async function (req, res) {
  try {
    let id = req.params.id;
    let result = await categoryModel.findByIdAndUpdate(id, req.body, { new: true });
    if (result) {
      res.send(result);
    } else {
      res.status(404).send({ message: "ID NOT FOUND" });
    }
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
});

/* DELETE category */
router.delete('/:id', async function (req, res) {
  try {
    let id = req.params.id;
    let result = await categoryModel.findByIdAndDelete(id);
    if (result) {
      res.send({ message: "Deleted successfully", data: result });
    } else {
      res.status(404).send({ message: "ID NOT FOUND" });
    }
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
});

module.exports = router;
