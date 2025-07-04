import { auth, db } from './firebase-config.js';
import {
  collection, getDocs, query, where, updateDoc, doc
} from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js';

auth.onAuthStateChanged(async user => {
  if (!user) { location.href = 'teacher-login.html'; return; }

  const teacherId = user.uid;  // ถ้าใช้ uid เป็น docId
  const q = query(collection(db, 'bookings'), where('teacherId', '==', teacherId));
  const snap = await getDocs(q);

  const tbody = document.getElementById('bookList');
  tbody.innerHTML = '';  // เคลียร์ก่อน
  snap.forEach(d => {
    const data = d.data();
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${data.date}</td>
      <td>${data.slot}</td>
      <td>${data.studentName}</td>
      <td>${data.status}</td>
      <td>
        ${data.status === 'pending' ? `
          <button data-id="${d.id}" data-act="approved">✔</button>
          <button data-id="${d.id}" data-act="rejected">✖</button>` : ''}
      </td>`;
    tbody.appendChild(tr);
  });

  tbody.onclick = async e => {
    if (e.target.tagName !== 'BUTTON') return;
    const { id, act } = e.target.dataset;
    await updateDoc(doc(db, 'bookings', id), { status: act });
    alert('อัปเดตแล้ว');
    location.reload();
  };
});
