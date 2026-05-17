window.addEventListener('DOMContentLoaded', () => {
  GameState.load();
  UI.render();

  // เปิด sidebar อัตโนมัติครั้งแรกถ้าต้องการ (ไม่เปิด默认)
  // UI.openSidebar();
  // รับ idle reward เล็กน้อยหลังเปิดเกม ถ้าปิดไว้นาน
  const p = GameState.idlePreview();
  if(p.minutes >= 30){
    UI.toast(`มี Idle Reward รอรับ ${p.minutes} นาที`);
  }

  if('serviceWorker' in navigator){
    navigator.serviceWorker.register('service-worker.js').catch(()=>{});
  }
});
