const { getAllMenus, createMenu, updateMenu, deleteMenu } = require('../controller/menuController');
const { ValidateToken } = require('../middleware/auth_middleware');

const router = require('express').Router();

router.get('/', getAllMenus);
router.post('/', ValidateToken, createMenu);
router.put('/:id', ValidateToken, updateMenu);
router.delete('/:id', ValidateToken, deleteMenu);

module.exports = router;