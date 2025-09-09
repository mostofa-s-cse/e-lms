import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Get cart by user ID or session ID
export const getCart = async (req: Request, res: Response): Promise<void> => {
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
      // Get cart for logged-in user
      cart = await prisma.cart.findFirst({
        where: {
          userId: userId as string,
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
    } else {
      // Get cart for guest user by session ID
      cart = await prisma.cart.findFirst({
        where: {
          sessionId: sessionId as string,
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

    // Calculate total
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
  } catch (error) {
    console.error('Error getting cart:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get cart'
    });
  }
};

// Create or update cart
export const createOrUpdateCart = async (req: Request, res: Response): Promise<void> => {
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

    // Find existing cart or create new one
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

    // Clear existing items
    await prisma.cartItem.deleteMany({
      where: {
        cartId: cart.id
      }
    });

    // Add new items
    const cartItems = await Promise.all(
      items.map(async (item: any) => {
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
      })
    );

    // Calculate total
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
  } catch (error) {
    console.error('Error creating/updating cart:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create/update cart'
    });
  }
};

// Add item to cart
export const addToCart = async (req: Request, res: Response): Promise<void> => {
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

    // Find existing cart or create new one
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

    // Check if item already exists in cart
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

    // Add item to cart
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
  } catch (error) {
    console.error('Error adding item to cart:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add item to cart'
    });
  }
};

// Remove item from cart
export const removeFromCart = async (req: Request, res: Response): Promise<void> => {
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

    // Find cart
    const cart = await prisma.cart.findFirst({
      where: {
        OR: [
          { userId: userId as string || null },
          { sessionId: sessionId as string || null }
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

    // Remove item
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
  } catch (error) {
    console.error('Error removing item from cart:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove item from cart'
    });
  }
};

// Clear cart
export const clearCart = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, sessionId } = req.query;

    if (!userId && !sessionId) {
      res.status(400).json({
        success: false,
        message: 'Either userId or sessionId is required'
      });
      return;
    }

    // Find cart
    const cart = await prisma.cart.findFirst({
      where: {
        OR: [
          { userId: userId as string || null },
          { sessionId: sessionId as string || null }
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

    // Remove all items
    await prisma.cartItem.deleteMany({
      where: {
        cartId: cart.id
      }
    });

    res.json({
      success: true,
      message: 'Cart cleared'
    });
  } catch (error) {
    console.error('Error clearing cart:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to clear cart'
    });
  }
};

// Merge guest cart with user cart on login
export const mergeGuestCart = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, sessionId } = req.body;

    if (!userId || !sessionId) {
      res.status(400).json({
        success: false,
        message: 'Both userId and sessionId are required'
      });
      return;
    }

    // Find guest cart
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

    // Find or create user cart
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

    // Move items from guest cart to user cart
    await Promise.all(
      guestCart.items.map(async (item) => {
        // Check if item already exists in user cart
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
      })
    );

    // Delete guest cart
    await prisma.cart.delete({
      where: {
        id: guestCart.id
      }
    });

    res.json({
      success: true,
      message: 'Guest cart merged with user cart'
    });
  } catch (error) {
    console.error('Error merging guest cart:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to merge guest cart'
    });
  }
}; 