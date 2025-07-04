import { db, ts } from './firebase-config.js';
import {
  collection, addDoc, getDocs, query, where
} from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js';

/* ── element refs ───────────────────────────────────────────── */
const teacherSel     = document.getElementById('teacherSelect');
const bookingDlg     = document.getElementById('bookingDialog');
const slotText       = document.getElementById('slotText');
const startTimeInput = document.getElementById('startTime');
const endTimeInput   = document.getElementById('endTime');
const cancelBtn      = document.getElementById('cancelBtn');

let selectedTeacherId = null;
let selectedDate      = null;

/* ── โหลดรายชื่อครู ─────────────────────────────────────────── */
const teachersSnap = await getDocs(collection(db, 'teachers'));
teachersSnap.forEach(doc => {
  const opt = document.createElement('option');
  opt.value = doc.id;
  opt.textContent = doc.data().name;
  teacherSel.appendChild(opt);
});
selectedTeacherId = teacherSel.value;

/* ── ปิด dialog ─────────────────────────────────────────────── */
cancelBtn.onclick = () => bookingDlg.close();

/* ── สร้างปฏิทิน ───────────────────────────────────────────── */
const cal = new FullCalendar.Calendar(document.getElementById('calendar'), {
  initialView: 'timeGridWeek',
  locale: 'th',
  nowIndicator: true,
  selectable: true,
  slotDuration: '00:30:00',
  selectOverlap: false,

  select: info => {
    selectedDate = info.start;   // จำเฉพาะวันที่ (Y-M-D)
    // เติมค่า default ใน time-picker
    startTimeInput.value = info.start.toISOString().slice(11,16);
    endTimeInput.value   = info.end.toISOString().slice(11,16);
    slotText.textContent =
      `วันที่ ${info.start.toLocaleDateString('th-TH')}`;
    bookingDlg.showModal();
  },

  // ✅ [แก้ไข] ส่วนที่ดึงข้อมูล Event มาแสดงบนปฏิทิน
  events: async fetchInfo => {
    if (!selectedTeacherId) return [];
    const q = query(
      collection(db, 'bookings'),
      where('teacherId', '==', selectedTeacherId),
      where('date', '>=', fetchInfo.startStr),
      where('date', '<=', fetchInfo.endStr)
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => {
      const data = d.data();
      const [st, et] = data.slot.split('-');
      
      // กำหนด title และ color ตาม status
      let title = 'รออนุมัติ';
      let color = '#f77f00'; // สีส้มสำหรับ pending

      if (data.status === 'approved') {
        title = `จองโดย: ${data.studentName}`; // แสดงชื่อผู้จองเมื่ออนุมัติแล้ว
        color = '#38b000'; // สีเขียว
      } else if (data.status === 'rejected') {
        title = 'การจองถูกปฏิเสธ';
        color = '#ccc'; // สีเทา
      }

      return {
        id: d.id,
        title: title,
        start: `${data.date}T${st}`,
        end:   `${data.date}T${et}`,
        color: color,
        extendedProps: { // เก็บข้อมูลเพิ่มเติมเผื่อใช้ในอนาคต
          status: data.status,
          studentName: data.studentName,
          notes: data.notes
        }
      };
    });
  }
});
cal.render();

/* ── บันทึกจอง ─────────────────────────────────────────────── */
document.getElementById('bookingForm').addEventListener('submit', async e => {
  e.preventDefault();

  /* validation เวลา */
  if (startTimeInput.value >= endTimeInput.value) {
    alert('เวลาเริ่มต้นต้องก่อนเวลาสิ้นสุด'); return;
  }

  const dateStr = selectedDate.toISOString().slice(0,10);
  const slot    = `${startTimeInput.value}-${endTimeInput.value}`;

  try {
    await addDoc(collection(db, 'bookings'), {
      teacherId: selectedTeacherId,
      date: dateStr,
      slot,
      studentName: document.getElementById('studentName').value.trim(),
      notes:       document.getElementById('notes').value,
      status:      'pending',
      createdAt:   ts()
    });
    bookingDlg.close();
    cal.refetchEvents();
    alert('ส่งคำขอแล้ว รอครูอนุมัติ');
  } catch (err) {
    console.error(err);
    alert('บันทึกไม่สำเร็จ');
  }
});

/* ── เปลี่ยนครู → โหลด event ใหม่ ─────────────────────────── */
teacherSel.addEventListener('change', () => {
  selectedTeacherId = teacherSel.value;
  cal.refetchEvents();
});