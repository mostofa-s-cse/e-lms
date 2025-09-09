"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mergeGuestCart = exports.clearCart = exports.removeFromCart = exports.addToCart = exports.createOrUpdateCart = exports.getCart = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const getCart = async (req, res) => {
    try {
        const { userId, sessionId } = req.query;
        if (!userId && !sessionId) {
            res.status(400).json({
                success: false,
                message: 'Either userId or sessionId is required'
            });
            return;
        }
        let cart;
        if (userId) {
            cart = await prisma.cart.findFirst({
                where: {
                    userId: userId,
                    isActive: true
                },
                include: {
                    items: {
                        include: {
                            course: {
                                include: {
                                    teacher: {
                                        select: {
                                            firstName: true,
                                            lastName: true
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            });
        }
        else {
            cart = await prisma.cart.findFirst({
                where: {
                    sessionId: sessionId,
                    isActive: true
                },
                include: {
                    items: {
                        include: {
                            course: {
                                include: {
                                    teacher: {
                                        select: {
                                            firstName: true,
                                            lastName: true
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            });
        }
        if (!cart) {
            res.status(404).json({
                success: false,
                message: 'Cart not found'
            });
            return;
        }
        const total = cart.items.reduce((sum, item) => sum + (item.intakeAmount || item.price), 0);
        res.json({
            success: true,
            data: {
                id: cart.id,
                userId: cart.userId,
                sessionId: cart.sessionId,
                items: cart.items.map(item => ({
                    id: item.id,
                    courseId: item.courseId,
                    title: item.title,
                    price: item.price,
                    isFree: item.isFree,
                    thumbnail: item.thumbnail,
                    teacher: {
                        firstName: item.teacherName.split(' ')[0] || '',
                        lastName: item.teacherName.split(' ').slice(1).join(' ') || ''
                    },
                    courseCode: item.courseCode,
                    intakeId: item.intakeId,
                    intakeName: item.intakeName,
                    intakeAmount: item.intakeAmount
                })),
                total,
                itemCount: cart.items.length
            }
        });
    }
    catch (error) {
        console.error('Error getting cart:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get cart'
        });
    }
};
exports.getCart = getCart;
const createOrUpdateCart = async (req, res) => {
    try {
        const { userId, sessionId, items } = req.body;
        if (!userId && !sessionId) {
            res.status(400).json({
                success: false,
                message: 'Either userId or sessionId is required'
            });
            return;
        }
        if (!items || !Array.isArray(items)) {
            res.status(400).json({
                success: false,
                message: 'Items array is required'
            });
            return;
        }
        let cart = await prisma.cart.findFirst({
            where: {
                OR: [
                    { userId: userId || null },
                    { sessionId: sessionId || null }
                ],
                isActive: true
            }
        });
        if (!cart) {
            cart = await prisma.cart.create({
                data: {
                    userId: userId || null,
                    sessionId: sessionId || null
                }
            });
        }
        await prisma.cartItem.deleteMany({
            where: {
                cartId: cart.id
            }
        });
        const cartItems = await Promise.all(items.map(async (item) => {
            return await prisma.cartItem.create({
                data: {
                    cartId: cart.id,
                    courseId: item.courseId,
                    title: item.title,
                    price: item.price,
                    isFree: item.isFree,
                    thumbnail: item.thumbnail,
                    teacherName: `${item.teacher.firstName} ${item.teacher.lastName}`,
                    courseCode: item.courseCode,
                    intakeId: item.intakeId,
                    intakeName: item.intakeName,
                    intakeAmount: item.intakeAmount
                }
            });
        }));
        const total = cartItems.reduce((sum, item) => sum + (item.intakeAmount || item.price), 0);
        res.json({
            success: true,
            data: {
                id: cart.id,
                userId: cart.userId,
                sessionId: cart.sessionId,
                items: cartItems.map(item => ({
                    id: item.id,
                    courseId: item.courseId,
                    title: item.title,
                    price: item.price,
                    isFree: item.isFree,
                    thumbnail: item.thumbnail,
                    teacher: {
                        firstName: item.teacherName.split(' ')[0] || '',
                        lastName: item.teacherName.split(' ').slice(1).join(' ') || ''
                    },
                    courseCode: item.courseCode,
                    intakeId: item.intakeId,
                    intakeName: item.intakeName,
                    intakeAmount: item.intakeAmount
                })),
                total,
                itemCount: cartItems.length
            }
        });
    }
    catch (error) {
        console.error('Error creating/updating cart:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create/update cart'
        });
    }
};
exports.createOrUpdateCart = createOrUpdateCart;
const addToCart = async (req, res) => {
    try {
        const { userId, sessionId, item } = req.body;
        if (!userId && !sessionId) {
            res.status(400).json({
                success: false,
                message: 'Either userId or sessionId is required'
            });
            return;
        }
        if (!item) {
            res.status(400).json({
                success: false,
                message: 'Item is required'
            });
            return;
        }
        let cart = await prisma.cart.findFirst({
            where: {
                OR: [
                    { userId: userId || null },
                    { sessionId: sessionId || null }
                ],
                isActive: true
            }
        });
        if (!cart) {
            cart = await prisma.cart.create({
                data: {
                    userId: userId || null,
                    sessionId: sessionId || null
                }
            });
        }
        const existingItem = await prisma.cartItem.findFirst({
            where: {
                cartId: cart.id,
                courseId: item.courseId
            }
        });
        if (existingItem) {
            res.status(400).json({
                success: false,
                message: 'Item already exists in cart'
            });
            return;
        }
        const cartItem = await prisma.cartItem.create({
            data: {
                cartId: cart.id,
                courseId: item.courseId,
                title: item.title,
                price: item.price,
                isFree: item.isFree,
                thumbnail: item.thumbnail,
                teacherName: `${item.teacher.firstName} ${item.teacher.lastName}`,
                courseCode: item.courseCode,
                intakeId: item.intakeId,
                intakeName: item.intakeName,
                intakeAmount: item.intakeAmount
            }
        });
        res.json({
            success: true,
            data: {
                id: cartItem.id,
                courseId: cartItem.courseId,
                title: cartItem.title,
                price: cartItem.price,
                isFree: cartItem.isFree,
                thumbnail: cartItem.thumbnail,
                teacher: {
                    firstName: cartItem.teacherName.split(' ')[0] || '',
                    lastName: cartItem.teacherName.split(' ').slice(1).join(' ') || ''
                },
                courseCode: cartItem.courseCode,
                intakeId: cartItem.intakeId,
                intakeName: cartItem.intakeName,
                intakeAmount: cartItem.intakeAmount
            }
        });
    }
    catch (error) {
        console.error('Error adding item to cart:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to add item to cart'
        });
    }
};
exports.addToCart = addToCart;
const removeFromCart = async (req, res) => {
    try {
        const { itemId } = req.params;
        const { userId, sessionId } = req.query;
        if (!userId && !sessionId) {
            res.status(400).json({
                success: false,
                message: 'Either userId or sessionId is required'
            });
            return;
        }
        const cart = await prisma.cart.findFirst({
            where: {
                OR: [
                    { userId: userId || null },
                    { sessionId: sessionId || null }
                ],
                isActive: true
            }
        });
        if (!cart) {
            res.status(404).json({
                success: false,
                message: 'Cart not found'
            });
            return;
        }
        await prisma.cartItem.delete({
            where: {
                id: itemId,
                cartId: cart.id
            }
        });
        res.json({
            success: true,
            message: 'Item removed from cart'
        });
    }
    catch (error) {
        console.error('Error removing item from cart:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to remove item from cart'
        });
    }
};
exports.removeFromCart = removeFromCart;
const clearCart = async (req, res) => {
    try {
        const { userId, sessionId } = req.query;
        if (!userId && !sessionId) {
            res.status(400).json({
                success: false,
                message: 'Either userId or sessionId is required'
            });
            return;
        }
        const cart = await prisma.cart.findFirst({
            where: {
                OR: [
                    { userId: userId || null },
                    { sessionId: sessionId || null }
                ],
                isActive: true
            }
        });
        if (!cart) {
            res.status(404).json({
                success: false,
                message: 'Cart not found'
            });
            return;
        }
        await prisma.cartItem.deleteMany({
            where: {
                cartId: cart.id
            }
        });
        res.json({
            success: true,
            message: 'Cart cleared'
        });
    }
    catch (error) {
        console.error('Error clearing cart:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to clear cart'
        });
    }
};
exports.clearCart = clearCart;
const mergeGuestCart = async (req, res) => {
    try {
        const { userId, sessionId } = req.body;
        if (!userId || !sessionId) {
            res.status(400).json({
                success: false,
                message: 'Both userId and sessionId are required'
            });
            return;
        }
        const guestCart = await prisma.cart.findFirst({
            where: {
                sessionId,
                userId: null,
                isActive: true
            },
            include: {
                items: true
            }
        });
        if (!guestCart) {
            res.status(404).json({
                success: false,
                message: 'Guest cart not found'
            });
            return;
        }
        let userCart = await prisma.cart.findFirst({
            where: {
                userId,
                sessionId: null,
                isActive: true
            }
        });
        if (!userCart) {
            userCart = await prisma.cart.create({
                data: {
                    userId,
                    sessionId: null
                }
            });
        }
        await Promise.all(guestCart.items.map(async (item) => {
            const existingItem = await prisma.cartItem.findFirst({
                where: {
                    cartId: userCart.id,
                    courseId: item.courseId
                }
            });
            if (!existingItem) {
                await prisma.cartItem.create({
                    data: {
                        cartId: userCart.id,
                        courseId: item.courseId,
                        title: item.title,
                        price: item.price,
                        isFree: item.isFree,
                        thumbnail: item.thumbnail,
                        teacherName: item.teacherName,
                        courseCode: item.courseCode,
                        intakeId: item.intakeId,
                        intakeName: item.intakeName,
                        intakeAmount: item.intakeAmount
                    }
                });
            }
        }));
        await prisma.cart.delete({
            where: {
                id: guestCart.id
            }
        });
        res.json({
            success: true,
            message: 'Guest cart merged with user cart'
        });
    }
    catch (error) {
        console.error('Error merging guest cart:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to merge guest cart'
        });
    }
};
exports.mergeGuestCart = mergeGuestCart;
//# sourceMappingURL=carts.js.map