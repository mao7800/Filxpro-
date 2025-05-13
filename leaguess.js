    // Initialize particles.js
    document.addEventListener('DOMContentLoaded', function() {
      particlesJS('particles-js', {
        "particles": {
          "number": {
            "value": 100,
            "density": {
              "enable": true,
              "value_area": 1000
            }
          },
          "color": {
            "value": "#00F0FF"
          },
          "shape": {
            "type": "circle",
            "stroke": {
              "width": 0,
              "color": "#000000"
            },
            "polygon": {
              "nb_sides": 5
            }
          },
          "opacity": {
            "value": 0.5,
            "random": true,
            "anim": {
              "enable": true,
              "speed": 1,
              "opacity_min": 0.1,
              "sync": false
            }
          },
          "size": {
            "value": 4,
            "random": true,
            "anim": {
              "enable": true,
              "speed": 2,
              "size_min": 0.1,
              "sync": false
            }
          },
          "line_linked": {
            "enable": true,
            "distance": 200,
            "color": "#00F0FF",
            "opacity": 0.3,
            "width": 1.5
          },
          "move": {
            "enable": true,
            "speed": 1.5,
            "direction": "none",
            "random": true,
            "straight": false,
            "out_mode": "out",
            "bounce": false,
            "attract": {
              "enable": true,
              "rotateX": 800,
              "rotateY": 1600
            }
          }
        },
        "interactivity": {
          "detect_on": "canvas",
          "events": {
            "onhover": {
              "enable": true,
              "mode": "grab"
            },
            "onclick": {
              "enable": true,
              "mode": "push"
            },
            "resize": true
          },
          "modes": {
            "grab": {
              "distance": 200,
              "line_linked": {
                "opacity": 0.7
              }
            },
            "push": {
              "particles_nb": 6
            }
          }
        },
        "retina_detect": true
      });
      
      // Create floating circles
      const floatingCircles = document.getElementById('floating-circles');
      const colors = ['rgba(0, 240, 255, 0.05)', 'rgba(255, 0, 245, 0.05)', 'rgba(255, 211, 0, 0.05)'];
      
      for (let i = 0; i < 15; i++) {
        const circle = document.createElement('div');
        circle.classList.add('circle');
        
        // Random size between 50px and 200px
        const size = Math.random() * 150 + 50;
        circle.style.width = `${size}px`;
        circle.style.height = `${size}px`;
        
        // Random position
        circle.style.left = `${Math.random() * 100}%`;
        
        // Random color
        circle.style.background = colors[Math.floor(Math.random() * colors.length)];
        
        // Random animation duration between 10s and 25s
        circle.style.animationDuration = `${Math.random() * 15 + 10}s`;
        
        // Random delay
        circle.style.animationDelay = `${Math.random() * 15}s`;
        
        floatingCircles.appendChild(circle);
      }
    });
// نظام إدارة الإعدادات
class SettingsManager {
  constructor() {
    this.settings = this.loadSettings();
    this.applySettings();
    this.setupEventListeners();
  }
  
  loadSettings() {
    const defaultSettings = {
      darkMode: false,
      primaryColor: '#ff6b6b',
      theme: 'default',
      language: 'ar'
    };
    const savedSettings = localStorage.getItem('filxproSettings');
    return savedSettings ? { ...defaultSettings, ...JSON.parse(savedSettings) } : defaultSettings;
  }
  
  applySettings() {
    // تطبيق الوضع المظلم
    document.body.classList.toggle('dark-mode', this.settings.darkMode);
    document.body.classList.toggle('light-mode', this.settings.theme === 'light' && !this.settings.darkMode);
    
    // تطبيق لون التطبيق
    document.documentElement.style.setProperty('--primary', this.settings.primaryColor);
    document.documentElement.style.setProperty('--primary-dark', this.darkenColor(this.settings.primaryColor, 20));
    
    // تحديث ألوان بطاقات القنوات
    this.updateChannelCards();
  }
  
  darkenColor(color, percent) {
    const num = parseInt(color.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) - amt;
    const G = (num >> 8 & 0x00FF) - amt;
    const B = (num & 0x0000FF) - amt;
    return '#' + (
      0x1000000 +
      (R < 0 ? 0 : R) * 0x10000 +
      (G < 0 ? 0 : G) * 0x100 +
      (B < 0 ? 0 : B)
    ).toString(16).slice(1);
  }
  
  updateChannelCards() {
    document.querySelectorAll('.channel-card.color-1').forEach(card => {
      card.style.background = `linear-gradient(135deg, ${this.settings.primaryColor}, ${this.darkenColor(this.settings.primaryColor, 15)})`;
    });
    
    document.querySelectorAll('.badge, .section-header .badge').forEach(badge => {
      badge.style.background = this.settings.primaryColor;
    });
    
    document.querySelectorAll('.nav-item.active, .nav-item:hover').forEach(item => {
      item.style.background = this.settings.primaryColor;
    });
  }
  
  setupEventListeners() {
    // الاستماع لتحديثات الإعدادات من الصفحات الأخرى
    window.addEventListener('message', (event) => {
      if (event.data.type === 'settingsUpdate') {
        this.settings = event.data.settings;
        localStorage.setItem('filxproSettings', JSON.stringify(this.settings));
        this.applySettings();
      }
    });
  }
}

// تهيئة المدير عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
  window.settingsManager = new SettingsManager();
});