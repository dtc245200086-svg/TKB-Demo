const express = require('express');
const router = express.Router();
const multer = require('multer');
const XLSX = require('xlsx');
const { v4: uuidv4 } = require('uuid');
const db = require('../database');
const fs = require('fs');
const path = require('path');

const upload = multer({ dest: 'uploads/' });

// UC01 - Import data from Excel
router.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  try {
    // Read the uploaded Excel file
    const workbook = XLSX.readFile(req.file.path);
    const worksheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[worksheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);

    // Validate data
    const validationErrors = [];
    const validData = [];

    data.forEach((row, index) => {
      const errors = [];

      // Check required fields
      if (!row['Teacher Code']) errors.push('Teacher code missing');
      if (!row['Subject Code']) errors.push('Subject code missing');
      if (!row['Class Code']) errors.push('Class code missing');
      if (!row['Room Code']) errors.push('Room code missing');

      if (errors.length > 0) {
        validationErrors.push({
          row: index + 2,
          data: row,
          errors: errors
        });
      } else {
        validData.push(row);
      }
    });

    // UC02 - Preview and validate
    const preview = {
      totalRows: data.length,
      validRows: validData.length,
      errorRows: validationErrors.length,
      errors: validationErrors,
      validData: validData
    };

    // Save preview to session temporarily
    res.json({
      message: 'File validation complete',
      preview: preview,
      uploadId: uuidv4()
    });

    // Delete uploaded file
    fs.unlinkSync(req.file.path);
  } catch (err) {
    res.status(400).json({ error: 'Invalid Excel file', details: err.message });
    fs.unlinkSync(req.file.path);
  }
});

// UC01 - Smart Upsert (Insert or Update)
router.post('/commit', (req, res) => {
  const { validData, createdBy } = req.body;

  if (!validData || validData.length === 0) {
    return res.status(400).json({ error: 'No valid data to commit' });
  }

  let processedCount = 0;
  let errorCount = 0;
  const errors = [];

  validData.forEach((row) => {
    // Check for duplicates (Unique constraint)
    db.get(
      `SELECT id FROM teachers WHERE id IN (
        SELECT id FROM teachers WHERE user_id IN (
          SELECT id FROM users WHERE username = ?
        )
      )`,
      [row['Teacher Code']],
      (err, teacher) => {
        if (teacher) {
          // Update existing
          db.run(
            `UPDATE subjects SET name = ?, weekly_periods = ? 
             WHERE code = ?`,
            [row['Subject Name'], parseInt(row['Weekly Periods']) || 0, row['Subject Code']],
            (err) => {
              if (err) {
                errorCount++;
                errors.push({
                  row: row['Teacher Code'],
                  error: err.message
                });
              } else {
                processedCount++;
              }
              
              if (processedCount + errorCount === validData.length) {
                sendResponse();
              }
            }
          );
        } else {
          // Insert new
          const teacherId = uuidv4();
          const subjectId = uuidv4();

          db.run(
            `INSERT INTO subjects (id, code, name, weekly_periods, intensity_level) VALUES (?, ?, ?, ?, ?)`,
            [subjectId, row['Subject Code'], row['Subject Name'], parseInt(row['Weekly Periods']) || 0, row['Intensity'] || 'medium'],
            (err) => {
              if (err) {
                errorCount++;
                errors.push({
                  row: row['Teacher Code'],
                  error: err.message
                });
              } else {
                processedCount++;
              }

              if (processedCount + errorCount === validData.length) {
                sendResponse();
              }
            }
          );
        }
      }
    );
  });

  function sendResponse() {
    res.json({
      message: 'Data imported successfully',
      processed: processedCount,
      failed: errorCount,
      errors: errors
    });
  }
});

// Export template
router.get('/template', (req, res) => {
  const template = [
    {
      'Teacher Code': 'GV001',
      'Teacher Name': 'Nguyễn Văn A',
      'Subject Code': 'TOAN',
      'Subject Name': 'Toán học',
      'Weekly Periods': 18,
      'Intensity': 'high',
      'Class Code': '10A',
      'Class Name': 'Lớp 10A',
      'Grade': 10,
      'Total Students': 45,
      'Room Code': 'P101',
      'Room Name': 'Phòng 101',
      'Capacity': 50,
      'Room Type': 'Classroom'
    }
  ];

  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.json_to_sheet(template);
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');
  
  const fileName = `TKB_Template_${new Date().getTime()}.xlsx`;
  const filePath = path.join(__dirname, '../../uploads', fileName);
  
  XLSX.writeFile(workbook, filePath);

  res.download(filePath, fileName, (err) => {
    if (err && err.code !== 'ERR_HTTP_HEADERS_SENT') {
      console.error(err);
    }
    fs.unlink(filePath, (err) => {
      if (err) console.error(err);
    });
  });
});

module.exports = router;
