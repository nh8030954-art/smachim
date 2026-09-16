(() => {
  "use strict";
  try {
    if (window.top !== window.self) {
      document.documentElement.style.display = "none";
      try { window.top.location = window.self.location.href; } catch (_) {}
      return;
    }
    Object.defineProperty(window, "__SMACHIM_TOP_LEVEL__", {value:true,configurable:false,enumerable:false,writable:false});
    try {
      const cached=JSON.parse(localStorage.getItem("smachimPublicAppearanceV3")||"null");
      const d=cached?.design||{};
      const bounded=(v,fallback,min,max)=>{const n=Number(v);return Number.isFinite(n)?Math.max(min,Math.min(max,Math.round(n))):fallback;};
      const logoDesktop=bounded(d.logo_width_desktop,380,220,700),logoMobile=bounded(d.logo_width_mobile,220,140,320);
      const logoPaddingDesktop=bounded(d.logo_padding_desktop,4,0,80),logoPaddingMobile=bounded(d.logo_padding_mobile,2,0,40);
      const logoCropDesktop=Math.max(72,Math.round(logoDesktop*.29)),logoCropMobile=Math.max(46,Math.round(logoMobile*.29));
      const ratio=2048/938,requestedDesktop=bounded(d.header_height_desktop,112,72,340),requestedMobile=bounded(d.header_height_mobile,52,48,180);
      const effectiveDesktop=Math.max(requestedDesktop,Math.ceil(logoDesktop/ratio)+2),effectiveMobile=Math.max(requestedMobile,Math.ceil(Math.min(logoMobile,window.innerWidth*.64)/ratio)+2);
      const heroDesktop=bounded(d.hero_height_desktop,0,0,700),heroMobile=bounded(d.hero_height_mobile,0,0,420),root=document.documentElement;
      root.style.setProperty("--site-logo-width-desktop",logoDesktop+"px");root.style.setProperty("--site-logo-width-mobile",logoMobile+"px");
      root.style.setProperty("--site-logo-padding-desktop",logoPaddingDesktop+"px");root.style.setProperty("--site-logo-padding-mobile",logoPaddingMobile+"px");
      root.style.setProperty("--site-logo-crop-height-desktop",logoCropDesktop+"px");root.style.setProperty("--site-logo-crop-height-mobile",logoCropMobile+"px");
      root.style.setProperty("--site-header-height-desktop",effectiveDesktop+"px");root.style.setProperty("--site-header-height-mobile",effectiveMobile+"px");
      root.style.setProperty("--site-hero-height-desktop",heroDesktop?heroDesktop+"px":"auto");root.style.setProperty("--site-hero-img-height-desktop",heroDesktop?"100%":"auto");root.style.setProperty("--site-hero-fit-desktop",heroDesktop?"cover":"contain");root.style.setProperty("--site-hero-overflow-desktop",heroDesktop?"hidden":"visible");
      root.style.setProperty("--site-hero-height-mobile",heroMobile?heroMobile+"px":"auto");root.style.setProperty("--site-hero-img-height-mobile",heroMobile?"100%":"auto");root.style.setProperty("--site-hero-fit-mobile",heroMobile?"cover":"contain");root.style.setProperty("--site-hero-overflow-mobile",heroMobile?"hidden":"visible");
      root.style.setProperty("--site-button-font-size",(bounded(d.button_font_percent,100,85,130)/100)+"rem");root.style.setProperty("--site-button-radius",bounded(d.button_radius_px,8,0,24)+"px");root.style.setProperty("--site-card-radius",bounded(d.card_radius_px,16,6,30)+"px");root.style.setProperty("--site-home-gap",bounded(d.home_section_gap_px,24,0,120)+"px");

      document.addEventListener("DOMContentLoaded",()=>{
        const versioned=(url,fallback)=>{const value=url||fallback;return value.startsWith("./assets/")?value.split("?")[0]+"?v=20260916-coverage1":value;};
        const logo=document.getElementById("site-logo-img"),hero=document.getElementById("home-hero-img");if(logo&&cached?.logo_url)logo.src=versioned(cached.logo_url,"./assets/site-title.jpg");if(hero&&cached?.hero_url)hero.src=versioned(cached.hero_url,"./assets/hero-banner.jpg");
        const timeIds=["vol-available-from","vol-available-until","profile-available-from","profile-available-until","ev-start","ev-close","edit-ev-start","edit-ev-close"];
        const times=[];for(let m=17*60;m<=26*60;m+=15){const n=m%(24*60);times.push(String(Math.floor(n/60)).padStart(2,"0")+":"+String(n%60).padStart(2,"0"));}
        const syncVisual=(input,select)=>{const value=input.value||"";if(value&&!times.includes(value)){let legacy=select.querySelector('option[data-legacy="1"]');if(!legacy){legacy=document.createElement("option");legacy.dataset.legacy="1";select.appendChild(legacy);}legacy.value=value;legacy.textContent=value;}select.value=value;};
        timeIds.forEach(id=>{const input=document.getElementById(id);if(!input||input.dataset.simpleTimeReady==="1")return;input.dataset.simpleTimeReady="1";const select=document.createElement("select");select.className=input.className+" bg-white";select.setAttribute("aria-label",input.getAttribute("aria-label")||"בחירת שעה");const empty=document.createElement("option");empty.value="";empty.textContent="בחר/י שעה";select.appendChild(empty);times.forEach(t=>{const o=document.createElement("option");o.value=t;o.textContent=t;select.appendChild(o);});input.style.display="none";input.setAttribute("aria-hidden","true");input.insertAdjacentElement("afterend",select);select.addEventListener("change",()=>{input.value=select.value;input.dispatchEvent(new Event("input",{bubbles:true}));input.dispatchEvent(new Event("change",{bubbles:true}));});syncVisual(input,select);let last=input.value;const observer=()=>{if(input.value!==last){last=input.value;syncVisual(input,select);}if(document.documentElement.contains(input))requestAnimationFrame(observer);};requestAnimationFrame(observer);});

        const addStay=(anchorId)=>{const anchor=document.getElementById(anchorId);if(!anchor||document.getElementById(anchorId+"-stay-ui"))return;const box=document.createElement("div");box.id=anchorId+"-stay-ui";box.className="mt-3";box.innerHTML='<label class="block font-semibold mb-1">כמה זמן בדרך כלל מתאים לך לשמח באירוע?</label><select class="w-full border rounded-lg p-2 bg-white"><option value="30">כחצי שעה</option><option value="60" selected>כשעה</option><option value="90">כשעה וחצי</option><option value="120">כשעתיים</option><option value="0">אשמח להישאר כל עוד אני פנוי/ה</option></select><p class="text-sm opacity-70 mt-1">זו העדפה בלבד. בכל אירוע נציע לך שעות שמתאימות לזמינות שלך.</p>';
          (anchor.closest("div")||anchor).insertAdjacentElement("afterend",box);
        };
        addStay("vol-available-until");addStay("profile-available-until");

        const addCoverage=(startId,closeId)=>{const start=document.getElementById(startId),close=document.getElementById(closeId);if(!start||!close||document.getElementById(startId+"-coverage-ui"))return;const box=document.createElement("div");box.id=startId+"-coverage-ui";box.className="mt-3 p-3 border rounded-lg";box.innerHTML='<div class="font-semibold mb-2">מתי תרצו שיהיו משמחים באירוע?</div><p class="text-sm mb-2">השעות שבחרתם למעלה הן טווח הכיסוי המבוקש.</p><div class="font-semibold mt-3 mb-2">כמה משמחים תרצו שיהיו לאורך הזמן הזה?</div><p class="text-sm opacity-70">הכמות לגברים ולנשים נקבעת בשדות הכמות בטופס. המערכת תתאם את זמני ההגעה בין המשמחים כדי לשמור ככל האפשר על הכמות שביקשתם לאורך כל טווח השעות. המשמחים עשויים להתחלף במהלך הזמן.</p>';(close.closest("div")||close).insertAdjacentElement("afterend",box);};
        addCoverage("ev-start","ev-close");addCoverage("edit-ev-start","edit-ev-close");
      },{once:true});
    } catch (_) {}
  } catch (_) {document.documentElement.style.display="none";}
})();