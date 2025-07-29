import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Linkedin, Twitter, Facebook } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="footer" style={{ background: '#03272f', color: '#fff', marginTop: '2rem', paddingTop: '2rem' }}>
      <div className="container" style={{ maxWidth: 1200, margin: '0 auto', padding: '0 1rem' }}>
        <div className="footer-content" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: '2rem' }}>
          {/* Logo & Mission */}
          <div className="footer-section" style={{ flex: '1 1 200px', minWidth: 200 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg, #03272f 0%, #99cc00 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold', fontSize: 22 }}>S</div>
              <span style={{ fontWeight: 700, fontSize: 18 }}>The Student Coalition for Clean Water</span>
            </div>
            <div style={{ fontSize: 14, marginBottom: 12 }}>
              Advocating for clean, safe water in every community.
            </div>
          </div>

          {/* Contact Info */}
          <div className="footer-section" style={{ flex: '1 1 180px', minWidth: 180 }}>
            <h4 style={{ color: '#99cc00', marginBottom: 8 }}>Contact Us</h4>
            <div style={{ fontSize: 14, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Mail size={16} /> 
              <a 
                href="mailto:studentcleanwatercoalition@gmail.com?subject=Water Quality Tracker Inquiry"
                style={{ 
                  color: '#99cc00', 
                  textDecoration: 'none',
                  transition: 'color 0.2s ease'
                }}
                onMouseEnter={(e) => e.target.style.color = '#fff'}
                onMouseLeave={(e) => e.target.style.color = '#99cc00'}
              >
                studentcleanwatercoalition@gmail.com
              </a>
            </div>
          </div>
        </div>
        {/* Bottom Bar */}
        <div className="footer-bottom" style={{ borderTop: '1px solid #17404a', marginTop: 24, padding: '1rem 0 0.5rem 0', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', fontSize: 13 }}>
          <div>© {currentYear} The Student Coalition for Clean Water. All rights reserved.</div>
          <div style={{ display: 'flex', gap: 16 }}>
            <a href="#privacy" style={{ color: '#99cc00', textDecoration: 'none' }}>Privacy Policy</a>
            <a href="#terms" style={{ color: '#99cc00', textDecoration: 'none' }}>Terms of Service</a>
            <a href="#sitemap" style={{ color: '#99cc00', textDecoration: 'none' }}>Site Map</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 