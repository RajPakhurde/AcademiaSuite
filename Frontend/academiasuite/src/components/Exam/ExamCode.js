import React, { useState, useEffect } from 'react';
import '../../assets/styles/form.css';
import '../../assets/styles/examcode.css';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer, toast } from 'react-toastify';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import { Modal, Button } from 'antd';

const ExamCode = () => {
  const [year, setYear] = useState('');
  const [branch, setBranch] = useState('');
  const [pattern, setPattern] = useState('');
  const [semester, setSemester] = useState('');
  const [subjects, setSubjects] = useState(['Select subject', 'subject 1', 'subject 2']);
  const [exams, setExams] = useState(['Select exam', 'exam 1', 'exam 2']);
  const [subject, setSubject] = useState('');
  const [exam, setExam] = useState([]);

  const [examType, setExamType] = useState('');

  const [heldInYear, setHeldYear] = useState('');
  const [heldInMonth, setHeldMonth] = useState('');
  const [editHeldInYear, setEditHeldYear] = useState('');
  const [editHeldInMonth, setEditHeldMonth] = useState('');
  const [editExamId, setEditExamId] = useState('');

  const [examDefineDiv, setExamDefineDiv] = useState(true);
  const [status, setStatus] = useState(false);
  const [addResDiv, setAddResDiv] = useState(false);
  const [resMarks, setResMarks] = useState(false);

  const years = ['Select year', '01/June 2011-31/May/2012', '01/June 2012-31/May/2013', '01/June 2013-31/May/2014'];
  const patterns = ['Select pattern', 'CBGS', 'Old Pattern'];
  const semesters = ['Select semester', 'Semester 1', 'Semester 2', 'Semester 3', 'Semester 4'];
  const branches = ['Select branch', 'MECHANICAL ENGINEERING', 'COMPUTER ENGINEERING', 'CIVIL ENGINEERING'];
  const heldYear = ['Select year','2021','2022','2023','2024','2025','2026','2027','2028','2029','2030'];
  const heldMonth = ['Select month','January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October','November', 'December'];

  const [isModalVisible, setIsModalVisible] = useState(false);

  const showModal = () => {
    setIsModalVisible(true);

  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };
  
  const handleRefreshBtn = async () => {
    setYear('');
    setBranch('');
    setHeldYear('');
    setHeldMonth('');
  }
  const handleExamwiseRefreshBtn = async () => {
    setYear('');
    setBranch('');
    setPattern('');
    setSemester('');
    setSubjects('');
    setExams('');
  }
  const handleAddRes = async () => {
    setStatus(false)
    setExamDefineDiv(false);
    setAddResDiv(true);
  }
 

  // insert data
  const handleSave = async () => {
    if(year===''|| heldInYear ===''|| heldInMonth ===''|| branch==='' || examType === '' 
        || year==='Select year'|| heldInYear ==='Select year'|| heldInMonth ==='Select month'|| branch==='Select branch' ) {
            toast.info('Fill all required input fields',{
                position:'top-right',
                autoClose: 2500,
                theme: 'colored',
                newestOnTop: true,
                pauseOnHover:false
              })
        return    
    } else {
        const data = {
            year: year,
            branch: branch,
            heldin_year: heldInYear,
            heldin_month: heldInMonth,
            type: examType
          }
          try {
            const response = await window.api.invoke('insert-in-exam-code', data);
             
            if (response === 'not found') {
              toast.success('Exam created Successfully',{
               position:'top-right',
               autoClose: 2500,
               theme: 'colored',
               newestOnTop: true,
               pauseOnHover:false
             }) 
            
             handleRefreshBtn()
            } else if (response === 'found') {
                toast.info('Exam Already Created, you can edit!',{
                    position:'top-right',
                    autoClose: 2500,
                    theme: 'colored',
                    newestOnTop: true,
                    pauseOnHover:false
                  }) 
            }
          } catch(error) {
           console.error("Error:", error.message);
          }
    }
  }

  // fetch data
  const handleStatus = async () => {
    setStatus(true);
    try {
        const response = await window.api.invoke('fetch-exam-code');
        setExam(response);
        console.log(exam);
    } catch (err) {
        console.log(err);
    }
  }

  // delete exam
  const handleDeleteExam = async (e) => {
    const exam_id = e.target.id;
    try {
        const response = await window.api.invoke('delete-exam-code', exam_id);
        if (response === true) {
            handleStatus();
            toast.success('Exam Deleted Successfully',{
                position:'top-right',
                autoClose: 2500,
                theme: 'colored',
                newestOnTop: true,
                pauseOnHover:false
              }) 
        } else {
            toast.error('Something went wrong!',{
                position:'top-right',
                autoClose: 2500,
                theme: 'colored',
                newestOnTop: true,
                pauseOnHover:false
              }) 
        }        
    } catch (err) {
        console.log(err);
    }
    
  }

  // update exam date
  const handleUpdate = async () => {
    setIsModalVisible(false);
    const data = {
        exam_id: editExamId,
        heldin_month: editHeldInMonth,
        heldin_year: editHeldInYear
    }
    try {
        const response = await window.api.invoke('update-exam-code', data);
        if (response === true) {
            handleStatus();
            toast.success('Updated Successfully',{
                position:'top-right',
                autoClose: 2500,
                theme: 'colored',
                newestOnTop: true,
                pauseOnHover:false
              }) 
        } else {
            toast.error('Something went wrong!',{
                position:'top-right',
                autoClose: 2500,
                theme: 'colored',
                newestOnTop: true,
                pauseOnHover:false
              }) 
        }        
    } catch (err) {
        console.log(err);
    }
  };
  return (
    <div className="exam-code-container">
      <ToastContainer />

        {examDefineDiv && (
            <div className='first-div'>
            <div className="form-container form-exam-code">
            <h1 className='form-title'>Exam Code</h1>
            <form className='form-main'>
                <div className="form-group">
                <label htmlFor="year">Year:</label>
                <select id="year" disabled={status} value={year} onChange={(e) => setYear(e.target.value)}>
                    {years.map((option, index) => (
                    <option key={index} value={option}>{option}</option>
                    ))}
                </select>
                </div>

                <div className="form-group">
                <label htmlFor="branch">Branch:</label>
                <select id="branch" disabled={status} value={branch} onChange={(e) => setBranch(e.target.value)}>
                    {branches.map((option, index) => (
                    <option key={index} value={option}>{option}</option>
                    ))}
                </select>
                </div>
                
                <div className="form-group heldin">
                <label htmlFor="heldin">Held In:</label>
                <div>
                    <select id="heldin" disabled={status} value={heldInYear} onChange={(e) => setHeldYear(e.target.value)}>
                        {heldYear.map((option, index) => (
                        <option key={index} value={option}>{option}</option>
                        ))}
                    </select>
                    <select id="heldin" disabled={status} value={heldInMonth} onChange={(e) => setHeldMonth(e.target.value)}>
                        {heldMonth.map((option, index) => (
                        <option key={index} value={option}>{option}</option>
                        ))}
                    </select>
                </div>
                </div>

                <div className='form-group radio-group'>
                    <div>
                        <input type='radio' id='regular-exam' name='examtype' value='Regular Exam' checked={examType === 'Regular Exam'} onChange={(e) => setExamType(e.target.value)} disabled={status}></input>
                        <label htmlFor='regular-exam'>Regular Exam</label>
                    </div>
                    <div>
                        <input type='radio' id='atkt' name='examtype' value="A.T.K.T" checked={examType === 'A.T.K.T'} onChange={(e) => setExamType(e.target.value)} disabled={status}></input>
                        <label htmlFor='atkt'>A.T.K.T</label>
                    </div>
                </div>
        
                <div className="form-buttons">
                    <button type="button" className="btn-save" onClick={handleSave}>Save</button>
                    <button type="button" className="btn-edit" onClick={handleAddRes}>Add Res</button>
                    <button type="button" className="btn-refresh" id='btn-ref-sub-mas' onClick={() => handleRefreshBtn()}>Refresh</button>
                    <button type="button" className="btn-exit" onClick={handleStatus}>Status</button>
                </div>
                </form>
            </div>
            </div>
        )}
      

        {status && (
            <div className='status-div'>
            <div className='status-div-1'>
                <table>
                    <thead>
                        <tr>
                            <th>Edit</th>
                            <th>Delete</th>
                            <th>Exam Code</th>
                            <th>Exam Date</th>
                            <th>Is Current</th>
                            <th>Is Lock</th>
                        </tr>
                    </thead>
                    <tbody >
                        {exam.map((exam, index) => {
                            return (
                                <tr key={index}>
                                    <td><EditOutlinedIcon className='cursor-pointer text-green-300' onClick={() => {
                                        showModal()
                                        setEditHeldYear(exam.heldin_year)
                                        setEditHeldMonth(exam.heldin_month)
                                        setEditExamId(exam.exam_id)
                                        }}/></td>
                                    <td><DeleteOutlineOutlinedIcon className='cursor-pointer text-rose-400' id={exam.exam_id} onClick={handleDeleteExam}/></td>
                                    <td>{`EXM${exam.exam_id}`}</td>
                                    <td className='text-left'>{`${exam.heldin_month} ${exam.heldin_year} (${exam.type.split(' ')[0]})`}</td>
                                    <td><input type='checkbox' /></td>
                                    <td><input type='checkbox' /></td>
                                </tr>
                            )
                        })}
                         
                    </tbody>
                </table>

                <div>
                    {/* <Modal title="Edit Date" open={isModalVisible} onOk={handleUpdate} onCancel={handleCancel}> */}
                    <Modal title="Edit Date" open={isModalVisible}   footer={[
                        <Button key="cancel" onClick={handleCancel}>
                            Cancel
                        </Button>,
                        <Button key="update" type="primary" onClick={handleUpdate}>
                            Update
                        </Button>
                        
                        ]} 
                        onCancel={handleCancel}
                        >
                        
                        <div className="form-group heldin">
                            <label htmlFor="heldin">Held In:</label>
                            <div>
                                <select id="heldin"  value={editHeldInYear} onChange={(e) => setEditHeldYear(e.target.value)}>
                                    {heldYear.map((option, index) => (
                                    <option key={index} value={option}>{option}</option>
                                    ))}
                                </select>
                                <select id="heldin" value={editHeldInMonth} onChange={(e) => setEditHeldMonth(e.target.value)}>
                                    {heldMonth.map((option, index) => (
                                    <option key={index} value={option}>{option}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </Modal>
                </div>
          
            </div>
            {exam.length === 0 && (
                <div className='w-full text-center'>
                    <h2 className='text-red-500 text-2xl'>Data not found!</h2>
                </div>
            )}
                <div className='btn-close-status'>
                    <button className='btn-exit ' onClick={() => {setStatus(false)}}>Exit</button>
                </div>    
        </div>
        )}

        {addResDiv && (
            <div className='first-div'>
            <div className="form-container form-exam-code">
            <h1 className='form-title'>Examwise Resolution</h1>
            <form className='form-main'>
            <div className="form-group">
                <label htmlFor="year">Year:</label>
                    <select id="year" disabled={resMarks} value={year} onChange={(e) => setYear(e.target.value)}>
                        {years.map((option, index) => (
                        <option key={index} value={option}>{option}</option>
                        ))}
                    </select>
                </div>

                <div className="form-group">
                    <label htmlFor="branch">Branch:</label>
                    <select id="branch" disabled={resMarks} value={branch} onChange={(e) => setBranch(e.target.value)}>
                        {branches.map((option, index) => (
                        <option key={index} value={option}>{option}</option>
                        ))}
                    </select>
                </div>

                <div className="form-group">
                    <label htmlFor="pattern">Pattern</label>
                    <select id="pattern" disabled={resMarks} value={pattern} onChange={(e) => setPattern(e.target.value)}>
                        {patterns.map((option, index) => (
                        <option key={index} value={option}>{option}</option>
                        ))}
                    </select>
                </div>

                <div className="form-group">
                    <label htmlFor="semester">Semester</label>
                    <select id="semester" disabled={resMarks} value={semester} onChange={(e) => setSemester(e.target.value)}>
                        {semesters.map((option, index) => (
                        <option key={index} value={option}>{option}</option>
                        ))}
                    </select>
                </div>
                
                <div className="form-group">
                    <label htmlFor="subject">Subject</label>
                    <select id="subject" disabled={resMarks} value={subject} onChange={(e) => setSubject(e.target.value)}>
                        {subjects.map((option, index) => (
                        <option key={index} value={option}>{option}</option>
                        ))}
                    </select>
                </div>
                
                <div className="form-group">
                    <label htmlFor="exam">Exam</label>
                    <select id="exam" disabled={resMarks} value={exam} onChange={(e) => setExam(e.target.value)}>
                        {exams.map((option, index) => (
                        <option key={index} value={option}>{option}</option>
                        ))}
                    </select>
                </div>

                <div className="form-buttons">
                    <button type="button" disabled={resMarks} className="btn-getdata bg-blue-300" onClick={() =>{setResMarks(true)}}>Add</button>
                    <button type="button" className="btn-refresh" id='btn-ref-sub-mas' onClick={() => handleExamwiseRefreshBtn()}>Refresh</button>
                    <button type="button" className="btn-exit" onClick={() => {
                        setResMarks(false)
                        setAddResDiv(false)
                        setExamDefineDiv(true)
                        }} >Exit</button>
                </div>
                </form>
            </div>
            </div>
        )}

        {resMarks && (
            <div className='bg-white rounded-s-md font-semibold res-marks-div'>
                <table className=''>
                    <tbody>
                        <tr className='bg-indigo-100'>
                            <td>H1 Type</td>
                            <td>H1 OutOf</td>
                            <td>H1 Pass</td>
                            <td>H1 Res</td>
                        </tr>
                        <tr>
                            <td>Ese</td>
                            <td>0</td>
                            <td>0</td>
                            <td><input type='number' className='w-20 h-full bg-orange-100 text-red-400'/></td>
                        </tr>
                        <tr className='bg-indigo-100'>
                            <td>H1 Type</td>
                            <td>H1 OutOf</td>
                            <td>H1 Pass</td>
                            <td>H1 Res</td>
                        </tr>
                        <tr>
                            <td>IA</td>
                            <td>0</td>
                            <td>0</td>
                            <td><input type='number' className='w-20 h-full bg-orange-100 text-red-400'/></td>
                        </tr>
                        <tr className='bg-indigo-100'>
                            <td>H1 Type</td>
                            <td>H1 OutOf</td>
                            <td>H1 Pass</td>
                            <td>H1 Res</td>
                        </tr>
                        <tr>
                            <td>TW</td>
                            <td>0</td>
                            <td>0</td>
                            <td><input type='number' className='w-20 h-full bg-orange-100 text-red-400'/></td>
                        </tr>
                        <tr className='bg-indigo-100'>
                            <td>H1 Type</td>
                            <td>H1 OutOf</td>
                            <td>H1 Pass</td>
                            <td>H1 Res</td>
                        </tr>
                        <tr>
                            <td>PR</td>
                            <td>0</td>
                            <td>0</td>
                            <td><input type='number' className='w-20 h-full bg-orange-100 text-red-400'/></td>
                        </tr>
                        <tr className='bg-indigo-100'>
                            <td>H1 Type</td>
                            <td>H1 OutOf</td>
                            <td>H1 Pass</td>
                            <td>H1 Res</td>
                        </tr>
                        <tr>
                            <td>OR</td>
                            <td>0</td>
                            <td>0</td>
                            <td><input type='number' className='w-20 h-full bg-orange-100 text-red-400'/></td>
                        </tr>
                    </tbody>
                </table>

                <div className='btn-res-marks'>
                    <button className='btn-save'>Save</button>
                    <button className='btn-exit ' onClick={() => {setResMarks(false)}}>Exit</button>
                </div>  
            </div>
        )}
        
      </div>
   
)}   

export default ExamCode;