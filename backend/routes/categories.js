var express = require('express');
var router = express.Router();
let mongoose = require('mongoose');
let categoryModel = require('../models/Category')
let { logAction } = require('../utils/auditlogHandler')
let { checkLogin } = require('../utils/authHandler')


router.get('/', async function (req, res, next) {
  let data = await categoryModel.find();
  res.send(data);
});

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

router.post('/', checkLogin, async function (req, res) {
  let session = await mongoose.startSession();
  session.startTransaction();
  try {
    let newCate = new categoryModel({
      name: req.body.name,
      description: req.body.description,
      parentCategory: req.body.parentCategory || null
    });
    await newCate.save({ session });
    logAction(req.user ? req.user._id : null, 'CREATE', 'category', newCate._id, newCate, req.ip);
    await session.commitTransaction();
    res.send(newCate);
  } catch (error) {
    await session.abortTransaction();
    res.status(400).send({ message: error.message });
  } finally {
    session.endSession();
  }
});

router.put('/:id', checkLogin, async function (req, res) {
  let session = await mongoose.startSession();
  session.startTransaction();
  try {
    let id = req.params.id;
    let oldData = await categoryModel.findById(id).session(session);
    let result = await categoryModel.findByIdAndUpdate(id, req.body, { new: true, session });
    if (result) {
      logAction(req.user ? req.user._id : null, 'UPDATE', 'category', id, { old: oldData, new: result }, req.ip);
      await session.commitTransaction();
      res.send(result);
    } else {
      await session.abortTransaction();
      res.status(404).send({ message: "ID NOT FOUND" });
    }
  } catch (error) {
    await session.abortTransaction();
    res.status(400).send({ message: error.message });
  } finally {
    session.endSession();
  }
});

router.delete('/:id', checkLogin, async function (req, res) {
  let session = await mongoose.startSession();
  session.startTransaction();
  try {
    let id = req.params.id;
    let result = await categoryModel.findByIdAndDelete(id, { session });
    if (result) {
      logAction(req.user ? req.user._id : null, 'DELETE', 'category', id, result, req.ip);
      await session.commitTransaction();
      res.send({ message: "Deleted successfully", data: result });
    } else {
      await session.abortTransaction();
      res.status(404).send({ message: "ID NOT FOUND" });
    }
  } catch (error) {
    await session.abortTransaction();
    res.status(400).send({ message: error.message });
  } finally {
    session.endSession();
  }
});

module.exports = router;
