const API_KEY = "f4222a8f6ae6339f59be3c7269f49324a2f9b4eeb0763e208aa8f2139fd0b68c";
const LEAGUE_ID = 207; // الدوري الإيطالي

const teamNamesArabic = {
  "Juventus": "يوفنتوس",
  "Inter": "إنتر ميلان",
  "AC Milan": "إيه سي ميلان",
  "Napoli": "نابولي",
  "AS Roma": "روما",
  "Lazio": "لاتسيو",
  "Atalanta": "أتالانتا",
  "Fiorentina": "فيورنتينا",
  "Torino": "تورينو",
  "Sampdoria": "سامبدوريا",
  "Sassuolo": "ساسولو",
  "Udinese": "أودينيزي",
  "Bologna": "بولونيا",
  "Verona": "هيلاس فيرونا",
  "Genoa": "جنوة",
  "Cagliari": "كالياري",
  "Spezia": "سبيزيا",
  "Empoli": "إمبولي",
  "Salernitana": "ساليرنيتانا",
  "Venezia": "فينيسيا",
  "Lecce": "ليتشي",
  "Monza": "مونزا",
  "Cremonese": "كريمونيسي"
};

const teamExternalLinks = {
  "Juventus": "Juventus.html",
  "Inter": "Inter.html",
  "AC Milan": "ACMilan.html",
  "Napoli": "Napoli.html",
  "AS Roma": "ASRoma.html",
  "Lazio": "Lazio.html",
  "Atalanta": "Atalanta.html",
  "Fiorentina": "Fiorentina.html",
  "Torino": "Torino.html",
  "Sampdoria": "Sampdoria.html",
  "Sassuolo": "Sassuolo.html",
  "Udinese": "Udinese.html",
  "Bologna": "Bologna.html",
  "Verona": "Verona.html",
  "Genoa": "Genoa.html",
  "Cagliari": "Cagliari.html",
  "Spezia": "Spezia.html",
  "Empoli": "Empoli.html",
  "Salernitana": "Salernitana.html",
  "Venezia": "Venezia.html",
  "Lecce": "Lecce.html",
  "Monza": "Monza.html",
  "Cremonese": "Cremonese.html"
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
        teamDiv.classList.add("champions"); // أزرق للأول والثاني
      } else if (team.overall_league_position === 3) {
        teamDiv.classList.add("europa"); // برتقالي للثالث
      } else if (team.overall_league_position >= 16) { // آخر 3 فرق
        teamDiv.classList.add("relegation"); // أحمر لآخر 3 فرق
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