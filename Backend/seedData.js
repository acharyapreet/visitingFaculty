// seedData.js – inserts a faculty user (VF001) and all dependent records
// Run with: node seedData.js

const path = require('path');

// Import Sequelize models from your schema index
const { sequelize, User, Allocation, Attendance, Bill, BillDetail } = require(path.join(__dirname, 'src', 'Schema'));

async function createSeed() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection established.');

    // 1️⃣ Faculty user – ensure idempotency
    let faculty = await User.findOne({ where: { uvfin: 'VF001' } });
    if (!faculty) {
      faculty = await User.create({
        role: 'faculty',
        email: 'vf001@example.com',
        password_hash: 'tempPass123', // placeholder – will be hashed by any model hook
        full_name: 'Faculty VF001',
        phone_number: '9876543210',
        address: 'Visiting Faculty Campus, Room 101',
        qualification: 'M.Sc. Computer Science',
        aadhaar_no: '123456789012',
        account_no: '1234567890',
        bank_name: 'Bank of India',
        ifsc_code: 'BOI0001234',
        pan_card_no: 'PANAB1234C',
        uvfin: 'VF001',
        is_approved: true,
        is_active: true
      });
      console.log('👤 Faculty user created → id:', faculty.user_id);
    } else {
      console.log(`👤 Faculty user already exists → id: ${faculty.user_id}`);
    } 

    // 2️⃣ Allocation (linking faculty to a course)
    const allocation = await Allocation.create({
      user_id: faculty.user_id,
      created_by: 1, // super‑admin seeded with id 1
      allocation_name: 'Spring 2026 – CS101',
      start_date: new Date('2026-01-10'),
      end_date: new Date('2026-05-30')
    });
    console.log('📚 Allocation created → id:', allocation.allocation_id);

    // 3️⃣ Attendance (sample entry)
    const attendance = await Attendance.create({
      user_id: faculty.user_id,
      allocation_id: allocation.allocation_id,
      attendance_date: new Date('2026-07-01'),
      status: 'present' // adjust column name if different
    });
    console.log('🗓️ Attendance created → id:', attendance.attendance_id);

    // 4️⃣ Bill (monthly bill for the faculty)
    const bill = await Bill.create({
      user_id: faculty.user_id,
      month: 7,
      year: 2026,
      total_hours: 40,
      total_amount: 4000.00,
      amount_in_words: 'Four thousand rupees only',
      bill_date: new Date('2026-07-31'),
      pdf_path: null,
      generated_at: new Date()
    });
    console.log('📄 Bill created → id:', bill.bill_id);

    // 5️⃣ BillDetails (two example line items)
    const details = [
      {
        bill_id: bill.bill_id,
        attendance_date: attendance.attendance_date,
        course_name: 'Computer Science 101',
        semester_number: 1,
        section_name: 'A',
        subject_code: 'CS101',
        subject_name: 'Intro to Programming',
        hours: 2.0,
        rate_per_hour: 100.00,
        amount: 200.00
      },
      {
        bill_id: bill.bill_id,
        attendance_date: attendance.attendance_date,
        course_name: 'Computer Science 101',
        semester_number: 1,
        section_name: 'A',
        subject_code: 'CS101',
        subject_name: 'Data Structures',
        hours: 2.0,
        rate_per_hour: 100.00,
        amount: 200.00
      }
    ];

    await BillDetail.bulkCreate(details);
    console.log('🧾 Bill details inserted (', details.length, ' rows).');

    console.log('\n✅ All seed data inserted successfully! 🎉');
    process.exit(0);
  } catch (err) {
    console.error('\n❌ Seed script failed:', err);
    process.exit(1);
  }
}

createSeed();
