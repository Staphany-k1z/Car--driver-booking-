function calculatePrice(vehicleType, durationHours, pickup, dropoff) {
  let baseRate = 0;
  if (vehicleType === "taxi") baseRate = 300;
  else if (vehicleType === "executive") baseRate = 500;
  else if (vehicleType === "van") baseRate = 700;

  let price = baseRate * durationHours;

  // ถ้าอยู่นอกพัทยา คิดเพิ่ม (แบบง่าย ใช้เช็ค string)
  const pattayaKeywords = ["พัทยา", "Pattaya"];
  const inPattaya =
    pattayaKeywords.some(k => pickup.includes(k)) ||
    pattayaKeywords.some(k => dropoff.includes(k));

  if (!inPattaya) {
    price += 500; // ค่าบริการนอกเขต
  }

  return price;
}
const price = calculatePrice(vehicle_type, duration_hours, pickup_address, dropoff_address);
const stmt = db.prepare(`
  INSERT INTO bookings
  (customer_name, customer_phone, pickup_address, dropoff_address,
   pickup_datetime, duration_hours, vehicle_type, notes, status, driver_id, created_at, price)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending', NULL, datetime('now'), ?)
`);
const info = stmt.run(customer_name, customer_phone, pickup_address, dropoff_address,
  pickup_datetime, duration_hours, vehicle_type, notes || null, price);
