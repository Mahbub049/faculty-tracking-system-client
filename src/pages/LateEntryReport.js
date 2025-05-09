import React, { useEffect, useState } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import axios from 'axios';

const LateEntryReport = ({ entries }) => {
  const [facultyList, setFacultyList] = useState([]);
  const [filters, setFilters] = useState({ faculty_id: '', month: '' });
  const [filteredEntries, setFilteredEntries] = useState([]);

  useEffect(() => {
    // Load faculty names
    axios.get('https://faculty-tracking-system-server.onrender.com/api/faculty')
      .then(res => setFacultyList(res.data));
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filters, entries]);

  const handleFilterChange = e => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const applyFilters = () => {
    let result = entries;

    if (filters.faculty_id) {
      result = result.filter(e => e.faculty_id?._id === filters.faculty_id);
    }

    if (filters.month) {
      const [year, month] = filters.month.split('-');
      result = result.filter(e => {
        const d = new Date(e.date);
        return (
          d.getFullYear().toString() === year &&
          (d.getMonth() + 1).toString().padStart(2, '0') === month
        );
      });
    }

    setFilteredEntries(result);
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Faculty Late Arrival Report", 14, 20);

    const tableColumn = ["Date", "Faculty", "Course", "Scheduled", "Arrived", "Late (min)", "Room"];
    const tableRows = filteredEntries.map(entry => ([
      entry.date,
      entry.faculty_id?.name || "",
      entry.course_code,
      entry.scheduled_time,
      entry.arrival_time,
      entry.late_minutes,
      entry.room,
    ]));

    autoTable(doc, {
      startY: 30,
      head: [tableColumn],
      body: tableRows,
    });

    doc.save("late_arrival_report.pdf");
  };

  return (
    <div className='border border-2 rounded-md p-12 mt-6'>
      <h2 className='text-2xl mb-2 text-center font-semibold'>Late Entry Report</h2>
      <hr className='mb-4'></hr>

      <div className='grid grid-cols-2 gap-8 mt-8'>
        <div className='flex gap-2 items-center'>
          <p>Faculty: </p>
          <select className='w-full' name="faculty_id" onChange={handleFilterChange}>
            <option value="">All Faculty</option>
            {facultyList.map(f => (
              <option key={f._id} value={f._id}>{f.name}</option>
            ))}
          </select>
        </div>

        <div className='flex gap-2 items-center'>
          <p>Pick Month: </p>
          <input
            type="month"
            className='w-full'
            name="month"
            value={filters.month}
            onChange={handleFilterChange}
          />
        </div>
      </div>

      <div className='grid grid-cols-2 gap-4 mt-8'>
        <button className='btn btn-primary' onClick={applyFilters}>Apply Filter</button>
        <button className='btn btn-primary' onClick={exportToPDF}>Export PDF</button>
      </div>

      <div className="overflow-x-auto mt-6">
        <table className="table" border="1" cellPadding="5">
          <thead>
            <tr>
              <th>Date</th>
              <th>Faculty</th>
              <th>Course</th>
              <th>Scheduled</th>
              <th>Arrived</th>
              <th>Late (min)</th>
              <th>Room</th>
            </tr>
          </thead>
          <tbody>
            {filteredEntries.map(entry => (
              <tr className='hover' key={entry._id}>
                <td>{entry.date}</td>
                <td>{entry.faculty_id?.name}</td>
                <td>{entry.course_code}</td>
                <td>{entry.scheduled_time}</td>
                <td>{entry.arrival_time}</td>
                <td>{entry.late_minutes}</td>
                <td>{entry.room}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LateEntryReport;
