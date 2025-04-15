import React, { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  CircularProgress,
  Tabs,
  Tab,
  Box,
  Typography,
} from '@mui/material';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const MarksReport = () => {
  const [examId, setExamId] = useState('');
  const [subject, setSubject] = useState('');
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [examList, setExamList] = useState([]);
  const [subjectList, setSubjectList] = useState([]);
  const [reportType, setReportType] = useState('subject');

  useEffect(() => {
    fetchExamList();
  }, []);

  useEffect(() => {
    console.log('Report type:', reportType);
  }, [reportType]);
  
  // Fetch subjects when exam is selected
  useEffect(() => {
    if (examId) {
      fetchSubjectList();
    } else {
      setSubjectList([]);
      setSubject('');
    }
  }, [examId]);

  

  const fetchExamList = async () => {
    try {
      const response = await window.api.invoke('fetch-exam-code');
      console.log('Fetched exam list:', response);
      setExamList([{ exam_id: '', year: '', branch: '', heldin_year: 'Select exam', heldin_month: '', type: '' }, ...response]);
    } catch (error) {
      console.error('Error fetching exam list:', error);
    }
  };

  const fetchSubjectList = async () => {
    try {
      console.log('Fetching subjects for exam_id:', examId);
      const subjects = await window.api.invoke('fetch-subjects-by-exam', examId);
      
      if (subjects && subjects.length > 0) {
        setSubjectList([{ subject: 'Select subject' }, ...subjects]);
      } else {
        setSubjectList([{ subject: 'No subjects found' }]);
      }
      setSubject('');
    } catch (error) {
      console.error('Error fetching subjects:', error);
      setSubjectList([{ subject: 'Error loading subjects' }]);
    }
  };

  const handleGenerateReport = async () => {
    setLoading(true);
    try {
      console.log('Starting report generation...');
      console.log('Report Type:', reportType);
      console.log('Exam ID:', examId);
      console.log('Subject:', subject);
      
      // Debug check marks table
      console.log('Checking marks table data...');
      const debugData = await window.api.invoke('debug-check-marks', examId);
      console.log('Debug data from marks table:', debugData);
      
      let response;
      if (reportType === 'subject') {
        console.log('Generating subject-wise report with params:', { examId, subjectName: subject });
        response = await window.api.invoke('generate-subject-report', { 
          examId, 
          subjectName: subject 
        });
      } else {
        console.log('Generating complete report with params:', { examId });
        response = await window.api.invoke('generate-complete-report', { 
          examId 
        });
      }
      console.log('Report generation response:', response);
      setReportData(response);
    } catch (error) {
      console.error('Error generating report:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = async () => {
    try {
      const result = await window.api.invoke('export-report-pdf', {
        examId,
        subjectName: subject,
        reportType,
        data: reportData
      });
      
      if (result.success) {
        toast.success('PDF report has been downloaded successfully!', {
          position: 'top-right',
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      }
    } catch (error) {
      console.error('Error exporting PDF:', error);
      toast.error('Failed to generate PDF report. Please try again.', {
        position: 'top-right',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
  };

  const handleExportExcel = async () => {
    try {
      const result = await window.api.invoke('export-report-excel', {
        examId,
        subjectName: subject,
        reportType,
        data: reportData
      });
      
      if (result.success) {
        toast.success('Excel report has been downloaded successfully!', {
          position: 'top-right',
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      }
    } catch (error) {
      console.error('Error exporting Excel:', error);
      toast.error('Failed to generate Excel report. Please try again.', {
        position: 'top-right',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
  };

  return (
    <div className="p-6">
      <ToastContainer />
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Marks Report Generation</h1>
        {reportData && (
          <div className="flex gap-3">
            <Button
              variant="outlined"
              startIcon={<FileDownloadIcon />}
              onClick={handleExportPDF}
            >
              Export PDF
            </Button>
            <Button
              variant="outlined"
              startIcon={<FileDownloadIcon />}
              onClick={handleExportExcel}
            >
              Export Excel
            </Button>
          </div>
        )}
      </div>
      
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <Tabs
          value={reportType}
          onChange={(e, newValue) => setReportType(newValue)}
          className="mb-6"
        >
          <Tab value="subject" label="Subject-wise Report" />
          <Tab value="complete" label="Complete Report" />
        </Tabs>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <FormControl fullWidth>
            <InputLabel>Exam ID</InputLabel>
            <Select
              value={examId}
              label="Exam ID"
              onChange={(e) => {
                console.log('Selected exam:', e.target.value);
                setExamId(e.target.value);
              }}
            >
              {examList && examList.map((exam) => (
                <MenuItem key={exam.exam_id} value={exam.exam_id}>
                  {exam.exam_id ? `${exam.branch.slice(0,4)} ${exam.heldin_month} ${exam.heldin_year} (${exam.type.split(' ')[0]})` : 'Select exam'}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {reportType === 'subject' && (
            <FormControl fullWidth>
              <InputLabel>Subject</InputLabel>
              <Select
                value={subject}
                label="Subject"
                onChange={(e) => {
                  console.log('Selected subject:', e.target.value);
                  setSubject(e.target.value);
                }}
                disabled={!examId}
              >
                {subjectList.map((sub, index) => (
                  <MenuItem key={index} value={sub.subject}>
                    {sub.subject}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
        </div>

        <Button
          variant="contained"
          onClick={handleGenerateReport}
          disabled={!examId || loading || (reportType === 'subject' && !subject)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {loading ? (
            <>
              <CircularProgress size={20} color="inherit" className="mr-2" />
              Generating Report...
            </>
          ) : (
            'Generate Report'
          )}
        </Button>
      </div>

      {reportData && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            {reportType === 'subject' 
              ? `Report Results - ${subject === 'all' ? 'All Subjects' : subjectList.find(s => s.subject === subject)?.subject}`
              : 'Complete Report Results'
            }
          </h2>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Student Name</TableCell>
                  <TableCell>Subject</TableCell>
                  <TableCell>Credit</TableCell>
                  <TableCell>ESE Marks</TableCell>
                  <TableCell>IA Marks</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {reportData.length > 0 ? (
                  reportData.map((row, index) => (
                    <TableRow key={index}>
                      <TableCell>{row.student_name || 'Unknown'}</TableCell>
                      <TableCell>{row.subject}</TableCell>
                      <TableCell>{row.credit}</TableCell>
                      <TableCell>{row.ese_marks}</TableCell>
                      <TableCell>{row.ia_marks}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      No data available
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </div>
      )}
    </div>
  );
};

export default MarksReport;
