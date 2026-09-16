(() => {
  "use strict";
  try {
    if (window.top !== window.self) {
      document.documentElement.style.display = "none";
      try { window.top.location = window.self.location.href; } catch (_) {}
      return;
    }
    Object.defineProperty(window, "__SMACHIM_TOP_LEVEL__", {
      value: true,
      configurable: false,
      enumerable: false,
      writable: false
    });

    // Public visual settings only. No account, phone, address, session or other personal data is stored here.
    try {
      const cached = JSON.parse(localStorage.getItem("smachimPublicAppearanceV2") || "null");
      const d = cached?.design || {};
      const bounded = (v,fallback,min,max) => {
        const n=Number(v);
        return Number.isFinite(n) ? Math.max(min,Math.min(max,Math.round(n))) : fallback;
      };
      const logoDesktop=bounded(d.logo_width_desktop,380,220,700);
      const logoMobile=bounded(d.logo_width_mobile,220,140,320);
      const requestedDesktop=bounded(d.header_height_desktop,112,72,340);
      const requestedMobile=bounded(d.header_height_mobile,52,48,180);
      const ratio=2048/938;
      const effectiveDesktop=Math.max(requestedDesktop,Math.ceil(logoDesktop/ratio)+2);
      const effectiveMobile=Math.max(requestedMobile,Math.ceil(Math.min(logoMobile,window.innerWidth*0.64)/ratio)+2);
      const heroDesktop=bounded(d.hero_height_desktop,0,0,700);
      const heroMobile=bounded(d.hero_height_mobile,0,0,420);
      const root=document.documentElement;

      root.style.setProperty("--site-logo-width-desktop",logoDesktop+"px");
      root.style.setProperty("--site-logo-width-mobile",logoMobile+"px");
      root.style.setProperty("--site-header-height-desktop",effectiveDesktop+"px");
      root.style.setProperty("--site-header-height-mobile",effectiveMobile+"px");
      root.style.setProperty("--site-hero-height-desktop",heroDesktop?heroDesktop+"px":"auto");
      root.style.setProperty("--site-hero-img-height-desktop",heroDesktop?"100%":"auto");
      root.style.setProperty("--site-hero-fit-desktop",heroDesktop?"cover":"contain");
      root.style.setProperty("--site-hero-overflow-desktop",heroDesktop?"hidden":"visible");
      root.style.setProperty("--site-hero-height-mobile",heroMobile?heroMobile+"px":"auto");
      root.style.setProperty("--site-hero-img-height-mobile",heroMobile?"100%":"auto");
      root.style.setProperty("--site-hero-fit-mobile",heroMobile?"cover":"contain");
      root.style.setProperty("--site-hero-overflow-mobile",heroMobile?"hidden":"visible");
      root.style.setProperty("--site-button-font-size",(bounded(d.button_font_percent,100,85,130)/100)+"rem");
      root.style.setProperty("--site-button-radius",bounded(d.button_radius_px,8,0,24)+"px");
      root.style.setProperty("--site-card-radius",bounded(d.card_radius_px,16,6,30)+"px");
      root.style.setProperty("--site-home-gap",bounded(d.home_section_gap_px,24,0,120)+"px");

      document.addEventListener("DOMContentLoaded",()=>{
        const versioned=(url,fallback)=>{
          const value=url||fallback;
          return value.startsWith("./assets/") ? value.split("?")[0]+"?v=20260916-visualfix2" : value;
        };
        const logo=document.getElementById("site-logo-img");
        const hero=document.getElementById("home-hero-img");
        if(logo&&cached?.logo_url) logo.src=versioned(cached.logo_url,"./assets/site-title.jpg");
        if(hero&&cached?.hero_url) hero.src=versioned(cached.hero_url,"./assets/hero-banner.jpg");
      },{once:true});
    } catch (_) {}
  } catch (_) {
    document.documentElement.style.display = "none";
  }
})();