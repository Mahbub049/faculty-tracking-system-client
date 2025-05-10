import React, { useEffect, useState } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import axios from 'axios';
import { MdDelete } from "react-icons/md";
import { FaFileExport } from "react-icons/fa6";
import { FaFilter } from "react-icons/fa";
import Swal from 'sweetalert2';
import { RxReset } from "react-icons/rx";

const LateEntryReport = ({ entries }) => {
  const [facultyList, setFacultyList] = useState([]);
  const [filters, setFilters] = useState({ faculty_id: '', month: '' });
  const [filteredEntries, setFilteredEntries] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const entriesPerPage = 5;

  useEffect(() => {
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
    setCurrentPage(1);
  };

  const handleReset = () => {
    setFilters({ faculty_id: '', month: '' });
    setFilteredEntries(entries);
    setCurrentPage(1);
  };

  const handleDelete = (id) => {
    Swal.fire({
      title: 'Are you sure?',
      text: "This entry will be permanently deleted.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#aaa',
      confirmButtonText: 'Yes, delete it!'
    }).then(result => {
      if (result.isConfirmed) {
        axios.delete(`https://faculty-tracking-system-server.onrender.com/api/late-entry/${id}`)
          .then(() => {
            Swal.fire('Deleted!', 'Entry has been removed.', 'success');
            setFilteredEntries(prev => prev.filter(entry => entry._id !== id));
          })
          .catch(() => {
            Swal.fire('Error', 'Failed to delete entry.', 'error');
          });
      }
    });
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

  const indexOfLastEntry = currentPage * entriesPerPage;
  const indexOfFirstEntry = indexOfLastEntry - entriesPerPage;
  const currentEntries = filteredEntries.slice(indexOfFirstEntry, indexOfLastEntry);

  return (
    <div className='border border-2 rounded-md p-12 mt-6'>
      <h2 className='text-2xl mb-2 text-center font-semibold'>Late Entry Report</h2>
      <hr className='mb-4'></hr>

      <div className='grid grid-cols-2 gap-8 mt-8'>
        <div className='flex items-center gap-2'>
          <label htmlFor="faculty_id" className='w-40 whitespace-nowrap'>Faculty:</label>
          <select
            id="faculty_id"
            name="faculty_id"
            className='select select-bordered w-full cursor-pointer'
            value={filters.faculty_id}
            onChange={handleFilterChange}
          >
            <option value="">All Faculty</option>
            {facultyList.map(f => (
              <option key={f._id} value={f._id}>{f.name}</option>
            ))}
          </select>
        </div>

        <div className='flex items-center gap-2'>
          <label htmlFor="month" className='w-40 whitespace-nowrap'>Pick Month:</label>
          <input
            id="month"
            name="month"
            type="month"
            className='input input-bordered w-full cursor-pointer'
            value={filters.month}
            onChange={handleFilterChange}
          />
        </div>
      </div>

      <div className='grid grid-cols-3 gap-4 mt-8'>
        <button className='btn btn-primary' onClick={applyFilters}><FaFilter /> Apply Filter</button>
        <button className='btn btn-success' onClick={exportToPDF}><FaFileExport />Export PDF</button>
        <button className='btn bg-blue-300 hover:bg-blue-200' onClick={handleReset}><RxReset />Reset</button>
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
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {currentEntries.map(entry => (
              <tr className='hover' key={entry._id}>
                <td>{entry.date}</td>
                <td>{entry.faculty_id?.name}</td>
                <td>{entry.course_code}</td>
                <td>{entry.scheduled_time}</td>
                <td>{entry.arrival_time}</td>
                <td>{entry.late_minutes}</td>
                <td>{entry.room}</td>
                <td>
                  <button
                    onClick={() => handleDelete(entry._id)}
                    className="btn btn-sm btn-error text-white"
                  >
                    <MdDelete />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-center mt-4 gap-2">
        <button
          className="btn btn-sm btn-outline"
          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
        >
          Prev
        </button>
        <span className="font-medium px-4 pt-2">Page {currentPage} of {Math.ceil(filteredEntries.length / entriesPerPage)}</span>
        <button
          className="btn btn-sm btn-outline"
          onClick={() => setCurrentPage(prev =>
            prev < Math.ceil(filteredEntries.length / entriesPerPage) ? prev + 1 : prev
          )}
          disabled={currentPage >= Math.ceil(filteredEntries.length / entriesPerPage)}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default LateEntryReport;
