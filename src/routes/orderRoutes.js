const { createOrder, getOrders, updateOrderStatus } = require('../controller/orderController');
const { ValidateToken } = require('../middleware/auth_middleware');

const router = require('express').Router();

router.get('/', ValidateToken, getOrders);
router.put('/:id/status', ValidateToken, updateOrderStatus);
router.post('/', ValidateToken, createOrder);

module.exports = router;