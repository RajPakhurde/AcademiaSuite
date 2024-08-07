import React, { useEffect, useState } from "react";
import "../../assets/styles/groupmaster.css";
import { ToastContainer, toast } from 'react-toastify';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Button from '@mui/material/Button';

const GroupMaster = () => {
  const [isChecked, setIsChecked] = useState(false);
  const [disableInputs, setDisableInputs] = useState(false);

  const [year, setYear] = useState("Select year");
  const [toYear, setToYear] = useState("Select toyear");
  const [fromYear, setFromYear] = useState("Select fromyear");
  const [pattern, setPattern] = useState("Select pattern");
  const [semester, setSemester] = useState("Select semester");
  const [branch, setBranch] = useState("Select branch");
  const [groupName, setGroupName] = useState("");

  const [subject, setSubject] = useState([]);
  const [noData, setNoData] = useState(true);
  const [selectedIds, setSelectedIds] = useState([]);
  const [editSelectedIds, setEditSelectedIds] = useState([]);
  const [editSubjects, setEditSubjects] = useState([]);
  const [editable, setEditable] = useState(false);
  const [editSubjectAllIds, setEditSubjectsAllIds] = useState([]);

  const [open, setOpen] = React.useState(false);

  const [groupAlreadyDefined, setGroupAlreadyDefine] = useState(false);

  const handleClickOpen = () => {
    if (year !== "Select year" && pattern !== "Select pattern" && branch !== "Select branch" && semester !== "Select semester") {
      setOpen(true);
    } else {
      toast.info('Please select all require fields!',{
        position:'top-right',
        autoClose: 2500,
        theme: 'colored',
        newestOnTop: true,
        pauseOnHover:false
      })
    }
  };

  const handleClose = () => {
    setOpen(false);
  };

  useEffect(() => {
    const hasGroup = subject.some(subject => subject.subject_group !== null);
    if (hasGroup) {
      setGroupAlreadyDefine(true);
    } else {
      setGroupAlreadyDefine(false);
    }
  }, [subject]);
   
  useEffect(() => {
    if(!isChecked) {
      handleRefreshBtn()
    }
  }, [isChecked])

  const years = [
    "Select year",
    "01/June 2011-31/May/2012",
    "01/June 2012-31/May/2013",
    "01/June 2013-31/May/2014",
  ];
  const patterns = ["Select pattern","CBGS", "Old Pattern"]; 
  const semesters = [
    "Select semester",
    "Semester 1",
    "Semester 2",
    "Semester 3",
    "Semester 4",
  ];
  const branches = [
    "select branch",
    "COMPUTER ENGINEERING",
    "MECHANICAL ENGINEERING",
    "CIVIL ENGINEERING",
    "ELECTRICAL ENGINEERING",
  ];

  const handleRefreshBtn = () => {
    setYear("");
    setPattern("");
    setSemester("");
    setBranch("");
    setGroupName("");
    setToYear("");
    setFromYear("");
  };

  const handleCheckbox = (e) => {
    setIsChecked(e.target.checked);
    console.log(isChecked);
  };

  const fetchData = async () => {
    const data = {
      year: year,
      pattern: pattern,
      branch: branch,
      semester: semester,
    }
    const response = await window.api.invoke('fetch-subject-name-id', data);
    if (response.length !== 0) {
      setNoData(false)
      setSubject(response);
      setEditable(false)
      setEditSubjectsAllIds([])
      if (isChecked) {
        fetchEditData()
      }
    } else {
      setGroupName("")
      setSubject(response);
      setNoData(true)
      setEditable(false)
    }
  };

  useEffect(() => {
    if (year !== "Select year" && pattern !== "Select pattern" && branch !== "Select branch" && semester !== "Select semester") {
      fetchData();
    } 
  }, [year, pattern, branch, semester])

  const fetchtoYearData = async () => {
    const dataFortoYear = {
      year: toYear,
      pattern: pattern,
      branch: branch,
      semester: semester,
      subject: subject
    }
    const response = await window.api.invoke('fetch-subject-for-this-year', dataFortoYear);

    if (response === true) {
      editPreYearGroupName()
    } else {
      toast.info('Group for this year is Already Define, You can Edit',{
        position:'top-right',
        autoClose: 2500,
        theme: 'colored',
        newestOnTop: true,
        pauseOnHover:false
      })
    }
  };
   


  const updateGroupName = async () => {
    const data = {
      groupName: groupName,
      subjectIds: selectedIds
    }
    console.log(data.subjectIds);
    if (groupName === "") {
      toast.error('Enter group name!',{
        position:'top-right',
        autoClose: 2500,
        theme: 'colored',
        newestOnTop: true,
        pauseOnHover:false
      })
      return;
    }
    if (selectedIds.length === 0) {
      toast.error('Select at list one subject!',{
        position:'top-right',
        autoClose: 2500,
        theme: 'colored',
        newestOnTop: true,
        pauseOnHover:false
      })
      return;
    }
    const response = await window.api.invoke('update-subject-group-name', data);
   
    if (response === true) {
      toast.success('Group Created Successfully',{
        position:'top-right',
        autoClose: 2500,
        theme: 'colored',
        newestOnTop: true,
        pauseOnHover:false
      })
      handleRefreshBtn()
    } else if (response === "GNAE") {
      toast.info('Group name already exist',{
        position:'top-right',
        autoClose: 2500,
        theme: 'colored',
        newestOnTop: true,
        pauseOnHover:false
      })
    } else if (response === "ISNNMG") {
      toast.error('This subjects already in other group',{
        position:'top-right',
        autoClose: 2500,
        theme: 'colored',
        newestOnTop: true,
        pauseOnHover:false
      })
    }
  }
  const editGroupName = async () => {
    const data = {
      groupName: groupName,
      subjectIds: editSelectedIds,
      allSubjectIds: editSubjectAllIds
    }
   
    if (editSelectedIds.length === 0) {
      toast.error('Select at list one subject!',{
        position:'top-right',
        autoClose: 2500,
        theme: 'colored',
        newestOnTop: true,
        pauseOnHover:false
      })
      return;
    }
 

    const response = await window.api.invoke('edit-subject-group-name', data);
   
    if (response === true) {
      toast.success('Updated Successfully',{
        position:'top-right',
        autoClose: 2500,
        theme: 'colored',
        newestOnTop: true,
        pauseOnHover:false
      })
      setEditSelectedIds("");
      handleRefreshBtn()
    } else {
      toast.error('Something went wrong!',{
        position:'top-right',
        autoClose: 2500,
        theme: 'colored',
        newestOnTop: true,
        pauseOnHover:false
      })
    }
 
  }

  const editPreYearGroupName = async () => {
    if (toYear === fromYear) {
      toast.error('Toyear and FromYear is equal',{
        position:'top-right',
        autoClose: 2500,
        theme: 'colored',
        newestOnTop: true,
        pauseOnHover:false
      })
      return
    }
    const data = {
      groupName: groupName,
      selectedIds: editSelectedIds,
      toYear: toYear,
      fromYear: fromYear,
      semester: semester,
      branch: branch,
      pattern: pattern
    }
   
    if (editSelectedIds.length === 0) {
      toast.error('Select at list one subject!',{
        position:'top-right',
        autoClose: 2500,
        theme: 'colored',
        newestOnTop: true,
        pauseOnHover:false
      })
      return;
    }
   try {
     const response = await window.api.invoke('add-pre-year-group', data);
     if (response === true) {
       toast.success('Group create Successfully',{
        position:'top-right',
        autoClose: 2500,
        theme: 'colored',
        newestOnTop: true,
        pauseOnHover:false
      })
      setEditSelectedIds("");
      handleRefreshBtn()
     }
   } catch(error) {
    console.error("Error:", error.message);
    // Display the error message to the user in a friendly way
    if (error.message.includes("No data found for current year")) {
      alert("No subjects are define for current year");
    } else if (error.message.includes("No data found for previous year")) {
      alert("No data found for previous year");
    } else if (error.message.includes("Data found for this year")) {
      alert("Group Already Define for this year");
    } 
     else {
      alert("An error occurred while creating the group. Please try again. Check your input fields.");
    }
   }
   
  }

  const handleCheckboxChange = (id) => {
    setSelectedIds(prevSelectedIds => {
      // If the ID is already selected, remove it; otherwise, add it
      if (prevSelectedIds.includes(id)) {
        return prevSelectedIds.filter(selectedId => selectedId !== id);
      } else {
        return [...prevSelectedIds, id];
      }
    });
  };

  const handleCheckboxChangeforEdit = (id) => {
    setEditSelectedIds(prevSelectedIds => {
      // If the ID is already selected, remove it; otherwise, add it
      if (prevSelectedIds.includes(id)) {
        return prevSelectedIds.filter(selectedId => selectedId !== id);
      } else {
        return [...prevSelectedIds, id];
      }
    });
  };

  const fetchEditData = async () => {
    setEditable(true);

    const data = {
      year: year,
      pattern: pattern,
      branch: branch,
      semester: semester,
    }
    const response = await window.api.invoke('fetch-subject-name-id', data);
 
    setEditSubjects(response);
  };
 

  useEffect(() => {
    editSubjects.map((subject, index) => {
      if (subject.subject_group !== null) {
        setGroupName(subject.subject_group)
        setEditSelectedIds(prevEditid => {
          return [...prevEditid, subject.id]
        })
      }
      setEditSubjectsAllIds(prevEditid => {
        return [...prevEditid, subject.id]
      })
    })
    
  }, [editSubjects])
 
  const deleteGroup = async () => {
    const dataFortoYear = {
      year: year,
      pattern: pattern,
      branch: branch,
      semester: semester,
      subject: subject
    }
    const response = await window.api.invoke('fetch-subject-for-this-year', dataFortoYear);

    if (response === true) {
      toast.info('Group not Define! Cant delete!',{
        position:'top-right',
        autoClose: 2500,
        theme: 'colored',
        newestOnTop: true,
        pauseOnHover:false
      })
    } else {
      const data = {
        year: year,
        branch: branch,
        pattern: pattern,
        semester: semester,
      }
      try {
        const response = await window.api.invoke('delete-group', data);
        if (response) {
          toast.success('Group deleted Successfully',{
            position:'top-right',
            autoClose: 2500,
            theme: 'colored',
            newestOnTop: true,
            pauseOnHover:false
          })
        }
      } catch(err) {
        toast.error('Something went wrong!',{
          position:'top-right',
          autoClose: 2500,
          theme: 'colored',
          newestOnTop: true,
          pauseOnHover:false
        })
      }
    }
    
  }

  useEffect(() => {
    console.log(editSelectedIds);
  }, [editSelectedIds])

  return (
    <div className="group-master-container">
      <ToastContainer />
      <div className="first-div">
        <div className="form-container form-sub-mas">
          <h1 className="form-title">Group Master</h1>
          <form className="form-main">
            <div className="form-element-appy">
              <label htmlFor="year">As per previous syllabus</label>
              <input
              disabled={editable || groupAlreadyDefined || !noData}
                type="checkbox"
                checked={isChecked}
                onChange={handleCheckbox}
              />
            </div>
            
            {isChecked && ( 
                <>
                    <div className="form-group">
                        <label htmlFor="year">To Year</label>
                        <select
                            disabled={editable || groupAlreadyDefined || !noData}
                            id="year"
                            value={toYear}
                            onChange={(e) => {
                              setToYear(e.target.value)
                            }}
                        >
                            {years.map((option, index) => (
                            <option key={index} value={option}>
                                {option}
                            </option>
                            ))}
                        </select>
                    </div>
                    <div className="form-group">
                        <label htmlFor="year">From Year</label>
                        <select
                        disabled={editable || groupAlreadyDefined || !noData}
                            id="year"
                            value={fromYear}
                            onChange={(e) => {
                              setYear(e.target.value)
                              setFromYear(e.target.value)
                            } }
                        >
                            {years.map((option, index) => (
                            <option key={index} value={option}>
                                {option}
                            </option>
                            ))}
                        </select>
                    </div> 
                 </>
                )}

            {!isChecked && (
                <div className="form-group">
                <label htmlFor="year">Year</label>
                <select
                disabled={editable || groupAlreadyDefined || !noData}
                    id="year"
                    value={year}
                    onChange={(e) => {
                      setYear(e.target.value)
                    } }
                >
                    {years.map((option, index) => {
                      return (
                        <option key={index} value={option}>
                          {option}
                        </option>
                      )
                    })}
                     
                </select>
                </div>
            )}

            <div className="form-group">
              <label htmlFor="pattern">Pattern</label>
              <select
              disabled={editable || groupAlreadyDefined || !noData}
                id="pattern"
                value={pattern}
                onChange={(e) => {
                  setPattern(e.target.value)
                }}
              >
                {patterns.map((option, index) => (
                  <option key={index} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="branch">Branch</label>
              <select
              disabled={editable || groupAlreadyDefined || !noData}
                id="branch"
                value={branch}
                onChange={(e) => {
                  setBranch(e.target.value)
                }}
              >
                {branches.map((option, index) => (
                  <option key={index} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="semester">Semester</label>
              <select
              disabled={editable || groupAlreadyDefined || !noData}
                id="semester"
                value={semester}
                onChange={(e) => {
                  setSemester(e.target.value)
                }}
              >
                {semesters.map((option, index) => (
                  <option key={index} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
            
            {isChecked && (
                <div className="form-group">
                    <label htmlFor="semester">Group name</label>
                    <select
                    disabled={editable || groupAlreadyDefined || !noData}
                        id="semester"
                        value={groupName}
                        onChange={(e) => setGroupName(e.target.value)}
                    >
                        <option>{groupName}</option>
                    </select>
                </div>
            )}
            {!isChecked && (
                <div className="form-group" style={editable ? {cursor: "not-allowed"} : {cursor: "pointer"}}>
                    <label htmlFor="semester" style={editable ? {cursor: "not-allowed"} : {cursor: "pointer"}}>Group name</label>
                    <input type="text" style={editable ? {cursor: "not-allowed"} : {cursor: "pointer"}} disabled={editable || groupAlreadyDefined } placeholder="Enter group name" value={groupName} onChange={(e) => setGroupName(e.target.value)}/>
                </div>
            )}

            <div className="form-buttons">
              <button
              disabled={editable || groupAlreadyDefined || !noData}
                type="button"
                className="btn-refresh"
                id="btn-ref-sub-mas"
                onClick={handleRefreshBtn}
              >
                Refresh
              </button>
              <button type="button" style={isChecked ? {display: 'none'} : {display: 'inline'}} className="btn-exit" onClick={() => {handleClickOpen()}}>
                Delete
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className={"sec-div fetch-subject"}>
          <table>
            <thead>
                <tr>
                    <th>Check</th>
                    <th>Subject ID</th>
                    <th>Subject Name</th>
                </tr>
            </thead>

            {!groupAlreadyDefined && !noData && (
            <tbody>
                {subject.map((subject, index) => {
                    return (
                        <tr key={index}>
                            <td><input type="checkbox" 
                              checked={selectedIds.includes(subject.id)}
                              onChange={() => handleCheckboxChange(subject.id)}/></td>
                            <td>{subject.id}</td>
                            <td>{subject.subject_name}</td>
                        </tr>
                    )
                })}
            </tbody> )}
            {editable && groupAlreadyDefined && (
            <tbody>
                {editSubjects.map((subject, index) => {
                    return (
                        <tr key={index}>
                            <td><input type="checkbox" 
                              disabled={isChecked}
                              checked={editSelectedIds.includes(subject.id)}
                              onChange={() => handleCheckboxChangeforEdit(subject.id)}/></td>
                            <td>{`SUB${subject.id}`}</td>
                            <td>{subject.subject_name}</td>
                        </tr>
                    )
                })}
            </tbody> )}

          </table>
          {noData && (
            <div className="font-bold w-full text-center text-rose-400">
              <h3>Data Not Found!</h3>
            </div>
          )}
          {groupAlreadyDefined && !editable &&(
            <div className="font-bold w-full text-center text-rose-400">
              <h3>Group for this year, pattern, branch & semester has already define!</h3>
              <h2 className="text-blue-400">You can Edit</h2>
            </div>
          )}
            <div className="btn-div ">
              {!groupAlreadyDefined && !noData && (
                 <div className="flex justify-between w-full">
                 <button type="button" className="btn-exit" onClick={() => {
                  console.log(editSelectedIds);
                  setSelectedIds("")
                   setEditSelectedIds("")
                   handleRefreshBtn()
                   console.log(editSelectedIds);
                 }}>
                     Exit
                 </button>
                <button type="button" className="btn-save w-1/3" onClick={() => {
                  updateGroupName()
                }}>
                    Create group
                </button>
                </div>
              )}
              {groupAlreadyDefined && !editable && (
                <div className="flex justify-between w-full">
                <button type="button" className="btn-exit" onClick={() => {
                  setEditSelectedIds("")
                  handleRefreshBtn()
                }}>
                    Exit
                </button>
                
                <button type="button" className="btn-edit w-1/4" onClick={() => {
                  fetchEditData()
                }}>
                    Edit
                </button>
                </div>
              )}
              {editable && !isChecked && (
                <div className="flex justify-between w-full">
                <button type="button" className="btn-exit" onClick={() => {
                  setEditSelectedIds("")
                  handleRefreshBtn()
                }}>
                    Exit
                </button>
                <button type="button" className="bg-orange-300 w-1/4" onClick={() => {
                  editGroupName()
                }}>
                    Update
                </button>
              </div>
              )}
              {editable && isChecked && (
                <div className="flex justify-between w-full">
                <button type="button" className="btn-exit" onClick={() => {
                  setEditSelectedIds("")
                  handleRefreshBtn()
                }}>
                    Exit
                </button>
                
                <button type="button" className="bg-orange-300 w-1/4" onClick={() => {
                   fetchtoYearData()
                }}>
                    Create Group
                </button>
                </div>
              )}
            </div>
      </div>

      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {"Delete Group"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
              Are you sure?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={() => {
            handleClose()
            deleteGroup()
            setEditSelectedIds("")
            handleRefreshBtn()
            }} autoFocus>
            OK
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default GroupMaster;
