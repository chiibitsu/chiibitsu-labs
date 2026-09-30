// Night starts at 18:00 and ends at 06:00 on the reader's own clock. No location is read or asked for.
export const NIGHT_START = 18;
export const NIGHT_END = 6;

// ?theme=day|night is a QA override. ?for=companies|solo picks the audience.
// Runs before first paint so neither theme nor audience flashes.
export const bootScript = `(function(){try{var d=document.documentElement,q=new URLSearchParams(location.search),t=q.get("theme"),h=new Date().getHours();var n=t?t==="night":(h>=${NIGHT_START}||h<${NIGHT_END});d.setAttribute("data-theme",n?"night":"day");d.setAttribute("data-js","1");d.setAttribute("data-aud",q.get("for")==="solo"?"solo":"companies")}catch(e){}})();`;
