window.addEventListener('DOMContentLoaded', () => {
  GameState.load();
  UI.render();

  // รับ idle reward เล็กน้อยหลังเปิดเกม ถ้าปิดไว้นาน
  const p = GameState.idlePreview();
  if(p.minutes >= 30){
    UI.toast(`มี Idle Reward รอรับ ${p.minutes} นาที`);
  }

  if('serviceWorker' in navigator){
    navigator.serviceWorker.register('service-worker.js').catch(()=>{});
  }
});
