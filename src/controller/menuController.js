const { Role } = require('../helpers/Enum')
const { Messages } = require('../helpers/Messages')
const { sendResponse } = require('../helpers/Response')
const menuModel = require('../models/menuModel')
const userModel = require('../models/userModel')

exports.createMenu = async (req, res) => {
  try {
    const { name, price, category, image } = req.body
    const id = req.meta?._id;

    const user = await userModel.findById(id);
    if(user.role !== Role.ADMIN){
      return sendResponse(res, 400, null, Messages.BAD_REQUEST);
    }

    if (!name || !price || !category) {
      return sendResponse(res, 400, null, Messages.DATA_REQUIRED)
    }

    const isExist = await menuModel.findOne({ name, category })
    if (isExist) {
      return sendResponse(res, 400, null, Messages.MENU_EXISTS)
    }

    const menu = await menuModel.create({
      name,
      price,
      category,
      image
    })

    sendResponse(res, 201, menu, Messages.MENU_CREATED)
  } catch (err) {
    console.log('err :>> ', err);
    if (err.name == 'ValidationError') {
      const errors = Object.keys(err.errors).map(key => err.errors[key].message)
      return sendResponse(res, 400, null, errors.join(', '))
    }
    return sendResponse(res, 500, null, err.message)
  }
}

exports.updateMenu = async (req, res) => {
    try {
      const { id } = req.params;
      const {
        name,
        price,
        category,
        image
      } = req.body;
      const userToken = req.meta?._id;

      const user = await userModel.findById(userToken);
      console.log('user :>> ', user);

      if(user.role !== Role.ADMIN && user.role !== Role.MANAGER){
        return sendResponse(res, 400, null, Messages.BAD_REQUEST);
      }
  
      const currentMenu = await menuModel.findById(id);
      if (!currentMenu) {
        return sendResponse(res, 404, null, Messages.DATA_NOT_FOUND);
      }
  
      if (currentMenu.name !== name) {
        const isExist = await menuModel.findOne({
          name,
          _id: { $ne: id },
        })
        if (isExist) {
          return sendResponse(res, 400, null, Messages.MENU_EXISTS);
        }
      }
  
        const menu = await menuModel.findByIdAndUpdate(
          id,
          {
            name,
            image,
            price,
            category,
          },
          { new: true }
        );
  
      // updating image in s3
  
      return sendResponse(res, 200, menu, Messages.MENU_UPDATED);
    } catch (error) {
      console.log('error :>> ', error);
      return sendResponse(res, 500, null, error.message);
    }
  };
  exports.getAllMenus = async (req, res) => {
    try {
      const { page, limit } = req.query;
      let query = {};
      let skip = 0;
      let perPage = 0;
  
      const count = await menuModel.countDocuments(query);
      let menu;
      if (page && limit) {
        skip = (parseInt(page) - 1) * parseInt(limit);
        perPage = parseInt(limit);
        menu = await menuModel
          .find(query)
          .skip(skip)
          .limit(perPage)
          .sort({ createdAt: -1 });
      } else {
        menu = await menuModel
          .find(query)
          .sort({ createdAt: -1 });
      }
  
      let data;
  
      if (page && limit) {
        data = {
          data: menu,
          currentPage: page ? parseInt(page) : null,
          totalPages: Math.ceil(count / perPage),
          totalItems: count,
          limit: page && limit ? parseInt(limit) : null,
        };
      } else {
        data = menu;
      }
  
      return sendResponse(res, 200, data, Messages.DATA_FETCHED);
    } catch (error) {
      return sendResponse(res, 500, null, error.message);
    }
  };
  exports.deleteMenu = async (req, res) => {
    try {
      const { id } = req.params;
      const userToken = req.meta?._id;

      const user = await userModel.findById(userToken);
      
      if(user.role !== Role.ADMIN){
        return sendResponse(res, 400, null, Messages.BAD_REQUEST);
      }
      const menu = await menuModel.findByIdAndDelete(id);
      if (!menu) {
        return sendResponse(res, 404, null, Messages.DATA_NOT_FOUND);
      }
      return sendResponse(res, 200, null, Messages.DATA_DELETED);
    } catch (error) {
      return sendResponse(res, 500, null, error.message);
    }
  };