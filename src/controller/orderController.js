const { Messages } = require('../helpers/Messages')
const { sendResponse } = require('../helpers/Response')
const userModel = require('../models/userModel')
const menuModel = require('../models/menuModel')
const { OrderStatus, Role } = require('../helpers/Enum')
const orderModel = require('../models/orderModel')

exports.createOrder = async (req, res) => {
  try {
    const { items } = req.body
    const id = req.meta?._id

    const user = await userModel.findById(id)
    if (!user) {
      return sendResponse(res, 400, null, Messages.USER_NOT_FOUND)
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return sendResponse(res, 400, null, Messages.CART_ITEMS_REQUIRED)
    }

    // Extract all itemIds from frontend
    const itemIds = items.map(item => item.itemId)

    // Fetch all menu items from DB
    const menuItems = await menuModel.find({ _id: { $in: itemIds } })

    if (menuItems.length !== itemIds.length) {
      return sendResponse(res, 400, null, Messages.ITEM_NOT_FOUND)
    }

    // Create a map for fast lookup
    const menuMap = {}
    menuItems.forEach(menu => {
      menuMap[menu._id.toString()] = menu
    })

    let totalAmount = 0

    // Build the validated items array using correct price
    const validatedItems = items.map(item => {
      const menuItem = menuMap[item.itemId]
      const quantity = item.quantity

      if (!quantity || quantity < 1) {
        throw new Error(`Invalid quantity for item ${menuItem.name}`)
      }

      const itemTotal = menuItem.price * quantity
      totalAmount += itemTotal

      return {
        itemId: item.itemId,
        quantity,
        price: menuItem.price
      }
    })

    // Create order
    const order = await orderModel.create({
      userId: id,
      items: validatedItems,
      totalAmount,
      status: OrderStatus.PENDING
    })

    sendResponse(res, 201, order, Messages.ORDER_CREATED)
  } catch (err) {
    return sendResponse(res, 500, null, err.message)
  }
}

exports.getOrders = async (req, res) => {
  try {
    const id = req.meta?._id

    const user = await userModel.findById(id)

    let orders
    if (user.role === Role.ADMIN || user.role === Role.MANAGER) {
      orders = await orderModel
        .find()
        .sort({ createdAt: -1 })
        .populate('items.itemId', 'name image')
        .populate('userId', 'username')
    } else {
      orders = await orderModel
        .find({ userId: id })
        .sort({ createdAt: -1 })
        .populate('items.itemId', 'name image')
      if (!orders) {
        return sendResponse(res, 200, null, Messages.NO_ORDERS_FOUND)
      }
    }
    sendResponse(res, 200, orders, Messages.DATA_FETCHED)
  } catch (err) {
    return sendResponse(res, 500, null, err.message)
  }
}

exports.updateOrderStatus = async (req, res) => {
  try {
    const id = req.meta?._id

    const { status } = req.body
    const orderId = req.params.id

    const user = await userModel.findById(id)
    const orderExists = await orderModel.findById(orderId)

    if (
      !orderExists ||
      !(user.role === Role.ADMIN || user.role === Role.MANAGER)
    ) {
      return sendResponse(res, 404, null, Messages.BAD_REQUEST)
    }

    const validStatuses = Object.values(OrderStatus)
    if (!validStatuses.includes(status)) {
      return sendResponse(res, 400, null, Messages.INVALID_STATUS)
    }

    const updatedOrder = await orderModel.findByIdAndUpdate(
      orderId,
      { status: status },
      { new: true }
    )

    sendResponse(res, 200, updatedOrder, Messages.STATUS_UPDATED)
  } catch (err) {
    console.log('err :>> ', err)
    return sendResponse(res, 500, null, err.message)
  }
}
