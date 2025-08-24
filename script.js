"use strict";

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('bookingForm');
  const resultEl = document.getElementById('result');

  const RATES = {
    taxi: 250, // THB per hour
    executive: 450,
    van: 400,
  };

  function loadBookings() {
    try {
      const raw = localStorage.getItem('bookings');
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      console.error('Failed to load bookings', e);
      return [];
    }
  }

  function saveBookings(list) {
    localStorage.setItem('bookings', JSON.stringify(list));
  }

  function generateId() {
    return 'BKG-' + Date.now().toString(36) + '-' + Math.floor(Math.random() * 900 + 100);
  }

  function validate(data) {
    const errors = [];
    if (!data.customer_name.trim()) errors.push('ชื่อต้องไม่ว่าง');
    if (!/^0\d{8,9}$/.test(data.customer_phone.trim())) errors.push('รูปแบบเบอร์โทรไม่ถูกต้อง (เริ่มด้วย 0, 9-10 หลัก)');
    if (!data.pickup_address.trim()) errors.push('จุดรับต้องไม่ว่าง');
    if (!data.dropoff_address.trim()) errors.push('จุดส่งต้องไม่ว่าง');
    if (!data.pickup_datetime) errors.push('กรุณาเลือกวันเวลา');
    if (!data.duration_hours || data.duration_hours <= 0) errors.push('จำนวนชั่วโมงต้องมากกว่า 0');
    if (!['taxi','executive','van'].includes(data.vehicle_type)) errors.push('ประเภทรถไม่ถูกต้อง');
    return errors;
  }

  function calcPrice(duration, vehicleType) {
    const rate = RATES[vehicleType] || 0;
    return duration * rate;
  }

  function formatBooking(b) {
    return `รหัส: ${b.id}\nชื่อ: ${b.customer_name}\nโทร: ${b.customer_phone}\nรับ: ${b.pickup_address}\nส่ง: ${b.dropoff_address}\nเวลา: ${b.pickup_datetime}\nชั่วโมง: ${b.duration_hours}\nรถ: ${b.vehicle_type}\nหมายเหตุ: ${b.notes || '-'}\nราคารวม: ${b.price} บาท`;
  }

  function render() {
    const bookings = loadBookings();
    if (bookings.length === 0) {
      resultEl.innerText = 'ยังไม่มีการจอง';
      return;
    }

    // Show latest booking first
    const latest = bookings[bookings.length - 1];
    let out = '--- การจองล่าสุด ---\n';
    out += formatBooking(latest) + '\n\n';

    out += '--- ประวัติการจองทั้งหมด ---\n';
    bookings.slice().reverse().forEach(b => {
      out += formatBooking(b) + '\n--------------------\n';
    });

    resultEl.innerText = out;
  }

  form.addEventListener('submit', (ev) => {
    ev.preventDefault();
    const fd = new FormData(form);
    const data = {
      customer_name: (fd.get('customer_name') || '').toString(),
      customer_phone: (fd.get('customer_phone') || '').toString(),
      pickup_address: (fd.get('pickup_address') || '').toString(),
      dropoff_address: (fd.get('dropoff_address') || '').toString(),
      pickup_datetime: (fd.get('pickup_datetime') || '').toString(),
      duration_hours: Number(fd.get('duration_hours') || 0),
      vehicle_type: (fd.get('vehicle_type') || 'taxi').toString(),
      notes: (fd.get('notes') || '').toString(),
    };

    const errors = validate(data);
    if (errors.length) {
      resultEl.innerText = 'พบปัญหาในการกรอกข้อมูล:\n' + errors.join('\n');
      return;
    }

    data.id = generateId();
    data.created_at = new Date().toISOString();
    data.price = calcPrice(data.duration_hours, data.vehicle_type);

    const bookings = loadBookings();
    bookings.push(data);
    saveBookings(bookings);

    render();
    form.reset();
  });

  // Initial render on page load
  render();
});
