const fs = require('fs');
const path = require('path');
const Student = require('../models/StudentSchema'); // ensure filename matches your model

function normalizeStudent(doc) {
  if (!doc) return doc;
  // If it's a Mongoose document, convert to plain object
  const obj = typeof doc.toObject === 'function' ? doc.toObject() : { ...doc };
  // Normalize CGPA/cgpa field
  obj.cgpa = obj.cgpa ?? obj.CGPA ?? obj.Cgpa ?? null;
  return obj;
}

// Create a student
exports.createStudent = async (req, res) => {
  try {
    const student = new Student(req.body);
    await student.save();
    res.status(201).json(student);
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: error.message });
  }
};

exports.getStudents = async (req, res) => {
  try {
    let students = await Student.find();
    if (!students || students.length === 0) {
      // fallback to local JSON for development
      const file = path.join(__dirname, '..', 'students.json');
      if (fs.existsSync(file)) {
        const raw = fs.readFileSync(file, 'utf8');
        students = JSON.parse(raw);
      }
    }
    // normalize
    const out = (students || []).map(normalizeStudent);
    res.json(out);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

exports.updateStudent = async (req, res) => {
  try {
    const student = await Student.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!student) return res.status(404).json({ message: 'Student not found' });
    res.json(student);
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: error.message });
  }
};

exports.deleteStudent = async (req, res) => {
  try {
    const student = await Student.findByIdAndDelete(req.params.id);
    if (!student) return res.status(404).json({ message: 'Student not found' });
    res.json({ message: 'Student deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};
