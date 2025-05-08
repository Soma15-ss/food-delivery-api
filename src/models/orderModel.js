const mongoose = require('mongoose')
const { Role, OrderStatus } = require('../helpers/Enum')

const orderSchema = mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    items: [
      {
        itemId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Menu',
          required: true
        },
        quantity: {
          type: Number,
          required: true,
          min: 1
        },
        price: {
          type: Number,
          required: true
        },
        _id: false
      }
    ],
    totalAmount: {
      type: Number,
      required: true
    },
    status: {
      type: String,
      enum: Object.values(OrderStatus),
      default: Role.Pending
    }
  },
  {
    timestamps: true
  }
)

module.exports = mongoose.model('Order', orderSchema)
