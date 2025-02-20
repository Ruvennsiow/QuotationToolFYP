import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import './HomePage.css';

function HomePage() {
  const featuresRef = useRef(null);
  const demoRef = useRef(null);
  const contactRef = useRef(null);

  const scrollToSection = (ref) => {
    ref.current.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="home-container">
      <div className="minecraft-overlay"></div>
      <nav className="home-nav">
        <motion.div 
          className="nav-brand"
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          <span className="pixel-text">QuoteMaster AI</span>
        </motion.div>
        <motion.div
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          <Link to="/login" className="login-button pixel-button">
            Login
          </Link>
        </motion.div>
      </nav>
      
      <main className="hero-section">
        <motion.h1
          className="pixel-text"
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          Welcome to QuoteMaster AI
        </motion.h1>
        
        <motion.h2
          className="pixel-text-subtle"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          Intelligent Email Quotation Management
        </motion.h2>
        
        <motion.div 
          className="features-grid"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.4 }}
        >
          <motion.div 
            className="feature-card minecraft-card"
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300 }}
            onClick={() => scrollToSection(featuresRef)}
          >
            <i className="fas fa-star animated-icon"></i>
            <h3 className="pixel-text">Features</h3>
            <p>Discover our powerful AI features</p>
          </motion.div>
          
          <motion.div 
            className="feature-card minecraft-card"
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300 }}
            onClick={() => scrollToSection(demoRef)}
          >
            <i className="fas fa-play animated-icon"></i>
            <h3 className="pixel-text">Watch Demo</h3>
            <p>See QuoteMaster AI in action</p>
          </motion.div>
          
          <motion.div 
            className="feature-card minecraft-card"
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300 }}
            onClick={() => scrollToSection(contactRef)}
          >
            <i className="fas fa-envelope animated-icon"></i>
            <h3 className="pixel-text">Contact Us</h3>
            <p>Get in touch with our team</p>
          </motion.div>
        </motion.div>

        {/* Features Section */}
        <div ref={featuresRef} className="content-section">
          <h2 className="pixel-text section-title">Features</h2>
          <div className="features-container">
            <motion.div 
              className="feature-detail"
              whileInView={{ x: [-100, 0], opacity: [0, 1] }}
              transition={{ duration: 0.8 }}
            >
              <i className="fas fa-boxes feature-icon"></i>
              <h3>Inventory Management</h3>
              <p>Efficiently manage your inventory with our smart tracking system</p>
            </motion.div>
            
            <motion.div 
              className="feature-detail"
              whileInView={{ x: [100, 0], opacity: [0, 1] }}
              transition={{ duration: 0.8 }}
            >
              <i className="fas fa-robot feature-icon"></i>
              <h3>Email AI Assistant</h3>
              <p>Automatically process and respond to quotation requests with AI</p>
            </motion.div>
          </div>
        </div>

        {/* Demo Section */}
        <div ref={demoRef} className="content-section">
          <h2 className="pixel-text section-title">Watch Demo</h2>
          <div className="video-container">
            <iframe 
              src="/assets/videos/MVP+voiceover.mp4"
              title="Product Demo"
              className="demo-video"
              allowFullScreen
            ></iframe>
          </div>
        </div>

        {/* Contact Section */}
        <div ref={contactRef} className="content-section">
          <h2 className="pixel-text section-title">Contact Us</h2>
          <div className="contact-info">
            <motion.div 
              className="contact-card"
              whileInView={{ y: [50, 0], opacity: [0, 1] }}
              transition={{ duration: 0.8 }}
            >
              <motion.img
                src="/assets/images/masters_selfie.png" // Add your image path here
                alt="Ruvenn Siow"
                className="profile-image"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5 }}
              />
              <h3>Ruvenn Siow</h3>
              <p><i className="fas fa-envelope"></i> ruvenn12@gmail.com</p>
              <p><i className="fas fa-phone"></i> +65 81881554</p>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default HomePage;