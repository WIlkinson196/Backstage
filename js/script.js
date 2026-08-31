// ===== ALERTS =====
function checkAlerts(){
let count=0;
count+=DB.tasks.filter(t=>isOverdue(t.due)&&t.status!=='Completed').length;
count+=DB.enquiries.filter(e=>isOverdue(e.nextFollowup)&&!['Confirmed Booking','Lost Enquiry'].includes(e.status)).length;
count+=DB.payments.filter(p=>isOverdue(p.deadline)&&p.status!=='Paid in Full').length;
const dot=document.getElementById('notif-dot');
if(count>0)dot.classList.remove('hidden');else dot.classList.add('hidden');
}

// ===== BOOT =====
buildNav();
navigate('dashboard');

if (window.lucide) {
  window.lucide.createIcons();
}

checkLoginSession();
