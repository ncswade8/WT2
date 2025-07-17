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
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg, #03272f 0%, #99cc00 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold', fontSize: 22 }}>M</div>
              <span style={{ fontWeight: 700, fontSize: 18 }}>MacNeil Solutions</span>
            </div>
            <div style={{ fontSize: 14, marginBottom: 12 }}>
              Empowering businesses with data-driven insights.
            </div>
          </div>

          {/* Solutions/Services */}
          <div className="footer-section" style={{ flex: '1 1 150px', minWidth: 150 }}>
            <h4 style={{ color: '#99cc00', marginBottom: 8 }}>Solutions</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: 14 }}>
              <li><Link to="/water-quality" style={{ color: '#fff', textDecoration: 'none' }}>Water Quality Management</Link></li>
              <li><Link to="/analytics" style={{ color: '#fff', textDecoration: 'none' }}>Data Analytics</Link></li>
              <li><Link to="/dashboard" style={{ color: '#fff', textDecoration: 'none' }}>Custom Software</Link></li>
              <li><Link to="/users" style={{ color: '#fff', textDecoration: 'none' }}>User Management</Link></li>
            </ul>
          </div>

          {/* Company Info */}
          <div className="footer-section" style={{ flex: '1 1 150px', minWidth: 150 }}>
            <h4 style={{ color: '#99cc00', marginBottom: 8 }}>Company</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: 14 }}>
              <li><a href="#about" style={{ color: '#fff', textDecoration: 'none' }}>About Us</a></li>
              <li><a href="#careers" style={{ color: '#fff', textDecoration: 'none' }}>Careers</a></li>
              <li><a href="#blog" style={{ color: '#fff', textDecoration: 'none' }}>Blog & Insights</a></li>
              <li><a href="#contact" style={{ color: '#fff', textDecoration: 'none' }}>Contact</a></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="footer-section" style={{ flex: '1 1 180px', minWidth: 180 }}>
            <h4 style={{ color: '#99cc00', marginBottom: 8 }}>Contact Us</h4>
            <div style={{ fontSize: 14, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 8 }}><Phone size={16} /> <span>+1 (555) 123-4567</span></div>
            <div style={{ fontSize: 14, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 8 }}><Mail size={16} /> <span>info@macneilsolutions.com</span></div>
            <div style={{ fontSize: 14, display: 'flex', alignItems: 'center', gap: 8 }}><MapPin size={16} /> <span>123 Business Ave, Suite 100<br />Toronto, ON M5V 2H1</span></div>
          </div>

          {/* Stay Connected & Newsletter */}
          <div className="footer-section" style={{ flex: '1 1 200px', minWidth: 200 }}>
            <h4 style={{ color: '#99cc00', marginBottom: 8 }}>Stay Connected</h4>
            <div style={{ display: 'flex', gap: 12, marginBottom: 10 }}>
              <a href="https://linkedin.com/company/macneil-solutions" target="_blank" rel="noopener noreferrer" style={{ color: '#fff' }}><Linkedin size={20} /></a>
              <a href="https://twitter.com/macneilsolutions" target="_blank" rel="noopener noreferrer" style={{ color: '#fff' }}><Twitter size={20} /></a>
              <a href="https://facebook.com/macneilsolutions" target="_blank" rel="noopener noreferrer" style={{ color: '#fff' }}><Facebook size={20} /></a>
            </div>
            <div style={{ fontSize: 13, marginBottom: 6 }}>Subscribe to our newsletter:</div>
            <form style={{ display: 'flex', gap: 6 }} onSubmit={e => e.preventDefault()}>
              <input type="email" placeholder="Your email" style={{ padding: '6px 10px', borderRadius: 4, border: 'none', fontSize: 13, minWidth: 0, flex: 1 }} />
              <button type="submit" className="btn btn-primary" style={{ padding: '6px 14px', fontSize: 13, background: '#99cc00', color: '#03272f', border: 'none', borderRadius: 4, fontWeight: 600 }}>Subscribe</button>
            </form>
          </div>
        </div>
        {/* Bottom Bar */}
        <div className="footer-bottom" style={{ borderTop: '1px solid #17404a', marginTop: 24, padding: '1rem 0 0.5rem 0', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', fontSize: 13 }}>
          <div>© {currentYear} MacNeil Solutions. All rights reserved.</div>
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