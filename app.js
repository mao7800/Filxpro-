// ==== UI Elements ====
    const menuBtn = document.getElementById('menu-btn');
    const sidebar = document.getElementById('sidebar');
    const navItems = document.querySelectorAll('.sidebar-nav .nav-item');
    const bottomNavTabs = document.querySelectorAll('.bottom-nav .nav-tab');
    const sliders = document.querySelectorAll('.channels-slider');

    // ==== Functions ====
    function toggleSidebar() {
      sidebar.classList.toggle('active');
      menuBtn.classList.toggle('active');
    }

    function handleNavScroll() {
      const sections = document.querySelectorAll('.section');
      const scrollPosition = window.scrollY + 100;
      
      sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;
        const sectionId = section.getAttribute('id').replace('section-', '');
        
        if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
          navItems.forEach(item => {
            item.classList.remove('active');
            if (item.getAttribute('href') === `#${sectionId}`) {
              item.classList.add('active');
            }
          });
        }
      });
    }

    function setActiveTab() {
      const currentPage = window.location.pathname.split('/').pop() || 'index.html';
      bottomNavTabs.forEach(tab => {
        tab.classList.remove('active');
        const tabHref = tab.getAttribute('href');
        if ((currentPage === 'index.html' && tabHref === 'index.html') || 
            (currentPage === tabHref)) {
          tab.classList.add('active');
        }
      });
    }

    // ==== Slider Functions ====
    function setupSliders() {
      sliders.forEach(slider => {
        const container = slider.querySelector('.slider-container');
        let isDown = false;
        let startX;
        let scrollLeft;
        let velocity = 0;
        let animationFrame;
        let isDragging = false;

        // Mouse events
        container.addEventListener('mousedown', (e) => {
          isDown = true;
          isDragging = true;
          startX = e.pageX - container.offsetLeft;
          scrollLeft = container.scrollLeft;
          slider.style.cursor = 'grabbing';
          cancelAnimationFrame(animationFrame);
        });

        container.addEventListener('mouseleave', () => {
          isDown = false;
          isDragging = false;
          slider.style.cursor = 'grab';
        });

        container.addEventListener('mouseup', () => {
          isDown = false;
          isDragging = false;
          slider.style.cursor = 'grab';
          // Apply momentum
          if (Math.abs(velocity) > 1) {
            applyMomentum(container, velocity);
          }
        });

        container.addEventListener('mousemove', (e) => {
          if (!isDown) return;
          e.preventDefault();
          const x = e.pageX - container.offsetLeft;
          const walk = (x - startX) * 2; // Double the movement for better feel
          velocity = walk - (container.scrollLeft - scrollLeft);
          container.scrollLeft = scrollLeft - walk;
        });

        // Touch events
        container.addEventListener('touchstart', (e) => {
          isDown = true;
          isDragging = true;
          startX = e.touches[0].pageX - container.offsetLeft;
          scrollLeft = container.scrollLeft;
          cancelAnimationFrame(animationFrame);
        });

        container.addEventListener('touchend', () => {
          isDown = false;
          isDragging = false;
          // Apply momentum
          if (Math.abs(velocity) > 1) {
            applyMomentum(container, velocity);
          }
        });

        container.addEventListener('touchmove', (e) => {
          if (!isDown) return;
          const x = e.touches[0].pageX - container.offsetLeft;
          const walk = (x - startX) * 2; // Double the movement for better feel
          velocity = walk - (container.scrollLeft - scrollLeft);
          container.scrollLeft = scrollLeft - walk;
        });

        // Apply momentum animation
        function applyMomentum(element, vel) {
          let position = element.scrollLeft;
          const decay = 0.95; // Decay rate (0.9 - 0.98 is good)
          const minVelocity = 0.5;
          
          function animate() {
            if (Math.abs(vel) > minVelocity && !isDragging) {
              position += vel;
              element.scrollLeft = position;
              vel *= decay;
              animationFrame = requestAnimationFrame(animate);
            }
          }
          
          animate();
        }

        // Enable smooth scrolling for wheel events
        container.addEventListener('wheel', (e) => {
          e.preventDefault();
          container.scrollLeft += e.deltaY * 0.5; // Reduce scroll speed
        });
      });
    }

    // ==== Effect Functions ====
    function createRipple(event) {
      const button = event.currentTarget;
      const circle = document.createElement("span");
      const diameter = Math.max(button.clientWidth, button.clientHeight);
      const radius = diameter / 2;

      circle.style.width = circle.style.height = `${diameter}px`;
      circle.style.left = `${event.clientX - button.getBoundingClientRect().left - radius}px`;
      circle.style.top = `${event.clientY - button.getBoundingClientRect().top - radius}px`;
      circle.classList.add("ripple");

      const ripple = button.getElementsByClassName("ripple")[0];
      if (ripple) {
        ripple.remove();
      }

      button.appendChild(circle);
    }

    // ==== Event Listeners ====
    menuBtn.addEventListener('click', toggleSidebar);
    
    navItems.forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = item.getAttribute('href').substring(1);
        const targetSection = document.getElementById(`section-${targetId}`);
        
        if (targetSection) {
          window.scrollTo({
            top: targetSection.offsetTop - 80,
            behavior: 'smooth'
          });
        }
        
        // Close sidebar on mobile
        if (window.innerWidth < 768) {
          sidebar.classList.remove('active');
        }
      });
    });
    
    window.addEventListener('scroll', handleNavScroll);

    // Apply ripple effect to buttons
    const buttons = document.querySelectorAll('.nav-btn, .nav-tab, .channel-card');
    buttons.forEach(button => {
      button.addEventListener('click', createRipple);
    });

    // Initialize
    setupSliders();
    handleNavScroll();
    setActiveTab();

    // Section appear on scroll
    window.addEventListener('scroll', () => {
      const sections = document.querySelectorAll('.section');
      const scrollPosition = window.scrollY + window.innerHeight;
      
      sections.forEach(section => {
        const sectionOffset = section.offsetTop + section.offsetHeight * 0.3;
        
        if (scrollPosition > sectionOffset) {
          section.style.opacity = '1';
        }
      });
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
        return savedSettings ? {...defaultSettings, ...JSON.parse(savedSettings)} : defaultSettings;
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
    
      // ننتظر تحميل محتوى الصفحة بالكامل
window.addEventListener('DOMContentLoaded', function() {
  
  // تعطيل اختصارات النسخ (Ctrl + C)، القص (Ctrl + X)، الحفظ (Ctrl + S)، عرض مصدر الصفحة (Ctrl + U)
  document.addEventListener('keydown', function(e) {
    if (e.ctrlKey && ['KeyC', 'KeyX', 'KeyS', 'KeyU'].includes(e.code)) {
      e.preventDefault(); // منع تنفيذ الأمر
      alert('نسخ أو قص أو حفظ أو عرض الكود غير مسموح!');
    }
    
    // تعطيل أدوات المطور: (Ctrl + Shift + I) أو (F12)
    if ((e.ctrlKey && e.shiftKey && e.code === 'KeyI') || e.code === 'F12') {
      e.preventDefault(); // منع تنفيذ الأمر
      alert('أدوات المطور معطلة!');
    }
  });
  
  // تعطيل قائمة كليك يمين
  document.addEventListener('contextmenu', function(e) {
    e.preventDefault(); // منع ظهور القائمة
    alert('كليك يمين غير مسموح!');
  });
  
  // تعطيل تحديد النص
  document.addEventListener('selectstart', function(e) {
    e.preventDefault(); // منع تحديد النص
  });
   
}); 

// ==== Modal Functions ====
const modal = document.getElementById("modal");
const streamIframe = document.getElementById("stream-iframe");
const loading = document.querySelector(".loading");

// Open Modal
function openModal(url) {
    loading.style.display = "flex";
    streamIframe.src = url;
    modal.style.display = "flex";
    
    streamIframe.onload = () => {
        loading.style.display = "none";
    };
    
    streamIframe.onerror = () => {
        loading.innerHTML = `
            <span>فشل تحميل البث. يرجى المحاولة مرة أخرى</span>
            <button onclick="refreshStream()" style="
                background: var(--primary);
                border: none;
                padding: 8px 20px;
                border-radius: 20px;
                color: white;
                margin-top: 10px;
                cursor: pointer;
            ">إعادة المحاولة</button>
        `;
    };
}

// Close Modal
function closeModal() {
    modal.style.display = "none";
    streamIframe.src = "";
    document.exitPictureInPicture().catch(() => {});
}

// Refresh Stream
function refreshStream() {
    if (!streamIframe.src) return;
    
    loading.style.display = "flex";
    loading.textContent = "جارٍ التحميل...";
    
    // Force refresh by adding timestamp
    streamIframe.src = streamIframe.src.split('?')[0] + '?t=' + Date.now();
    
    streamIframe.onload = () => {
        loading.style.display = "none";
    };
}

// Picture in Picture
async function togglePictureInPicture() {
    try {
        if (document.pictureInPictureElement) {
            await document.exitPictureInPicture();
        } else {
            await streamIframe.requestPictureInPicture();
        }
    } catch (error) {
        console.error("Picture-in-Picture error:", error);
        alert("عذرًا، هذه الميزة غير متاحة لهذا الفيديو");
    }
}

// Set up channel card click events
document.querySelectorAll('.channel-link').forEach(link => {
    link.addEventListener('click', function(e) {
        e.preventDefault();
        const url = this.getAttribute('href');
        openModal(url);
    });
});

// Close modal when pressing ESC
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
});

