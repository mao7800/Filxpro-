const API_KEY = "f4222a8f6ae6339f59be3c7269f49324a2f9b4eeb0763e208aa8f2139fd0b68c";
const LEAGUE_ID = 152; // الدوري الإنجليزي الممتاز

const teamNamesArabic = {
  "Arsenal": "أرسنال",
  "Manchester City": "مانشستر سيتي",
  "Liverpool": "ليفربول",
  "Chelsea": "تشيلسي",
  "Tottenham": "توتنهام",
  "Manchester Utd": "مانشستر يونايتد",
  "Leicester": "ليستر سيتي",
  "West Ham": "وست هام",
  "Aston Villa": "أستون فيلا",
  "Newcastle": "نيوكاسل",
  "Brighton": "برايتون",
  "Wolves": "وولفرهامبتون",
  "Crystal Palace": "كريستال بالاس",
  "Southampton": "ساوثهامبتون",
  "Everton": "إيفرتون",
  "Leeds United": "ليدز يونايتد",
  "Brentford": "برينتفورد",
  "Watford": "واتفورد",
  "Burnley": "بيرنلي",
  "Norwich City": "نورويتش سيتي",
  "Fulham": "فولهام",
  "Bournemouth": "بورنموث",
  "Nottingham": "نوتنغهام فورست",
  "Sheffield Utd": "شيفيلد يونايتد",
  "Luton": "لوتون تاون"
};

const teamExternalLinks = {
  "Arsenal": "Arsenal.html",
  "Manchester City": "Manchester.html",
  "Liverpool": "Liverpool.html",
  "Chelsea": "Chelsea.html",
  "Tottenham": "Tottenham.html",
  "Manchester Utd": "ManchesterUtd.html",
  "Leicester": "Leicester.html",
  "West Ham": "WestHam.html",
  "Aston Villa": "AstonVilla.html",
  "Newcastle": "Newcastle.html",
  "Brighton": "Brighton.html",
  "Wolves": "Wolves.html",
  "Crystal Palace": "CrystalPalace.html",
  "Southampton": "Southampton.html",
  "Everton": "Everton.html",
  "Leeds United": "LeedsUnited.html",
  "Brentford": "Brentford.html",
  "Watford": "Watford.html",
  "Burnley": "Burnley.html",
  "Norwich City": "NorwichCity.html",
  "Fulham": "Fulham.html",
  "Bournemouth": "Bournemouth.html",
  "Nottingham": "Nottingham.html",
  "Sheffield Utd": "SheffieldUtd.html",
  "Luton": "Luton.html"
};

async function fetchStandings() {
  try {
    const response = await fetch(`https://apiv3.apifootball.com/?action=get_standings&league_id=${LEAGUE_ID}&APIkey=${API_KEY}`);
    const data = await response.json();
    
    if (!Array.isArray(data)) {
      throw new Error("Invalid API response");
    }
    
    const standingsContainer = document.getElementById("standings");
    standingsContainer.innerHTML = "";
    
    // إنشاء رأس الجدول
    const tableHeader = document.createElement("div");
    tableHeader.className = "team-container";
    tableHeader.style.background = "rgba(30, 34, 39, 0.8)";
    tableHeader.style.position = "sticky";
    tableHeader.style.top = "10px";
    tableHeader.style.zIndex = "10";
    tableHeader.style.marginBottom = "15px";
    tableHeader.innerHTML = `
                    <div class="team-info">
                        <div style="display: flex; align-items: center; width: 40%;">
                            <div class="column-title" style="margin-left: 15px; width: 30px;">#</div>
                            <div class="column-title" style="text-align: right; flex-grow: 1;">الفريق</div>
                        </div>
                        <div style="flex-grow: 1;"></div>
                        <div style="display: flex; align-items: center;">
                            <div style="margin-left: 15px; width: 50px;">
                                <div class="column-title">فوز</div>
                            </div>
                            <div style="margin-left: 15px; width: 50px;">
                                <div class="column-title">خسارة</div>
                            </div>
                            <div style="margin-left: 15px; width: 60px;">
                                <div class="column-title">النقاط</div>
                            </div>
                        </div>
                    </div>
                `;
    standingsContainer.appendChild(tableHeader);
    
    data.forEach(team => {
      const teamDiv = document.createElement("div");
      teamDiv.className = "team-container";
      
      // تطبيق الأنماط بناءً على الترتيب
      if (team.overall_league_position === 1 || team.overall_league_position === 2) {
        teamDiv.classList.add("champions");
      } else if (team.overall_league_position === 3) {
        teamDiv.classList.add("europa");
      } else if (team.overall_league_position >= 18) {
        teamDiv.classList.add("relegation");
      }
      
      const teamNameInArabic = teamNamesArabic[team.team_name] || team.team_name;
      const teamExternalLink = teamExternalLinks[team.team_name] || `https://www.google.com/search?q=${encodeURIComponent(team.team_name)}`;
      
      teamDiv.innerHTML = `
                        <div class="team-info">
                            <div style="display: flex; align-items: center; width: 40%;">
                                <div class="team-position">${team.overall_league_position}</div>
                                <img class="team-logo" src="${team.team_badge}" alt="${team.team_name}" onerror="this.src='https://via.placeholder.com/32?text=LOGO'">
                                <a href="${teamExternalLink}" target="_blank" class="team-name" title="معلومات عن الفريق">${teamNameInArabic}</a>
                            </div>
                            <div style="flex-grow: 1;"></div>
                            <div style="display: flex; align-items: center;">
                                <div style="margin-left: 15px; width: 50px;">
                                    <div class="win">${team.overall_league_W}</div>
                                </div>
                                <div style="margin-left: 15px; width: 50px;">
                                    <div class="loss">${team.overall_league_L}</div>
                                </div>
                                <div style="margin-left: 15px; width: 60px;">
                                    <div class="points">${team.overall_league_PTS}</div>
                                </div>
                            </div>
                        </div>
                    `;
      
      standingsContainer.appendChild(teamDiv);
    });
  } catch (error) {
    console.error("Error fetching standings:", error);
    document.getElementById("error").style.display = "block";
  } finally {
    document.getElementById("loading").style.display = "none";
  }
}

fetchStandings();

// إظهار أو إخفاء الأيقونة بناءً على موضع التمرير
window.addEventListener("scroll", () => {
  const backToHomeButton = document.getElementById("back-to-home");
  if (window.scrollY > 200) {
    backToHomeButton.classList.add("show");
  } else {
    backToHomeButton.classList.remove("show");
  }
});

// تأثيرات عند التحميل
document.addEventListener("DOMContentLoaded", () => {
  setTimeout(() => {
    document.body.style.opacity = "1";
  }, 100);
});

document.body.style.opacity = "0";
document.body.style.transition = "opacity 0.5s ease";

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