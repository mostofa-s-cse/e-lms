import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import nodemailer from 'nodemailer';

const prisma = new PrismaClient();

interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

// Create a transporter for sending emails
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER || 'your-email@gmail.com',
      pass: process.env.SMTP_PASS || 'your-app-password'
    },
  });
};

export const submitContactForm = async (req: Request, res: Response) => {
  try {
    const { name, email, subject, message }: ContactFormData = req.body;

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address'
      });
    }

    // Save contact message to database
    const contactMessage = await prisma.contactMessage.create({
      data: {
        name,
        email,
        subject,
        message,
        status: 'PENDING',
        createdAt: new Date()
      }
    });

    // Send email notification to admin
    try {
      const transporter = createTransporter();
      
      const adminEmail = process.env.ADMIN_EMAIL || 'admin@edulms.com';
      
      await transporter.sendMail({
        from: process.env.SMTP_USER || 'noreply@edulms.com',
        to: adminEmail,
        subject: `New Contact Form Submission: ${subject}`,
        html: `
          <h2>New Contact Form Submission</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Subject:</strong> ${subject}</p>
          <p><strong>Message:</strong></p>
          <p>${message.replace(/\n/g, '<br>')}</p>
          <hr>
          <p><small>Submitted on: ${new Date().toLocaleString()}</small></p>
        `
      });

      // Send confirmation email to user
      await transporter.sendMail({
        from: process.env.SMTP_USER || 'noreply@edulms.com',
        to: email,
        subject: 'Thank you for contacting E-LMS',
        html: `
          <h2>Thank you for contacting us!</h2>
          <p>Dear ${name},</p>
          <p>We have received your message and will get back to you within 24 hours.</p>
          <p><strong>Your message:</strong></p>
          <p>${message.replace(/\n/g, '<br>')}</p>
          <hr>
          <p>Best regards,<br>The E-LMS Team</p>
        `
      });

    } catch (emailError) {
      console.error('Email sending failed:', emailError);
      // Don't fail the request if email fails, just log it
    }

    return res.status(201).json({
      success: true,
      message: 'Contact form submitted successfully',
      data: {
        id: contactMessage.id,
        submittedAt: contactMessage.createdAt
      }
    });

  } catch (error) {
    console.error('Contact form submission error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to submit contact form. Please try again later.'
    });
  }
};

export const getContactMessages = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const offset = (pageNum - 1) * limitNum;

    const whereClause: any = {};
    if (status) {
      whereClause.status = status;
    }

    const [messages, total] = await Promise.all([
      prisma.contactMessage.findMany({
        where: whereClause,
        orderBy: {
          createdAt: 'desc'
        },
        skip: offset,
        take: limitNum
      }),
      prisma.contactMessage.count({
        where: whereClause
      })
    ]);

    return res.json({
      success: true,
      data: messages,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    });

  } catch (error) {
    console.error('Get contact messages error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch contact messages'
    });
  }
};

export const updateContactMessageStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, adminResponse } = req.body;

    if (!status || !['PENDING', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Valid status is required'
      });
    }

    const updatedMessage = await prisma.contactMessage.update({
      where: { id },
      data: {
        status,
        adminResponse: adminResponse || null,
        updatedAt: new Date()
      }
    });

    return res.json({
      success: true,
      message: 'Contact message status updated successfully',
      data: updatedMessage
    });

  } catch (error) {
    console.error('Update contact message status error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update contact message status'
    });
  }
};

export const deleteContactMessage = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.contactMessage.delete({
      where: { id }
    });

    return res.json({
      success: true,
      message: 'Contact message deleted successfully'
    });

  } catch (error) {
    console.error('Delete contact message error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete contact message'
    });
  }
};
