
  
    // نظام إدارة الإعدادات
    class SettingsManager {
      constructor() {
        this.settings = {
          darkMode: false,
          primaryColor: '#ff6b6b',
          theme: 'default',
          notifications: true,
          streamQuality: 'high',
          dataSaver: false,
          language: 'ar',
          timezone: 'GMT+3',
          autoplay: true,
          syncEnabled: false,
          user: null
        };
        this.load();
      }
      
      load() {
        const savedSettings = localStorage.getItem('filxproSettings');
        if (savedSettings) {
          this.settings = JSON.parse(savedSettings);
        }
        
        const userData = localStorage.getItem('filxproUser');
        if (userData) {
          this.settings.user = JSON.parse(userData);
        }
        
        this.applySettings();
      }
      
      save() {
        localStorage.setItem('filxproSettings', JSON.stringify(this.settings));
        this.applySettings();
      }
      
      applySettings() {
        // تطبيق الوضع المظلم
        if (this.settings.darkMode) {
          document.body.classList.add('dark-mode');
          document.body.classList.remove('light-mode');
        } else {
          document.body.classList.remove('dark-mode');
          if (this.settings.theme === 'light') {
            document.body.classList.add('light-mode');
          } else {
            document.body.classList.remove('light-mode');
          }
        }
        document.getElementById('dark-mode-toggle').checked = this.settings.darkMode;
        
        // تطبيق لون التطبيق
        document.documentElement.style.setProperty('--primary', this.settings.primaryColor);
        document.documentElement.style.setProperty('--primary-dark', this.darkenColor(this.settings.primaryColor, 20));
        
        // تحديث ألوان الخيارات
        document.querySelectorAll('.color-option').forEach(option => {
          option.classList.toggle('selected', option.getAttribute('data-color') === this.settings.primaryColor);
        });
        
        // تطبيق السمة
        document.querySelectorAll('.theme-option').forEach(option => {
          option.classList.toggle('selected', option.getAttribute('data-theme') === this.settings.theme);
        });
        
        // تطبيق إعدادات الإشعارات
        document.getElementById('notifications-toggle').checked = this.settings.notifications;
        
        // تطبيق جودة البث
        document.getElementById('quality-value').textContent = 
          this.settings.streamQuality === 'high' ? 'عالية' : 
          this.settings.streamQuality === 'medium' ? 'متوسطة' : 
          'منخفضة';
        
        // تطبيق حفظ البيانات
        document.getElementById('data-saver-toggle').checked = this.settings.dataSaver;
        
        // تطبيق اللغة
        document.querySelectorAll('.language-option').forEach(option => {
          option.classList.toggle('selected', option.getAttribute('data-lang') === this.settings.language);
        });
        
        // تطبيق المنطقة الزمنية
        document.getElementById('timezone-value').textContent = this.settings.timezone;
        
        // تطبيق التشغيل التلقائي
        document.getElementById('autoplay-toggle').checked = this.settings.autoplay;
        
        // تطبيق المزامنة
        document.getElementById('sync-toggle').checked = this.settings.syncEnabled;
        
        // تطبيق معلومات المستخدم
        this.updateUserUI();
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
      
      setUser(userData) {
        this.settings.user = userData;
        localStorage.setItem('filxproUser', JSON.stringify(userData));
        this.save();
      }
      
      clearUser() {
        this.settings.user = null;
        localStorage.removeItem('filxproUser');
        this.save();
      }
      
      updateUserUI() {
        const user = this.settings.user;
        const userInfo = document.getElementById('user-info');
        const loginBtn = document.getElementById('login-btn');
        const accountInfo = document.getElementById('account-info');
        const accountValue = document.getElementById('account-value');
        
        if (user) {
          // عرض معلومات المستخدم
          userInfo.style.display = 'block';
          document.getElementById('user-avatar').src = user.picture;
          loginBtn.style.display = 'none';
          
          // عرض معلومات الحساب
          accountInfo.style.display = 'flex';
          document.getElementById('account-avatar').src = user.picture;
          document.getElementById('account-name').textContent = user.name;
          document.getElementById('account-email').textContent = user.email || user.phone || 'لا يوجد بريد إلكتروني';
          accountValue.textContent = user.name;
        } else {
          // إخفاء معلومات المستخدم
          userInfo.style.display = 'none';
          loginBtn.style.display = 'flex';
          
          // إخفاء معلومات الحساب
          accountInfo.style.display = 'none';
          accountValue.textContent = 'غير مسجل';
        }
      }
    }

    // تهيئة نظام الترجمة
    function initTranslation() {
      i18next
        .use(i18nextHttpBackend)
        .init({
          lng: 'ar', // اللغة الافتراضية
          fallbackLng: 'ar',
          debug: false,
          backend: {
            loadPath: 'locales/{{lng}}/translation.json'
          },
          interpolation: {
            escapeValue: false
          }
        }, function(err, t) {
          // جاهز للاستخدام
          updateContent();
        });
    }

    // تحديث المحتوى بناءً على اللغة المحددة
    function updateContent() {
      $('[data-i18n]').each(function() {
        const key = $(this).data('i18n');
        $(this).html(i18next.t(key));
      });
    }

    // تهيئة المدير عند تحميل الصفحة
    document.addEventListener('DOMContentLoaded', () => {
      const settingsManager = new SettingsManager();
      
      // تهيئة نظام الترجمة
      initTranslation();
      
      // إنشاء تأثير ريبيل عند النقر
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
      
      // تطبيق تأثير ريبيل على العناصر
      const interactiveElements = document.querySelectorAll('.settings-item, .login-option, .nav-tab, .color-option, .language-option, .theme-option');
      interactiveElements.forEach(element => {
        element.addEventListener('click', createRipple);
      });

      // العودة للصفحة الرئيسية
      document.getElementById('back-btn').addEventListener('click', () => {
        window.location.href = 'index.html';
      });
      
      // تغيير الوضع المظلم
      document.getElementById('dark-mode-toggle').addEventListener('change', (e) => {
        settingsManager.settings.darkMode = e.target.checked;
        settingsManager.save();
      });
      
      // تغيير لون التطبيق
      document.querySelectorAll('.color-option').forEach(option => {
        option.addEventListener('click', () => {
          settingsManager.settings.primaryColor = option.getAttribute('data-color');
          settingsManager.save();
        });
      });
      
      // تغيير السمة
      document.querySelectorAll('.theme-option').forEach(option => {
        option.addEventListener('click', () => {
          settingsManager.settings.theme = option.getAttribute('data-theme');
          settingsManager.settings.darkMode = settingsManager.settings.theme === 'dark';
          settingsManager.save();
        });
      });
      
      // تغيير إعدادات الإشعارات
      document.getElementById('notifications-toggle').addEventListener('change', (e) => {
        settingsManager.settings.notifications = e.target.checked;
        settingsManager.save();
      });
      
      // تغيير جودة البث
      document.getElementById('quality-item').addEventListener('click', () => {
        const qualities = ['high', 'medium', 'low'];
        const currentIndex = qualities.indexOf(settingsManager.settings.streamQuality);
        const nextIndex = (currentIndex + 1) % qualities.length;
        settingsManager.settings.streamQuality = qualities[nextIndex];
        settingsManager.save();
      });
      
      // تغيير حفظ البيانات
      document.getElementById('data-saver-toggle').addEventListener('change', (e) => {
        settingsManager.settings.dataSaver = e.target.checked;
        settingsManager.save();
      });
      
      // تغيير اللغة
      document.querySelectorAll('.language-option').forEach(option => {
        option.addEventListener('click', () => {
          const lang = option.getAttribute('data-lang');
          settingsManager.settings.language = lang;
          settingsManager.save();
          
          // تغيير اتجاه الصفحة حسب اللغة
          document.documentElement.lang = lang;
          document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
          
          // تغيير اللغة في نظام الترجمة
          i18next.changeLanguage(lang, (err, t) => {
            if (err) return console.log('حدث خطأ في تغيير اللغة', err);
            updateContent();
          });
        });
      });
      
      // تغيير المنطقة الزمنية
      document.getElementById('timezone-item').addEventListener('click', () => {
        const timezones = ['GMT+3', 'GMT+2', 'GMT+1', 'GMT', 'GMT-1'];
        const currentIndex = timezones.indexOf(settingsManager.settings.timezone);
        const nextIndex = (currentIndex + 1) % timezones.length;
        settingsManager.settings.timezone = timezones[nextIndex];
        settingsManager.save();
      });
      
      // تغيير التشغيل التلقائي
      document.getElementById('autoplay-toggle').addEventListener('change', (e) => {
        settingsManager.settings.autoplay = e.target.checked;
        settingsManager.save();
      });
      
      // تغيير المزامنة
      document.getElementById('sync-toggle').addEventListener('change', (e) => {
        settingsManager.settings.syncEnabled = e.target.checked;
        settingsManager.save();
      });
      
      // تسجيل الدخول
      document.getElementById('login-btn').addEventListener('click', (e) => {
        // تم إزالة النافذة المنبثقة القديمة
        // سيتم توجيه المستخدم مباشرة إلى صفحة تسجيل الدخول
      });
      
      // تسجيل الخروج
      document.getElementById('logout-btn').addEventListener('click', () => {
        settingsManager.clearUser();
      });
      
      // الاستماع لتحديثات المستخدم من الصفحات الأخرى
      window.addEventListener('message', (event) => {
        if (event.data.type === 'userLoggedIn') {
          settingsManager.setUser(event.data.user);
        }
      });
    });
  