// Firebase Configuration and Initialization
    const firebaseConfig = {
      apiKey: "AIzaSyCe8nzeQnE00SCirH6nIJiqC0UqNctLv8M",
      authDomain: "okay-70776.firebaseapp.com",
      databaseURL: "https://okay-70776-default-rtdb.firebaseio.com",
      projectId: "okay-70776",
      storageBucket: "okay-70776.appspot.com",
      messagingSenderId: "687867635737",
      appId: "1:687867635737:web:e6fe41ff2ae2aa87a4e288",
      measurementId: "G-D0QRWZLZV7"
    };

    // Initialize Firebase
    firebase.initializeApp(firebaseConfig);
    const auth = firebase.auth();

    // Application State Manager
    class AppState {
      constructor() {
        this.state = {
          isLoading: false,
          currentModal: null,
          verificationId: null,
          resendTimeout: null,
          canResend: true
        };
      }
      
      setLoading(isLoading) {
        this.state.isLoading = isLoading;
        document.body.style.pointerEvents = isLoading ? 'none' : 'auto';
        document.body.style.opacity = isLoading ? '0.8' : '1';
      }
      
      showModal(modalContent) {
        this.closeModal();
        
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = modalContent;
        document.body.appendChild(modal);
        this.state.currentModal = modal;
        
        // Focus on first input in modal
        const firstInput = modal.querySelector('input');
        if (firstInput) firstInput.focus();
      }
      
      closeModal() {
        if (this.state.currentModal) {
          document.body.removeChild(this.state.currentModal);
          this.state.currentModal = null;
        }
      }
      
      showToast(message, type = 'info', duration = 3000) {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        let icon = '';
        switch(type) {
          case 'success': icon = '<i class="fas fa-check-circle"></i>'; break;
          case 'error': icon = '<i class="fas fa-exclamation-circle"></i>'; break;
          case 'warning': icon = '<i class="fas fa-exclamation-triangle"></i>'; break;
          default: icon = '<i class="fas fa-info-circle"></i>';
        }
        
        toast.innerHTML = `${icon} ${message}`;
        document.body.appendChild(toast);
        
        setTimeout(() => {
          toast.style.animation = 'fadeInUp 0.3s reverse forwards';
          setTimeout(() => document.body.removeChild(toast), 300);
        }, duration);
      }
      
      startResendTimer(seconds = 30) {
        this.state.canResend = false;
        
        if (this.state.resendTimeout) {
          clearInterval(this.state.resendTimeout);
        }
        
        const resendLink = document.querySelector('.resend-link');
        if (resendLink) {
          resendLink.classList.add('disabled');
          let counter = seconds;
          
          const updateText = () => {
            resendLink.textContent = `إعادة إرسال (${counter} ثانية)`;
            counter--;
            
            if (counter < 0) {
              clearInterval(timer);
              resendLink.textContent = 'إعادة إرسال';
              resendLink.classList.remove('disabled');
              this.state.canResend = true;
            }
          };
          
          updateText();
          const timer = setInterval(updateText, 1000);
          this.state.resendTimeout = timer;
        }
      }
    }

    // User Authentication Manager
    class AuthManager {
      constructor(appState) {
        this.appState = appState;
        this.recaptchaVerifier = null;
        this.initRecaptcha();
      }
      
      initRecaptcha() {
        this.recaptchaVerifier = new firebase.auth.RecaptchaVerifier('phoneLoginBtn', {
          size: 'invisible',
          callback: () => {
            // This will be called when reCAPTCHA is solved
            this.handlePhoneLogin();
          }
        });
      }
      
      // Email/Password Login
      async loginWithEmail(email, password) {
        try {
          this.appState.setLoading(true);
          const userCredential = await auth.signInWithEmailAndPassword(email, password);
          this.handleSuccessLogin(userCredential.user);
        } catch (error) {
          this.handleAuthError(error, 'email');
        } finally {
          this.appState.setLoading(false);
        }
      }
      
      // Phone Number Login
      async loginWithPhone(phoneNumber) {
        try {
          this.appState.setLoading(true);
          
          // Send verification code
          const verificationId = await this.sendVerificationCode(phoneNumber);
          this.state.verificationId = verificationId;
          
          // Show OTP modal
          this.showOTPModal(phoneNumber);
        } catch (error) {
          this.handleAuthError(error, 'phone');
        } finally {
          this.appState.setLoading(false);
        }
      }
      
      async sendVerificationCode(phoneNumber) {
        return new Promise((resolve, reject) => {
          auth.signInWithPhoneNumber(phoneNumber, this.recaptchaVerifier)
            .then((confirmationResult) => {
              resolve(confirmationResult.verificationId);
            })
            .catch((error) => {
              reject(error);
            });
        });
      }
      
      async verifyOTP(otp, verificationId) {
        try {
          this.appState.setLoading(true);
          const credential = firebase.auth.PhoneAuthProvider.credential(verificationId, otp);
          const userCredential = await auth.signInWithCredential(credential);
          this.handleSuccessLogin(userCredential.user);
        } catch (error) {
          this.handleAuthError(error, 'otp');
        } finally {
          this.appState.setLoading(false);
        }
      }
      
      // Social Login Providers
      async loginWithGoogle() {
        const provider = new firebase.auth.GoogleAuthProvider();
        provider.addScope('profile');
        provider.addScope('email');
        await this.loginWithProvider(provider);
      }
      
      async loginWithFacebook() {
        const provider = new firebase.auth.FacebookAuthProvider();
        provider.addScope('public_profile');
        provider.addScope('email');
        await this.loginWithProvider(provider);
      }
      
      async loginWithApple() {
        const provider = new firebase.auth.OAuthProvider('apple.com');
        provider.addScope('email');
        provider.addScope('name');
        await this.loginWithProvider(provider);
      }
      
      async loginWithProvider(provider) {
        try {
          this.appState.setLoading(true);
          const result = await auth.signInWithPopup(provider);
          this.handleSuccessLogin(result.user);
        } catch (error) {
          this.handleAuthError(error, 'social');
        } finally {
          this.appState.setLoading(false);
        }
      }
      
      // Password Reset
      async sendPasswordResetEmail(email) {
        try {
          this.appState.setLoading(true);
          await auth.sendPasswordResetEmail(email);
          this.appState.showToast('تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني', 'success');
        } catch (error) {
          this.handleAuthError(error, 'reset');
        } finally {
          this.appState.setLoading(false);
        }
      }
      
      // Handle Successful Login
      handleSuccessLogin(user) {
        const userData = {
          uid: user.uid,
          name: user.displayName || this.getDefaultName(user),
          email: user.email || user.phoneNumber || 'بريد غير معروف',
          phone: user.phoneNumber || 'غير معروف',
          picture: user.photoURL || this.getDefaultAvatar(user),
          provider: user.providerData[0]?.providerId || 'email'
        };
        
        // Save user data to localStorage
        localStorage.setItem('filxproUser', JSON.stringify(userData));
        
        // Show success message
        this.appState.showToast(`مرحباً ${userData.name}`, 'success');
        
        // Redirect to home page after a short delay
        setTimeout(() => {
          window.location.href = 'index.html';
        }, 1500);
      }
      
      // Handle Authentication Errors
      handleAuthError(error, context) {
        console.error(`${context} auth error:`, error);
        
        let errorMessage = 'حدث خطأ أثناء المصادقة';
        const errorCode = error.code;
        
        switch(errorCode) {
          // Email/Password Errors
          case 'auth/invalid-email':
            errorMessage = 'بريد إلكتروني غير صالح';
            document.getElementById('emailInput').classList.add('input-error');
            document.getElementById('emailError').textContent = errorMessage;
            document.getElementById('emailError').style.display = 'block';
            break;
          case 'auth/user-disabled':
            errorMessage = 'هذا الحساب معطل';
            break;
          case 'auth/user-not-found':
            errorMessage = 'البريد الإلكتروني غير مسجل';
            document.getElementById('emailInput').classList.add('input-error');
            document.getElementById('emailError').textContent = errorMessage;
            document.getElementById('emailError').style.display = 'block';
            break;
          case 'auth/wrong-password':
            errorMessage = 'كلمة المرور غير صحيحة';
            document.getElementById('passwordInput').classList.add('input-error');
            document.getElementById('passwordError').textContent = errorMessage;
            document.getElementById('passwordError').style.display = 'block';
            break;
          
          // Phone Number Errors
          case 'auth/invalid-phone-number':
            errorMessage = 'رقم الهاتف غير صالح';
            document.getElementById('phoneInput').classList.add('input-error');
            document.getElementById('phoneError').textContent = errorMessage;
            document.getElementById('phoneError').style.display = 'block';
            break;
          case 'auth/missing-phone-number':
            errorMessage = 'الرجاء إدخال رقم الهاتف';
            document.getElementById('phoneInput').classList.add('input-error');
            document.getElementById('phoneError').textContent = errorMessage;
            document.getElementById('phoneError').style.display = 'block';
            break;
          
          // OTP Errors
          case 'auth/invalid-verification-code':
            errorMessage = 'رمز التحقق غير صحيح';
            break;
          case 'auth/code-expired':
            errorMessage = 'انتهت صلاحية رمز التحقق';
            break;
          
          // Social Login Errors
          case 'auth/account-exists-with-different-credential':
            errorMessage = 'هذا البريد الإلكتروني مسجل بالفعل بطريقة أخرى';
            break;
          case 'auth/popup-closed-by-user':
            errorMessage = 'تم إغلاق نافذة تسجيل الدخول';
            break;
          case 'auth/cancelled-popup-request':
            errorMessage = 'تم إلغاء طلب تسجيل الدخول';
            break;
          
          // Password Reset Errors
          case 'auth/missing-email':
            errorMessage = 'الرجاء إدخال البريد الإلكتروني';
            break;
        }
        
        this.appState.showToast(errorMessage, 'error');
      }
      
      // Show OTP Modal
      showOTPModal(phoneNumber) {
        const modalContent = `
          <div class="modal-content">
            <h3 class="modal-title">تحقق من رقم الهاتف</h3>
            <p class="modal-message">سيتم إرسال رمز التحقق إلى الرقم <strong>${phoneNumber}</strong></p>
            
            <div class="otp-container">
              <input type="text" maxlength="1" class="otp-input" data-index="0">
              <input type="text" maxlength="1" class="otp-input" data-index="1">
              <input type="text" maxlength="1" class="otp-input" data-index="2">
              <input type="text" maxlength="1" class="otp-input" data-index="3">
              <input type="text" maxlength="1" class="otp-input" data-index="4">
              <input type="text" maxlength="1" class="otp-input" data-index="5">
            </div>
            
            <button id="verifyOtpBtn" class="modal-btn modal-btn-primary">
              تأكيد الرمز
            </button>
            
            <p class="modal-message">
              لم تستلم الرمز؟ <a href="#" class="resend-link">إعادة إرسال</a>
            </p>
          </div>
        `;
        
        this.appState.showModal(modalContent);
        
        // Handle OTP input
        const otpInputs = document.querySelectorAll('.otp-input');
        otpInputs.forEach((input, index) => {
          input.addEventListener('input', (e) => {
            if (e.target.value && index < otpInputs.length - 1) {
              otpInputs[index + 1].focus();
            }
            
            // Auto submit if all fields are filled
            if (index === otpInputs.length - 1 && e.target.value) {
              const allFilled = Array.from(otpInputs).every(i => i.value);
              if (allFilled) {
                document.getElementById('verifyOtpBtn').click();
              }
            }
          });
          
          input.addEventListener('keydown', (e) => {
            if (e.key === 'Backspace' && !e.target.value && index > 0) {
              otpInputs[index - 1].focus();
            }
          });
        });
        
        // Handle verify button
        document.getElementById('verifyOtpBtn').addEventListener('click', () => {
          const otp = Array.from(otpInputs).map(i => i.value).join('');
          
          if (otp.length !== 6) {
            this.appState.showToast('الرجاء إدخال رمز التحقق المكون من 6 أرقام', 'error');
            return;
          }
          
          this.verifyOTP(otp, this.state.verificationId);
        });
        
        // Handle resend link
        document.querySelector('.resend-link').addEventListener('click', (e) => {
          e.preventDefault();
          if (!this.appState.state.canResend) return;
          
          this.sendVerificationCode(phoneNumber)
            .then((verificationId) => {
              this.state.verificationId = verificationId;
              this.appState.showToast('تم إعادة إرسال رمز التحقق', 'success');
              this.appState.startResendTimer(30);
            })
            .catch((error) => {
              this.handleAuthError(error, 'resend');
            });
        });
        
        // Start resend timer
        this.appState.startResendTimer(30);
      }
      
      // Helper Methods
      getDefaultName(user) {
        if (user.phoneNumber) return `مستخدم ${user.phoneNumber}`;
        if (user.email) return user.email.split('@')[0];
        return 'مستخدم Filxpro';
      }
      
      getDefaultAvatar(user) {
        if (user.phoneNumber) return 'https://i.pravatar.cc/150?img=7';
        if (user.email) return `https://i.pravatar.cc/150?u=${user.email}`;
        return 'https://i.pravatar.cc/150?img=3';
      }
    }

    // Form Validator
    class FormValidator {
      static validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
      }
      
      static validatePhone(phone) {
        const re = /^[0-9]{10,15}$/;
        return re.test(phone);
      }
      
      static validatePassword(password) {
        return password.length >= 6;
      }
    }

    // Event Listeners and Initialization
    document.addEventListener('DOMContentLoaded', () => {
      // Initialize App State and Auth Manager
      const appState = new AppState();
      const authManager = new AuthManager(appState);
      
      // Add Ripple Effect to Buttons
      const addRippleEffect = (button) => {
        button.addEventListener('click', function(e) {
          const rect = this.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          
          const ripple = document.createElement('span');
          ripple.className = 'ripple';
          ripple.style.left = `${x}px`;
          ripple.style.top = `${y}px`;
          
          this.appendChild(ripple);
          setTimeout(() => ripple.remove(), 600);
        });
      };
      
      document.querySelectorAll('.login-btn, .social-btn').forEach(addRippleEffect);
      
      // Clear error when input changes
      document.getElementById('emailInput').addEventListener('input', () => {
        document.getElementById('emailInput').classList.remove('input-error');
        document.getElementById('emailError').style.display = 'none';
      });
      
      document.getElementById('passwordInput').addEventListener('input', () => {
        document.getElementById('passwordInput').classList.remove('input-error');
        document.getElementById('passwordError').style.display = 'none';
      });
      
      document.getElementById('phoneInput').addEventListener('input', () => {
        document.getElementById('phoneInput').classList.remove('input-error');
        document.getElementById('phoneError').style.display = 'none';
      });
      
      // Email/Password Login Form
      document.getElementById('loginForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('emailInput').value.trim();
        const password = document.getElementById('passwordInput').value;
        
        // Validate inputs
        if (!FormValidator.validateEmail(email)) {
          document.getElementById('emailInput').classList.add('input-error');
          document.getElementById('emailError').textContent = 'بريد إلكتروني غير صالح';
          document.getElementById('emailError').style.display = 'block';
          return;
        }
        
        if (!FormValidator.validatePassword(password)) {
          document.getElementById('passwordInput').classList.add('input-error');
          document.getElementById('passwordError').textContent = 'كلمة المرور يجب أن تكون 6 أحرف على الأقل';
          document.getElementById('passwordError').style.display = 'block';
          return;
        }
        
        // Show loading state
        document.getElementById('emailLoginText').style.display = 'none';
        document.getElementById('emailSpinner').style.display = 'block';
        
        // Perform login
        await authManager.loginWithEmail(email, password);
        
        // Reset loading state
        document.getElementById('emailLoginText').style.display = 'block';
        document.getElementById('emailSpinner').style.display = 'none';
      });
      
      // Phone Login Button
      document.getElementById('phoneLoginBtn').addEventListener('click', async () => {
        const phoneNumber = '+20' + document.getElementById('phoneInput').value.trim();
        
        if (!FormValidator.validatePhone(document.getElementById('phoneInput').value.trim())) {
          document.getElementById('phoneInput').classList.add('input-error');
          document.getElementById('phoneError').textContent = 'رقم الهاتف يجب أن يكون 10 أرقام على الأقل';
          document.getElementById('phoneError').style.display = 'block';
          return;
        }
        
        // Show loading state
        document.getElementById('phoneLoginText').style.display = 'none';
        document.getElementById('phoneSpinner').style.display = 'block';
        
        // Perform login
        await authManager.loginWithPhone(phoneNumber);
        
        // Reset loading state
        document.getElementById('phoneLoginText').style.display = 'block';
        document.getElementById('phoneSpinner').style.display = 'none';
      });
      
      // Social Login Buttons
      document.getElementById('googleLoginBtn').addEventListener('click', () => {
        authManager.loginWithGoogle();
      });
      
      document.getElementById('facebookLoginBtn').addEventListener('click', () => {
        authManager.loginWithFacebook();
      });
      
      document.getElementById('appleLoginBtn').addEventListener('click', () => {
        authManager.loginWithApple();
      });
      
      // Forgot Password Link
      document.getElementById('forgotPasswordLink').addEventListener('click', (e) => {
        e.preventDefault();
        
        const email = prompt('الرجاء إدخال بريدك الإلكتروني لإعادة تعيين كلمة المرور:');
        if (email && FormValidator.validateEmail(email)) {
          authManager.sendPasswordResetEmail(email);
        } else if (email) {
          appState.showToast('بريد إلكتروني غير صالح', 'error');
        }
      });
      
      // Register Link
      document.getElementById('registerLink').addEventListener('click', (e) => {
        e.preventDefault();
        appState.showToast('سيتم توجيهك إلى صفحة التسجيل', 'info');
        // In a real app, you would redirect to registration page
        // window.location.href = 'register.html';
      });
    });