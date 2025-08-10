import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Navigation from '../components/Navigation';
import { Footer } from '../components';
import {
  FaMapMarkerAlt,
  FaEnvelope,
  FaPhone,
  FaClock,
  FaMap,
  FaCheck,
  FaArrowRight,
  FaUser,
  FaGraduationCap,
  FaHeadset,
  FaCreditCard,
  FaQuestionCircle
} from 'react-icons/fa';
import { IconType } from 'react-icons';
import { applySweetAlert } from '../utils/applySweetAlert';

const ContactPage = () => {
  const { isAuthenticated } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  useEffect(() => {
    document.title = 'Contact E-LMS - Get in Touch';
  }, []);

  const contactInfo = [
    {
      icon: FaMapMarkerAlt,
      title: "Address",
      content: "123 Education Street, Learning City, LC 12345",
      description: "Visit our main office"
    },
    {
      icon: FaEnvelope,
      title: "Email",
      content: "info@edulms.com",
      description: "Send us an email anytime"
    },
    {
      icon: FaPhone,
      title: "Phone",
      content: "+1 (555) 123-4567",
      description: "Call us during business hours"
    },
    {
      icon: FaClock,
      title: "Business Hours",
      content: "Mon - Fri: 9:00 AM - 6:00 PM",
      description: "We're here to help"
    }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Show success message
      applySweetAlert({
        title: "Message Sent!",
        text: "Thank you for contacting us. We'll get back to you within 24 hours.",
        icon: "success",
        confirmButtonText: "Great!"
      });

      // Reset form
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: ''
      });
    } catch (error) {
      // Show error message
      applySweetAlert({
        title: "Oops!",
        text: "Something went wrong. Please try again later.",
        icon: "error",
        confirmButtonText: "Try Again"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderIcon = (IconComponent: IconType, className: string) => {
    const Icon = IconComponent as React.ComponentType<{ className?: string }>;
    return <Icon className={className} />;
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <Navigation currentPage="contact" />
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 text-white py-24 overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-20 left-10 w-72 h-72 bg-white opacity-5 rounded-full"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-white opacity-5 rounded-full"></div>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl md:text-7xl font-bold mb-8 leading-tight">
            Get in <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-orange-300">Touch</span>
          </h1>
          <p className="text-xl md:text-2xl text-blue-100 max-w-4xl mx-auto leading-relaxed">
            Have questions? Need support? We're here to help you succeed in your educational journey.
          </p>
        </div>
      </section>

      {/* Contact Information Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {contactInfo.map((info, index) => (
              <div key={index} className="group text-center bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mb-6 group-hover:scale-110 transition-transform duration-300">
                  {renderIcon(info.icon, "text-white text-2xl")}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{info.title}</h3>
                <p className="text-blue-600 font-medium mb-3">{info.content}</p>
                <p className="text-gray-500 text-sm">{info.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section className="py-24 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Send Us a Message
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Fill out the form below and we'll get back to you as soon as possible.
            </p>
          </div>
          
          <form onSubmit={handleSubmit} className="bg-white p-10 rounded-2xl shadow-xl border border-gray-100">
            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-3">
                  Full Name *
                </label>
                <div className="relative">
                  {renderIcon(FaUser, "absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400")}
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                    placeholder="Your full name"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-3">
                  Email Address *
                </label>
                <div className="relative">
                  {renderIcon(FaEnvelope, "absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400")}
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                    placeholder="your.email@example.com"
                  />
                </div>
              </div>
            </div>
            
            <div className="mb-8">
              <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-3">
                Subject *
              </label>
              <div className="relative">
                {renderIcon(FaQuestionCircle, "absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400")}
                <select
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  required
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 appearance-none bg-white"
                >
                  <option value="">Select a subject</option>
                  <option value="general">General Inquiry</option>
                  <option value="technical">Technical Support</option>
                  <option value="billing">Billing Question</option>
                  <option value="partnership">Partnership Opportunity</option>
                  <option value="feedback">Feedback</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
            
            <div className="mb-8">
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-3">
                Message *
              </label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                required
                rows={6}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 resize-none"
                placeholder="Tell us how we can help you..."
              />
            </div>
            
            <div className="text-center">
              <button
                type="submit"
                disabled={isSubmitting}
                className="group inline-flex items-center gap-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-10 py-4 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Sending...
                  </>
                ) : (
                  <>
                    Send Message
                    {renderIcon(FaArrowRight, "group-hover:translate-x-1 transition-transform duration-300")}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* Map/Additional Info Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-8 leading-tight">
                Visit Our Office
              </h2>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                Located in the heart of Learning City, our office is easily accessible and welcomes visitors 
                during business hours. Come by to discuss your educational needs or just to say hello!
              </p>
              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center mr-4 mt-1">
                    {renderIcon(FaMapMarkerAlt, "text-white text-xs")}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Address</h3>
                    <p className="text-gray-600">123 Education Street, Learning City, LC 12345</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center mr-4 mt-1">
                    {renderIcon(FaClock, "text-white text-xs")}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Business Hours</h3>
                    <p className="text-gray-600">Monday - Friday: 9:00 AM - 6:00 PM</p>
                    <p className="text-gray-600">Saturday: 10:00 AM - 2:00 PM</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center mr-4 mt-1">
                    {renderIcon(FaPhone, "text-white text-xs")}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Phone</h3>
                    <p className="text-gray-600">+1 (555) 123-4567</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-gray-100 to-gray-200 p-8 rounded-2xl shadow-lg border border-gray-100">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mb-4">
                  {renderIcon(FaMap, "text-white text-3xl")}
                </div>
                <p className="text-gray-600 font-medium">Interactive Map</p>
                <p className="text-sm text-gray-500 mt-2">123 Education Street, Learning City</p>
                <p className="text-sm text-gray-500">LC 12345, United States</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Find quick answers to common questions about our platform and services.
            </p>
          </div>
          
          <div className="space-y-6">
            <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">How quickly do you respond to inquiries?</h3>
              <p className="text-gray-600 leading-relaxed">
                We typically respond to all inquiries within 24 hours during business days. For urgent matters, 
                please call us directly at +1 (555) 123-4567.
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Do you offer technical support?</h3>
              <p className="text-gray-600 leading-relaxed">
                Yes! We provide comprehensive technical support for all our users. Our support team is available 
                via email, phone, and live chat during business hours.
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Can I schedule a demo of your platform?</h3>
              <p className="text-gray-600 leading-relaxed">
                Absolutely! We'd love to show you around our platform. Contact us to schedule a personalized 
                demo that fits your schedule and educational needs.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Why Choose E-LMS?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Discover what makes our platform the preferred choice for educators and learners worldwide.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mb-6">
                {renderIcon(FaGraduationCap, "text-white text-2xl")}
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Expert-Led Learning</h3>
              <ul className="text-left space-y-3">
                <li className="flex items-start">
                  <span className="inline-flex items-center justify-center w-6 h-6 bg-green-500 text-white rounded-full mr-3 mt-0.5 flex-shrink-0">
                    {renderIcon(FaCheck, "text-xs")}
                  </span>
                  Expert-led courses with industry professionals
                </li>
                <li className="flex items-start">
                  <span className="inline-flex items-center justify-center w-6 h-6 bg-green-500 text-white rounded-full mr-3 mt-0.5 flex-shrink-0">
                    {renderIcon(FaCheck, "text-xs")}
                  </span>
                  Flexible learning schedules to fit your lifestyle
                </li>
                <li className="flex items-start">
                  <span className="inline-flex items-center justify-center w-6 h-6 bg-green-500 text-white rounded-full mr-3 mt-0.5 flex-shrink-0">
                    {renderIcon(FaCheck, "text-xs")}
                  </span>
                  Comprehensive support and guidance throughout your journey
                </li>
                <li className="flex items-start">
                  <span className="inline-flex items-center justify-center w-6 h-6 bg-green-500 text-white rounded-full mr-3 mt-0.5 flex-shrink-0">
                    {renderIcon(FaCheck, "text-xs")}
                  </span>
                  Modern platform with cutting-edge educational technology
                </li>
                <li className="flex items-start">
                  <span className="inline-flex items-center justify-center w-6 h-6 bg-green-500 text-white rounded-full mr-3 mt-0.5 flex-shrink-0">
                    {renderIcon(FaCheck, "text-xs")}
                  </span>
                  Community of learners and educators worldwide
                </li>
              </ul>
            </div>
            
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mb-6">
                {renderIcon(FaHeadset, "text-white text-2xl")}
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">24/7 Support</h3>
              <p className="text-gray-600 leading-relaxed">
                Our dedicated support team is always ready to help you succeed. Get assistance whenever you need it, 
                through multiple channels including live chat, email, and phone support.
              </p>
            </div>
            
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mb-6">
                {renderIcon(FaCreditCard, "text-white text-2xl")}
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Flexible Pricing</h3>
              <p className="text-gray-600 leading-relaxed">
                Choose the plan that works best for you. We offer flexible pricing options for individuals, 
                institutions, and enterprise clients with no hidden fees.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-white opacity-5 rounded-full"></div>
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-white opacity-5 rounded-full"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-8">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-blue-100 mb-10 max-w-3xl mx-auto leading-relaxed">
            Join thousands of educators and students who are already transforming education with E-LMS.
          </p>
          {!isAuthenticated ? (
            <Link 
              to="/register" 
              className="group inline-flex items-center gap-3 bg-white text-blue-600 px-10 py-4 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
            >
              Create Your Account
              {renderIcon(FaArrowRight, "group-hover:translate-x-1 transition-transform duration-300")}
            </Link>
          ) : (
            <Link 
              to="/" 
              className="group inline-flex items-center gap-3 bg-white text-blue-600 px-10 py-4 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
            >
              Access Dashboard
              {renderIcon(FaArrowRight, "group-hover:translate-x-1 transition-transform duration-300")}
            </Link>
          )}
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default ContactPage;