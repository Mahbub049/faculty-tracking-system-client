import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2'

const LateEntryForm = ({ refreshEntries }) => {
  const [facultyList, setFacultyList] = useState([]);
  const [availableCourses, setAvailableCourses] = useState([]);
  const [lastEntryId, setLastEntryId] = useState(null);


//   const handleReset = () => {
//   setForm({ faculty_id: '', course_code: '', date: '', scheduled_time: '', arrival_time: '', room: '' });
//   setAvailableCourses([]);
// };

  const [form, setForm] = useState({
    faculty_id: '',
    course_code: '',
    date: '',
    scheduled_time: '',
    arrival_time: '',
    room: ''
  });

//   const getDayFromDate = (dateStr) => {
//   const dayIndex = new Date(dateStr).getDay();
//   const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
//   return days[dayIndex];
// };


  useEffect(() => {
    axios.get('https://faculty-tracking-system-server.onrender.com/api/faculty')
      .then(res => setFacultyList(res.data))
      .catch(err => console.error(err));
  }, []);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

const handleSubmit = e => {
  e.preventDefault();
  const late_minutes = calculateLateMinutes(form.scheduled_time, form.arrival_time);

  const formData = { ...form, late_minutes }; // ✅ define it here

  axios.post('https://faculty-tracking-system-server.onrender.com/api/late-entry', formData)
    .then(res => {
Swal.fire({
  title: "Entry Recorded",
  text: "Your Entry has been Recorded!",
  icon: "success"
});
      setForm({ faculty_id: '', course_code: '', date: '', scheduled_time: '', arrival_time: '', room: '' });

      if (refreshEntries) refreshEntries(); // ✅ if this was passed from parent
    })
    .catch(err => alert("Error submitting late entry"));
};



// useEffect(() => {
//   if (form.faculty_id && form.course_code && form.date) {
//     const day = getDayFromDate(form.date);
//     axios.get(`http://localhost:5000/api/routine`, {
//       params: {
//         faculty_id: form.faculty_id,
//         course_code: form.course_code,
//         day: day
//       }
//     }).then(res => {
//       setForm(prev => ({ ...prev, scheduled_time: res.data.scheduled_time }));
//     }).catch(() => {
//       alert("No routine found for selected options");
//       setForm(prev => ({ ...prev, scheduled_time: '' }));
//     });
//   }
// }, [form.faculty_id, form.course_code, form.date]);


const calculateLateMinutes = (start, actual) => {
  const [sh, sm] = start.split(':').map(Number);
  const [ah, am] = actual.split(':').map(Number);
  const scheduled = new Date(2000, 0, 1, sh, sm);
  const arrived = new Date(2000, 0, 1, ah, am);
  const diff = (arrived - scheduled) / (1000 * 60);
  return diff > 0 ? Math.round(diff) : 0;
};

const roomOptions = [
  "CR-301", "CR-302", "CR-303", "CR-304",
  "FBS 103", "LAB1", "LAB2", "CL", "EEE"
];

// axios.post('http://localhost:5000/api/late-entry', formData)
//   .then(res => {
//     alert("Late entry recorded!");
//     setForm({ faculty_id: '', course_code: '', date: '', scheduled_time: '', arrival_time: '', room: '' });

//     if (refreshEntries) refreshEntries(); // ✅ call the refresh
//   })
//   .catch(err => alert("Error submitting late entry"));


  return (
    <div className='border border-2 rounded-md p-12'>
      <h2 className='text-2xl mb-2 text-center font-semibold'>Faculty Arrival Entry</h2>
      <hr className='mb-4'></hr>
      <form onSubmit={handleSubmit}>

<div className='grid grid-cols-2 gap-8'>

  {/* Faculty */}
  <div className='flex items-center gap-2'>
    <label className='w-40 whitespace-nowrap'>Faculty:</label>
    <select
      name="faculty_id"
      value={form.faculty_id}
      className='w-full select select-bordered'
      onChange={(e) => {
        const selectedId = e.target.value;
        const selectedFaculty = facultyList.find(f => f._id === selectedId);
        setForm({ ...form, faculty_id: selectedId, course_code: '' });
        setAvailableCourses(selectedFaculty?.courses || []);
      }}
      required
    >
      <option value="">Select Faculty</option>
      {facultyList.map(f => (
        <option key={f._id} value={f._id}>{f.name} ({f.designation})</option>
      ))}
    </select>
  </div>

  {/* Course */}
  <div className='flex items-center gap-2'>
    <label className='w-40 whitespace-nowrap'>Course:</label>
    <select
      name="course_code"
      value={form.course_code}
      className='w-full select select-bordered'
      onChange={handleChange}
      required
    >
      <option value="">Select Course</option>
      {availableCourses.map(course => (
        <option key={course} value={course}>{course}</option>
      ))}
    </select>
  </div>

  {/* Date */}
  <div className="flex items-center gap-2">
    <label htmlFor="date" className="w-40 whitespace-nowrap">Pick Date:</label>
    <input
      id="date"
      name="date"
      type="date"
      className="input input-bordered w-full focus:outline-none cursor-pointer"
      value={form.date}
      onChange={handleChange}
      required
    />
  </div>


  {/* Scheduled Time */}
  <div className='flex items-center gap-2'>
    <label className='w-40 whitespace-nowrap'>Scheduled Time:</label>
    <input
      name="scheduled_time"
      type="time"
      value={form.scheduled_time}
      onChange={handleChange}
      className='w-full input input-bordered cursor-pointer'
      required
    />
  </div>

  {/* Arrival Time */}
  <div className='flex items-center gap-2'>
    <label className='w-40 whitespace-nowrap'>Arrival Time:</label>
    <input
      name="arrival_time"
      type="time"
      value={form.arrival_time}
      onChange={handleChange}
      className='w-full input input-bordered cursor-pointer'
      required
    />
  </div>

  {/* Room */}
  <div className='flex items-center gap-2'>
    <label className='w-40 whitespace-nowrap'>Pick Room:</label>
    <select
      name="room"
      value={form.room}
      onChange={handleChange}
      className='w-full select select-bordered'
      required
    >
      <option value="">Select Room</option>
      {roomOptions.map(room => (
        <option key={room} value={room}>{room}</option>
      ))}
    </select>
  </div>

</div>


        <button className='btn btn-primary w-full mt-8' type="submit">Submit</button>
      </form>
    </div>
  );
};

export default LateEntryForm;
