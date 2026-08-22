import {loadState} from "./state.js";
import {GameUI} from "./ui.js";

function boot(){
  const root=document.getElementById("aether-app");if(!root)return;
  try{
    const state=loadState(),ui=new GameUI(root,state);window.echoesOfAether={state,ui,version:"0.8.0"};
  }catch(error){
    console.error("Echoes of Aether boot failed",error);
    root.innerHTML=`<div style="min-height:100%;display:grid;place-items:center;padding:24px;background:#080b16;color:white;font-family:system-ui"><div style="max-width:380px;padding:20px;border:1px solid #ffffff22;border-radius:16px;background:#11182c"><h1 style="font:700 22px Georgia,serif">The Aether flickered.</h1><p style="color:#adb7d4;font-size:13px;line-height:1.5">The game could not finish loading. Refresh once; if this remains, open Tester Tools after restoring the previous save.</p><code style="font-size:10px;color:#ff9fb0">${String(error.message||error)}</code></div></div>`;
  }
}

document.addEventListener("contextmenu",event=>{if(event.target.closest?.("#aether-app"))event.preventDefault()},{capture:true});
document.addEventListener("selectstart",event=>{if(event.target.closest?.("#aether-app")&&!event.target.closest?.("input,textarea,select,[contenteditable=true]"))event.preventDefault()},{capture:true});
document.addEventListener("dragstart",event=>{if(event.target.closest?.("#aether-app"))event.preventDefault()},{capture:true});
let lastTouchEnd=0;document.addEventListener("touchend",event=>{const time=Date.now();if(time-lastTouchEnd<=320)event.preventDefault();lastTouchEnd=time},{passive:false});

if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot,{once:true});else boot();

if("serviceWorker" in navigator&&location.protocol.startsWith("http")){
  window.addEventListener("load",()=>navigator.serviceWorker.register(new URL("../sw.js",import.meta.url),{scope:"./"}).catch(error=>console.info("Offline cache unavailable",error)));
}
