const { ipcMain } = require("electron");
const bcrypt = require("bcrypt");
const sqlite3 = require("sqlite3").verbose();
const { v4: uuidv4 } = require("uuid");
const { promises } = require("original-fs");
const { event, data } = require("jquery");
const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');
const XLSX = require('xlsx');

let db = new sqlite3.Database("../../Backend/db/database.sqlite", (err) => {
  if (err) {
    console.error("Error opening database:", err);
  } else {
    console.log("Database opened successfully");
  }
});

ipcMain.handle("fetch-data", async (event) => {
  return new Promise((resolve, reject) => {
    db.all("SELECT * FROM subject_master", (err, rows) => {
      if (err) {
        console.error("Error fetching data:", err);
        reject(err);
      } else {
        console.log("Fetched data:", rows[3]);
        resolve(rows);
      }
    });
  });
});

ipcMain.handle('getPattern', async (e, data) => {
  console.log(`Hello 0lla ${data.pattern}`)

  return new Promise((resolve, reject) => {
    console.log(`Hello 0lla ${data}`)
  });

})

ipcMain.handle("save-pre-year-sub", async (e, data) => {
  return new Promise((resolve, reject) => {
    // Fetch the row based on fromYear, pattern, semester, subject, and branch
    const fetchSql = `
      SELECT * FROM subject_master 
      WHERE year = ? 
      AND pattern = ? 
      AND semester = ? 
      AND subject_name = ? 
      AND branch = ?
    `;

    const fetchParams = [
      data.fromYear, 
      data.pattern, 
      data.semester, 
      data.subject, 
      data.branch
    ];

    db.get(fetchSql, fetchParams, (err, row) => {
      if (err) {
        console.error('Error fetching data:', err);
        reject(err);
      } else if (row) {
        // Check for duplicates with toYear before inserting
        const checkDuplicateSql = `
          SELECT * FROM subject_master 
          WHERE year = ? 
          AND pattern = ? 
          AND semester = ? 
          AND subject_name = ? 
          AND branch = ?
        `;

        const checkParams = [
          data.toYear,          // Check for toYear instead of fromYear
          row.pattern,
          row.semester,
          row.subject_name,
          row.branch
        ];

        db.get(checkDuplicateSql, checkParams, (dupErr, dupRow) => {
          if (dupErr) {
            console.error('Error checking for duplicate row:', dupErr);
            reject(dupErr);
          } else if (dupRow) {
            // If a duplicate row exists, skip the insert
            console.log('Duplicate row found, skipping insertion');
            resolve(false); // Return false to indicate the row wasn't added
          } else {
            // No duplicate row found, proceed with the insert
            const insertSql = `
              INSERT INTO subject_master 
              (year, pattern, semester, branch, subject_name, subject_code, subject_id,
               course_credits, h1_credit, h2_credit, ese_oom, ese_pm, ese_res,   
               ia_oom, ia_pm, ia_res, pr_oom, pr_pm, pr_res, 
               tw_com, tw_pm, tw_res, or_oom, or_pm, or_res, opc, subject_group) 
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;

            const insertParams = [
              data.toYear,          // Use toYear instead of fromYear
              row.pattern,
              row.semester,
              row.branch,
              row.subject_name,
              row.subject_code,
              row.subject_id,
              row.course_credits,
              row.h1_credit,
              row.h2_credit,
              row.ese_oom,
              row.ese_pm,
              row.ese_res,
              row.ia_oom,
              row.ia_pm,
              row.ia_res,
              row.pr_oom,
              row.pr_pm,
              row.pr_res,
              row.tw_com,
              row.tw_pm,
              row.tw_res,
              row.or_oom,
              row.or_pm,
              row.or_res,
              row.opc,
              null // or any value for subject_group if needed
            ];

            db.run(insertSql, insertParams, (insertErr) => {
              if (insertErr) {
                console.error('Error inserting copied row:', insertErr);
                reject(insertErr);
              } else {
                console.log('Successfully copied row with updated year');
                resolve(true); // Return true to indicate successful insertion
              }
            });
          }
        });
      } else {
        console.log('No row found to copy');
        resolve(false); // No row found with the fromYear criteria
      }
    });
  });
});

ipcMain.handle("subject-save", async (event, data) => {
  const { subjectName, subjectCode } = data;

  // Generate a unique ID based on timestamp and random number
  const timestamp = Date.now(); // Current timestamp in milliseconds
  const randomNum = Math.floor(Math.random() * 1000); // Random number between 0 and 999
  const subject_id = `SUB${timestamp}${randomNum.toString().padStart(3, "0")}`; // Format ID

  console.log("Generated Unique ID:", subject_id);

  return new Promise((resolve, reject) => {
    const query =
      "INSERT INTO subject_master(subject_name, subject_code, subject_id) VALUES (?, ?, ?)";
    db.run(query, [subjectName, subjectCode, subject_id], function (err) {
      if (err) {
        console.log("Error: Cannot save data in DB ::", err);
        resolve({ success: false, error: err.message });
      } else {
        console.log(`${subjectName} and ${subjectCode} inserted into table`);
        resolve({ success: true });
      }
    });
  });
});

ipcMain.handle("delete-subject", async (event, subject) => {
  return new Promise((resolve, reject) => {
    if (!subject) {
      reject(new Error("Subject name is required"));
      return;
    }

    const query = `
      DELETE FROM subject_master 
      WHERE subject_name = ? 
        AND ese_oom IS NULL 
        AND ese_pm IS NULL 
        AND ese_res IS NULL 
        AND ia_oom IS NULL 
        AND ia_pm IS NULL 
        AND ia_res IS NULL 
        AND pr_oom IS NULL 
        AND pr_pm IS NULL 
        AND pr_res IS NULL 
        AND or_oom IS NULL 
        AND or_pm IS NULL 
        AND or_res IS NULL 
        AND tw_com IS NULL 
        AND tw_pm IS NULL 
        AND tw_res IS NULL 
        AND opc IS NULL 
        AND h1_credit IS NULL 
        AND h2_credit IS NULL
    `;

    db.run(query, [subject], function (err) {
      if (err) {
        reject(err);
      } else {
        if (this.changes === 0) {
          resolve({ success: true, changes: 0 });
        } else {
          resolve({ success: true, changes: this.changes });
        }
      }
    });
  });
});

ipcMain.handle("save-credits", async (e, data) => {
  return new Promise((resolve, reject) => {
    const sql = `
      UPDATE subject_master 
      SET 
        year = ?, pattern = ?, semester = ?,branch=?, subject_name = ?, 
        course_credits = ?, h1_credit = ?, h2_credit = ?, ese_oom = ?, ese_pm = ?, ese_res = ?, 
        ia_oom = ?, ia_pm = ?, ia_res = ?, pr_oom = ?, pr_pm = ?, pr_res = ?, 
        tw_com = ?, tw_pm = ?, tw_res = ?, or_oom = ?, or_pm = ?, or_res = ?, opc = ?
      WHERE subject_name = ? AND year  IS NULL  
    `;

    console.log("Data received in backend:", data);

    const params = [
      data.year,
      data.pattern,
      data.semester,
      data.branch,
      data.subject,
      data.courseCredit,
      data.h1Credit,
      data.h2Credit,
      data.eseOom,
      data.esePm,
      data.eseRes,
      data.iaOom,
      data.iaPm,
      data.iaRes,
      data.prOom,
      data.prPm,
      data.prRes,
      data.twOom,
      data.twPm,
      data.twRes,
      data.orOom,
      data.orPm,
      data.orRes,
      data.opc,
      data.subject,
    ];

    console.log("Params array:", params);

    db.run(sql, params, (err) => {
      if (err) {
        console.log("No Update: ", err);
        reject(false);
      } else {
        console.log("Successfully Updated");
        resolve(true);
      }
    });
  });
});

// group master fetch data
ipcMain.handle("fetch-subject-name-id", async (event, data) => {
  const { year, pattern, branch, semester } = data;

  return new Promise((resolve, reject) => {
    const query =
      "SELECT * FROM subject_master WHERE year = ? AND pattern = ? AND branch = ? AND semester = ?";

    db.all(query, [year, pattern, branch, semester], (err, rows) => {
      if (err) {
        console.error(
          "Error while subjectname and subjectcode fetching data:",
          err
        );
        reject(err);
      } else {
        console.log("Fetched data:", rows);
        resolve(rows);
      }
    });
  });
});

// for checking data is present for this year or not
ipcMain.handle("fetch-subject-for-this-year", async (event, data) => {
  const { year, pattern, branch, semester } = data;

  const checkAllNullGroups = () => {
    return new Promise((resolve, reject) => {
      const query =
        "SELECT COUNT(*) as count FROM subject_master WHERE year = ? AND pattern = ? AND branch = ? AND semester = ? AND subject_group IS NOT NULL";

      db.get(query, [year, pattern, branch, semester], (err, row) => {
        if (err) {
          console.error("Error while checking null groups:", err);
          reject(err);
        } else {
          resolve(row.count === 0); // If count is 0, all groups are null
        }
      });
    });
  };

  try {
    const allNullGroups = await checkAllNullGroups();
    return allNullGroups;
  } catch (err) {
    return false;
  }
});

ipcMain.handle("update-credits", async (e, data) => {
  return new Promise((resolve, reject) => {
    const sql = `
      UPDATE subject_master 
      SET 
        year = ?, pattern = ?, semester = ?,branch=?, subject_name = ?, 
        course_credits = ?, h1_credit = ?, h2_credit = ?, ese_oom = ?, ese_pm = ?, ese_res = ?, 
        ia_oom = ?, ia_pm = ?, ia_res = ?, pr_oom = ?, pr_pm = ?, pr_res = ?, 
        tw_com = ?, tw_pm = ?, tw_res = ?, or_oom = ?, or_pm = ?, or_res = ?, opc = ?
      WHERE subject_name = ? AND year = ?
    `;

    console.log("Data received in backend:", data);

    const params = [
      data.year,
      data.pattern,
      data.semester,
      data.branch,
      data.subject,
      data.courseCredit,
      data.h1Credit,
      data.h2Credit,
      data.eseOom,
      data.esePm,
      data.eseRes,
      data.iaOom,
      data.iaPm,
      data.iaRes,
      data.prOom,
      data.prPm,
      data.prRes,
      data.twOom,
      data.twPm,
      data.twRes,
      data.orOom,
      data.orPm,
      data.orRes,
      data.opc,
      data.subject,

      data.year,
    ];

    console.log("Params array:", params);

    db.run(sql, params, (err) => {
      if (err) {
        console.log("No Update: ", err);
        reject(false);
      } else {
        console.log("Successfully Updated");
        resolve(true);
      }
    });
  });
});

// group master update subject group name
ipcMain.handle("update-subject-group-name", async (e, data) => {
  const { groupName, subjectIds } = data;
  console.log(subjectIds);
  if (!Array.isArray(subjectIds) || subjectIds.length === 0) {
    return Promise.reject("No subject IDs provided.");
  }

  return new Promise((resolve, reject) => {
    let updatedCount = 0;
    let totalToUpdate = subjectIds.length;
    let completedCount = 0;
    let hasError = false;

    // Step 1: Check if the groupName is already present in any other row
    const checkGroupNameSql = `SELECT COUNT(*) AS count FROM subject_master WHERE subject_group = ?`;

    db.get(checkGroupNameSql, [groupName], (err, result) => {
      if (err) {
        hasError = true;
        console.log("Error checking group name: ", err);
        return reject(false);
      }

      if (result.count > 0) {
        // If groupName is already present in other rows, resolve early
        console.log(
          "Group name already exists in other rows. No updates performed."
        );
        return resolve("GNAE");
      }

      // Step 2: Check each subjectId and update if applicable
      subjectIds.forEach((subjectId) => {
        // const checkSql = `SELECT subject_group FROM subject_master WHERE subject_id = ?`;
        const checkSql = `SELECT subject_group FROM subject_master WHERE id = ?`;

        db.get(checkSql, [subjectId], (err, row) => {
          if (err) {
            hasError = true;
            console.log(
              `Error checking subject group for ID ${subjectId}: `,
              err
            );
          } else if (row) {
            if (row.subject_group === null || row.subject_group === groupName) {
              // Proceed with the update if the value is NULL or already matches the groupName
              // const updateSql = `UPDATE subject_master SET subject_group = ? WHERE subject_id = ?`;
              const updateSql = `UPDATE subject_master SET subject_group = ? WHERE id = ?`;

              db.run(updateSql, [groupName, subjectId], (err) => {
                if (err) {
                  hasError = true;
                  console.log(`No Update for ID ${subjectId}: `, err);
                } else {
                  updatedCount++;
                }

                // Check if all operations are complete
                completedCount++;
                if (completedCount === totalToUpdate) {
                  if (hasError) {
                    reject(false);
                  } else {
                    console.log(`Successfully Updated ${updatedCount} rows.`);
                    resolve(true);
                  }
                }
              });
            } else {
              // If subject_group is not NULL and does not match groupName, do not update
              completedCount++;
              if (completedCount === totalToUpdate) {
                if (hasError) {
                  reject(false);
                } else {
                  resolve("ISNNMG");
                }
              }
            }
          } else {
            // No row found for the given subjectId
            completedCount++;
            if (completedCount === totalToUpdate) {
              if (hasError) {
                reject(false);
              } else {
                resolve(true);
              }
            }
          }
        });
      });
    });
  });
});

ipcMain.handle("check-subject", async (event, subjectName) => {
  return new Promise((resolve, reject) => {
    db.all(
      `SELECT COUNT(*) AS count
       FROM subject_master 
       WHERE subject_name = ? 
       AND ese_oom IS NULL 
       AND ese_pm IS NULL 
       AND ese_res IS NULL 
       AND ia_oom IS NULL 
       AND ia_pm IS NULL 
       AND ia_res IS NULL 
       AND pr_oom IS NULL 
       AND pr_pm IS NULL 
       AND pr_res IS NULL 
       AND or_oom IS NULL 
       AND or_pm IS NULL 
       AND or_res IS NULL 
       AND tw_com IS NULL 
       AND tw_pm IS NULL 
       AND tw_res IS NULL 
       AND opc IS NULL 
       AND h1_credit IS NULL 
       AND h2_credit IS NULL`,
      [subjectName],
      (err, rows) => {
        if (err) {
          console.log("Database error:", err);
          reject("DE");
        } else {
          const count = rows[0].count;
          console.log(count);

          if (count >= 1) {
            console.log("SF");
            resolve("SF");
          } else {
            console.log("SNF");
            resolve("SNF");
          }
        }
      }
    );
  });
});

// update group list group master
ipcMain.handle("edit-subject-group-name", async (event, data) => {
  const { groupName, subjectIds, allSubjectIds } = data;
  console.log(subjectIds);
  if (!Array.isArray(subjectIds) || subjectIds.length === 0) {
    return Promise.reject("No subject IDs provided.");
  }

  // Function to update a subject's group
  const updateSubjectGroup = (subjectId, group) => {
    return new Promise((resolve, reject) => {
      // const updateSql = `UPDATE subject_master SET subject_group = ? WHERE subject_id = ?`;
      const updateSql = `UPDATE subject_master SET subject_group = ? WHERE id = ?`;
      db.run(updateSql, [group, subjectId], (err) => {
        if (err) {
          console.log("No Update: ", err);
          reject(err);
        } else {
          console.log("Successfully Updated to", group);
          resolve();
        }
      });
    });
  };

  try {
    // First, set subject_group to null for all subjects in allSubjectIds
    await Promise.all(
      allSubjectIds.map((subjectId) => updateSubjectGroup(subjectId, null))
    );

    // Then, set subject_group to groupName for subjects in subjectIds
    await Promise.all(
      subjectIds.map((subjectId) => updateSubjectGroup(subjectId, groupName))
    );

    return true;
  } catch (err) {
    return false;
  }
});

// pre year group master
ipcMain.handle("add-pre-year-group", async (e, data) => {
  const {
    groupName,
    selectedIds,
    toYear,
    fromYear,
    pattern,
    branch,
    semester,
  } = data;

  if (
    !groupName ||
    !Array.isArray(selectedIds) ||
    !selectedIds.length ||
    !toYear ||
    !fromYear
  ) {
    return Promise.reject(new Error("Invalid input data."));
  }

  console.log(
    "Starting update for groupName:",
    groupName,
    "with IDs:",
    selectedIds
  );

  return new Promise(async (resolve, reject) => {
    try {
      // Function to update a subject's group based on the IDs provided
      const updatePreYearSubject = (selectedId) => {
        return new Promise((resolve, reject) => {
          const findFromYearSql =
            "SELECT subject_name FROM subject_master WHERE id = ? AND year = ?";
          db.get(
            findFromYearSql,
            [selectedId, fromYear],
            (err, fromYearRow) => {
              if (err) {
                console.error(
                  `Error querying fromYear for ID ${selectedId}:`,
                  err
                );
                return reject(new Error("Database error querying fromYear."));
              }
              if (!fromYearRow) {
                console.warn(
                  `No data found for previous year with ID ${selectedId}`
                );
                return reject(new Error("No data found for previous year."));
              }

              const { subject_name: subjectName } = fromYearRow;

              // Check if the subject for the current year exists
              const checkToYearSql =
                "SELECT subject_name FROM subject_master WHERE subject_name = ? AND year = ?";
              db.get(
                checkToYearSql,
                [subjectName, toYear],
                (err, toYearRow) => {
                  if (err) {
                    console.error(
                      `Error querying toYear for subject ${subjectName}:`,
                      err
                    );
                    return reject(new Error("Database error querying toYear."));
                  }
                  if (!toYearRow) {
                    console.warn(
                      `No data found for current year with subject ${subjectName}`
                    );
                    return reject(
                      new Error(
                        `No data found for current year for subject: ${subjectName}`
                      )
                    );
                  }

                  // Update the subject group for the current year
                  const updateToYearSql =
                    "UPDATE subject_master SET subject_group = ? WHERE year = ? AND subject_name = ?";
                  db.run(
                    updateToYearSql,
                    [groupName, toYear, subjectName],
                    (err) => {
                      if (err) {
                        console.error(
                          `Error updating group for subject ${subjectName}:`,
                          err
                        );
                        return reject(
                          new Error("Database error updating subject group.")
                        );
                      }

                      console.log(
                        `Successfully updated subject ${subjectName} to group ${groupName}`
                      );
                      resolve(true);
                    }
                  );
                }
              );
            }
          );
        });
      };

      // Run updates for all selected IDs and wait for all promises to complete
      await Promise.all(selectedIds.map((id) => updatePreYearSubject(id)));
      resolve(true); // Resolve the promise if all updates succeed
    } catch (err) {
      console.error("Error in 'add-pre-year-group' handler:", err.message);
      reject(err); // Reject the promise with the caught error
    }
  });
});

// for deleting group
ipcMain.handle("delete-group", async (event, data) => {
  const { year, pattern, branch, semester } = data;

  return new Promise((resolve, reject) => {
    const updateSql =
      "UPDATE subject_master SET subject_group = ? WHERE year = ? AND pattern = ? AND branch = ? AND semester = ?";
    db.run(updateSql, [null, year, pattern, branch, semester], (err) => {
      if (err) {
        console.error(`Error deleting group`, err);
        return reject(new Error("Error deleting group."));
      }

      console.log(`Successfully deleted group`);
      resolve(true);
    });
  });
});

// For Exam_code 15 FeB - 2-25
// Insert in Exam-code table
ipcMain.handle("insert-in-exam-code", async (event, data) => {
  const { year, branch, heldin_year, heldin_month, type } = data;

  return new Promise((resolve, reject) => {
    const query =
      "SELECT * FROM exam_code WHERE year = ? AND branch = ? AND heldin_year = ? AND heldin_month = ? AND type = ?";

    db.get(
      query,
      [year, branch, heldin_year, heldin_month, type],
      (err, row) => {
        if (err) {
          console.error("Error while checking data:", err);
          return reject(err);
        }

        if (row) {
          console.log("Record found:", row);
          return resolve("found");
        }

        const insertData =
          "INSERT INTO exam_code (year, branch, heldin_year, heldin_month, type, is_current, is_lock) VALUES (?, ?, ?, ?, ?, ?, ?)";
        db.run(
          insertData,
          [year, branch, heldin_year, heldin_month, type, 0, 0],
          (err) => {
            if (err) {
              console.error("Error creating exam:", err);
              return reject(new Error("Error inserting exam data."));
            }

            console.log("Successfully created exam");
            resolve("not found");
          }
        );
      }
    );
  });
});

ipcMain.handle("get-all-student-exams", async (event, data) => {
  return new Promise((resolve, reject) => {
    // Log incoming data for debugging
    console.log("The passed conditions from PatternTransfer:", data);

    const { year, pattern, semester, branch } = data;

    // Query to get student IDs and other details from student_exams
    const query = `
      SELECT *
      FROM student_exams
      WHERE 
        year = ? AND 
        pattern = ? AND 
        semester = ? AND 
        branch = ?
    `;

    const params = [year, pattern, semester, branch];

    console.log("SQL Query:", query);
    console.log("Query Parameters:", params);

    db.all(query, params, (err, examRows) => {
      if (err) {
        console.error("❌ Error fetching student exams:", err);
        return reject(err);
      }

      if (examRows.length === 0) {
        console.log("⚠️ No data found for the given conditions.");
        return resolve([]);
      }

      // Get all unique student_ids from examRows
      const studentIds = examRows.map((row) => row.student_id);

      if (studentIds.length === 0) {
        console.log("⚠️ No student IDs found.");
        return resolve([]);
      }

      // Prepare query to fetch student names from students table
      const studentQuery = `
        SELECT student_id, name 
        FROM student
        WHERE student_id IN (${studentIds.map(() => "?").join(",")})
      `;

      console.log("Fetching student names with query:", studentQuery);
      console.log("Student IDs:", studentIds);

      db.all(studentQuery, studentIds, (err, studentRows) => {
        if (err) {
          console.error("❌ Error fetching student names:", err);
          return reject(err);
        }

        // Create a map of student_id -> student_name for faster lookup
        const studentMap = {};
        studentRows.forEach((student) => {
          studentMap[student.student_id] = student.name;
        });

        // Merge examRows with corresponding student names
        const mergedData = examRows.map((row) => ({
          ...row,
          student_name: studentMap[row.student_id] || "Unknown", // Handle missing names
        }));

        console.log("✅ Final Merged Data:", mergedData);
        resolve(mergedData);
      });
    });
  });
});

// IPC handler to update pattern for selected students
ipcMain.handle("update-student-pattern", async (event, data) => {
  console.log("Received data for pattern update:");
  console.log("Student Data:", data?.studentData);
  console.log("Transfer Pattern:", data?.transferPattern);

  if (
    !data ||
    !data.studentData ||
    data.studentData.length === 0 ||
    !data.transferPattern ||
    data.transferPattern === "Select pattern"
  ) {
    console.error("❌ Invalid data received. Aborting query.");
    return { success: false, error: "Invalid data received. No update performed." };
  }

  const { studentData, transferPattern } = data;

  return new Promise((resolve, reject) => {
    // Prepare queries for each student
    const queries = studentData.map((student) => {
      const query = `
        UPDATE student_exams
        SET pattern = ?
        WHERE student_id = ? AND semester = ? AND subject_marker = ?
      `;
      const params = [transferPattern, student.student_id, student.semester, student.subject_marker];

      console.log("SQL Query:", query);
      console.log("Query Parameters:", params);

      return new Promise((res, rej) => {
        db.run(query, params, function (err) {
          if (err) {
            console.error("❌ Error updating pattern:", err);
            return rej(err);
          }
          res(this.changes);
        });
      });
    });

    // Run all queries
    Promise.all(queries)
      .then((results) => {
        const updatedRows = results.reduce((acc, val) => acc + val, 0);
        console.log(`✅ Updated pattern for ${updatedRows} records successfully!`);
        resolve({ success: true, updatedRows });
      })
      .catch((err) => {
        console.error("❌ Error updating multiple records:", err);
        reject(err);
      });
  });
});

// Fetch exam-code data
ipcMain.handle("fetch-exam-code", async (event, data) => {
  return new Promise((resolve, reject) => {
    db.all("SELECT * FROM exam_code", (err, rows) => {
      if (err) {
        console.error("Error while fetching data:", err);
        return reject(err);
      }

      if (rows && rows.length > 0) {
        console.log("Records found:", rows);
        return resolve(rows);
      } else {
        console.log("No records found");
        return resolve([]); // Resolve with an empty array if no records are found
      }
    });
  });
});

// Delete one exam
ipcMain.handle("delete-exam-code", async (event, exam_id) => {
  return new Promise((resolve, reject) => {
    const query = "DELETE FROM exam_code WHERE exam_id = ? AND is_current =?";

    db.run(query, [exam_id, 0], function (err) {
      if (err) {
        console.error("Error while deleting data:", err);
        return reject(err);
      }

      if (this.changes > 0) {
        console.log(`Successfully deleted row with exam_id: ${exam_id}`);

        const query = "DELETE FROM exam_res WHERE exam_id = ? ";

        db.run(query, [exam_id], function (err) {
          if (err) {
            console.error("Error while deleting data:", err);
            return reject(err);
          }

          if (this.changes > 0) {
            console.log(`Successfully deleted row with exam_id: ${exam_id}`);
            resolve(true);
          } else {
            console.log(`No row found with exam_id: ${exam_id}`);
            resolve(false); // No row was deleted
          }
        });

        resolve(true);
      } else {
        console.log(`No row found with exam_id: ${exam_id}`);
        resolve(false); // No row was deleted
      }
    });
  });
});

// update date in exam-code
ipcMain.handle(
  "update-exam-code",
  async (event, { exam_id, heldin_month, heldin_year }) => {
    return new Promise((resolve, reject) => {
      // Define the SQL query to update the rows
      const query =
        "UPDATE exam_code SET heldin_month = ?, heldin_year = ? WHERE exam_id = ?";

      // Execute the SQL query
      db.run(query, [heldin_month, heldin_year, exam_id], function (err) {
        if (err) {
          console.error("Error while updating data:", err);
          return reject(err);
        }

        // Check if any rows were affected
        if (this.changes > 0) {
          console.log(`Successfully updated rows with exam_id: ${exam_id}`);
          resolve(true);
        } else {
          console.log(`No rows found with exam_id: ${exam_id}`);
          resolve(false); // No rows were updated
        }
      });
    });
  }
);

// update is_current
ipcMain.handle("update-is-current", async (event, data) => {
  const { exam_id, is_current } = data;
  return new Promise((resolve, reject) => {
    const query = "UPDATE exam_code SET is_current = ? WHERE exam_id = ?";

    db.run(query, [is_current, exam_id], function (err) {
      if (err) {
        console.error("Error while updating data:", err);
        return reject(err);
      }

      if (this.changes > 0) {
        console.log(`Successfully updated is_current for exam_id: ${exam_id}`);
        resolve(true);
      } else {
        console.log(`No rows found with exam_id: ${exam_id}`);
        resolve(false);
      }
    });
  });
});

// update is_lock
ipcMain.handle("update-is-lock", async (event, data) => {
  const { exam_id, is_lock } = data;
  return new Promise((resolve, reject) => {
    const query = "UPDATE exam_code SET is_lock = ? WHERE exam_id = ?";

    db.run(query, [is_lock, exam_id], function (err) {
      if (err) {
        console.error("Error while updating data:", err);
        return reject(err);
      }

      if (this.changes > 0) {
        console.log(`Successfully updated is_current for exam_id: ${exam_id}`);
        resolve(true);
      } else {
        console.log(`No rows found with exam_id: ${exam_id}`);
        resolve(false);
      }
    });
  });
});

// For Exam_Res
// Insert in Exam-Res table
ipcMain.handle("insert-in-exam-res", async (event, data) => {
  const { pattern, semester, exam, subject, h1_res, h2_res, exam_id } = data;

  return new Promise((resolve, reject) => {
    const query =
      "SELECT * FROM exam_res WHERE pattern = ? AND semester = ? AND exam = ? AND subject = ?";

    db.get(query, [pattern, semester, exam, subject], (err, row) => {
      if (err) {
        console.error("Error while checking data:", err);
        return reject(err);
      }

      if (row) {
        console.log("Record found:", row);
        return resolve("found");
      }

      const insertData =
        "INSERT INTO exam_res (pattern, semester, exam, subject, h1_res, h2_res, exam_id) VALUES (?, ?, ?, ?, ?, ?, ?)";
      db.run(
        insertData,
        [pattern, semester, exam, subject, h1_res, h2_res, exam_id],
        (err) => {
          if (err) {
            console.error("Error creating exam:", err);
            return reject(new Error("Error inserting exam data."));
          }

          console.log("Successfully created exam");
          resolve("not found");
        }
      );
    });
  });
});

// check before insert
ipcMain.handle("check-in-exam-res", async (event, data) => {
  const { pattern, semester, exam, subject, h1_res, h2_res } = data;
  console.log(pattern + semester + exam + subject);

  return new Promise((resolve, reject) => {
    const query =
      "SELECT * FROM exam_res WHERE pattern = ? AND semester = ? AND exam = ? AND subject = ?";

    db.get(query, [pattern, semester, exam, subject], (err, row) => {
      if (err) {
        console.error("Error while checking data:", err);
        return reject(err);
      }

      if (row) {
        console.log("Record found for credits:", row);
        resolve(row);
      } else {
        return resolve("not found");
      }
    });
  });
});

// fetch credits for add res

ipcMain.handle("fetch-credits-for-res", async (event, data) => {
  const { exam_id, pattern, semester, subject } = data;

  return new Promise((resolve, reject) => {
    // First, get the year from the exam_code table using the exam_id
    const getYearQuery = "SELECT year FROM exam_code WHERE exam_id = ?";

    db.get(getYearQuery, [exam_id], (err, row) => {
      if (err) {
        console.error("Error while fetching year:", err);
        return reject(err);
      }

      if (!row) {
        console.log(`No year found for exam_id: ${exam_id}`);
        return resolve([]);
      }

      const { year } = row;

      // Now, fetch the subjects from the subject_master table
      const getSubjectsQuery = `
        SELECT * FROM subject_master 
        WHERE pattern = ? AND semester = ? AND subject_name = ? AND year = ?
      `;

      db.all(
        getSubjectsQuery,
        [pattern, semester, subject, year],
        (err, rows) => {
          if (err) {
            console.error("Error while fetching subjects:", err);
            return reject(err);
          }

          resolve(rows);
        }
      );
    });
  });
});

// fetch branch wise subjects
ipcMain.handle("fetch-subject-branch-wise", async (event, data) => {
  const { exam_id } = data;

  return new Promise((resolve, reject) => {
    // First, get the year from the exam_code table using the exam_id
    const getYearQuery = "SELECT branch FROM exam_code WHERE exam_id = ?";

    db.get(getYearQuery, [exam_id], (err, row) => {
      if (err) {
        console.error("Error while fetching year:", err);
        return reject(err);
      }

      if (!row) {
        console.log(`No year found for exam_id: ${exam_id}`);
        return resolve([]);
      }

      const { branch } = row;

      // Now, fetch the subjects from the subject_master table
      const getSubjectsQuery = `
        SELECT subject_name FROM subject_master 
        WHERE branch = ?
      `;

      db.all(getSubjectsQuery, [branch], (err, rows) => {
        if (err) {
          console.error("Error while fetching subjects:", err);
          return reject(err);
        }

        resolve(rows);
      });
    });
  });
});

ipcMain.handle("fetch-student-exams", async (event, { exam_id, semester }) => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT s.*, se.subject_marker
      FROM student_exams se
      JOIN student s ON se.student_id = s.student_id
      WHERE se.exam_id = ? 
    `;
    db.all(query, [exam_id], (error, rows) => {
      if (error) {
        console.error("Error while fetching student exams:", error);
        return reject(error);
      }

      if (!rows || rows.length === 0) {
        console.log("No student exams found");
        return resolve([]);
      }

      console.log("Fetched student exams:", rows); // Log fetched data
      return resolve(rows);
    });
  });
});

// fetch students
ipcMain.handle("fetch-student", async () => {
  return new Promise((resolve, reject) => {
    const query = "SELECT * FROM student";
    db.all(query, (error, rows) => {
      if (error) {
        console.error("Error while fetching students:", error);
        return reject(error);
      }

      if (!rows || rows.length === 0) {
        console.log("No students found");
        return resolve([]);
      }

      return resolve(rows);
    });
  });
});

ipcMain.handle("student-count", () => {
  return new Promise((resolve, reject) => {
    const query = "SELECT COUNT(*) AS count FROM student";

    db.get(query, (error, row) => {
      if (error) {
        console.error("Error while fetching student count:", error);
        return reject(error);
      }

      return resolve(row.count);
    });
  });
});

ipcMain.handle("fetch-eligible-students", (event, { student_ids }) => {
  return new Promise((resolve, reject) => {
    console.log("Received student_ids:", student_ids);

    if (!Array.isArray(student_ids) || student_ids.length === 0) {
      console.error("Error: Invalid or empty student_ids parameter.");
      return reject(new Error("Invalid or empty student_ids parameter."));
    }

    const placeholders = student_ids.map(() => "?").join(",");
    const query = `SELECT student_id, status FROM student WHERE student_id IN (${placeholders})`;

    console.log("Executing query:", query);
    console.log("Query parameters:", student_ids);

    db.all(query, student_ids, (err, rows) => {
      if (err) {
        console.error("Database error:", err);
        reject(err);
      } else {
        console.log("Query result:", rows);
        resolve(rows);
      }
    });
  });
});

ipcMain.handle("fetch-subjects-for-semester", (event, { semester }) => {
  return new Promise((resolve, reject) => {
    const query = `SELECT subject_name FROM subject WHERE semester = ?`;

    db.all(query, [semester], (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows.map((row) => row.subject_name));
      }
    });
  });
});

ipcMain.handle('save-student-data', async (event, data) => {
  const { students, branch, year } = data;

  return new Promise((resolve, reject) => {
      db.serialize(() => {
          db.run('BEGIN TRANSACTION'); // Start a transaction

          const stmt = db.prepare('INSERT INTO student (student_id, name, branch, category,year, gender, studentType) VALUES (?, ?, ?,?, ?, ?, ?)');

          students.forEach(student => {
              stmt.run(student.id, student.name, branch, student.category, year, student.gender, student.studentType, (error) => {
                  if (error) {
                      console.error('Error while inserting student data:', error);
                      db.run('ROLLBACK'); // Rollback the transaction on error
                      return reject(error);
                  }
              });
          });

          stmt.finalize(err => {
              if (err) {
                  console.error('Error finalizing statement:', err);
                  db.run('ROLLBACK'); // Rollback the transaction on error
                  return reject(err);
              }

              db.run('COMMIT', commitError => {
                  if (commitError) {
                      console.error('Error committing transaction:', commitError);
                      return reject(commitError);
                  }

                  resolve({ success: true, message: 'Students saved successfully!' });
              });
          });
      });
  });
});


ipcMain.handle('update-student', async (event, data) => {
  const { student_id, first_name } = data; // Destructure data to get student ID and new first name

  return new Promise((resolve, reject) => {
    db.serialize(() => {
      db.run('BEGIN TRANSACTION', (beginError) => {
        if (beginError) {
          console.error('Error starting transaction:', beginError);
          return reject({ success: false, message: 'Error starting transaction' });
        }

        // Prepare the SQL statement to update the student's first name
        const stmt = db.prepare('UPDATE student SET name = ? WHERE student_id = ?');

        stmt.run(first_name, student_id, function (error) {
          if (error) {
            console.error('Error while updating student data:', error);
            db.run('ROLLBACK'); // Rollback the transaction on error
            return reject({ success: false, message: 'Error updating student data' });
          }
        });

        stmt.finalize((err) => {
          if (err) {
            console.error('Error finalizing statement:', err);
            db.run('ROLLBACK');
            return reject({ success: false, message: 'Error finalizing statement' });
          }

          db.run('COMMIT', (commitError) => {
            if (commitError) {
              console.error('Error committing transaction:', commitError);
              return reject({ success: false, message: 'Error committing transaction' });
            }

            resolve({ success: true, message: 'Student updated successfully!' });
          });
        });
      });
    });
  });
});


ipcMain.handle('fetch-student-year-semester', async (event, studentId) => {
  return new Promise((resolve, reject) => {
      db.serialize(() => {
          db.run('BEGIN TRANSACTION');

          const stmt = db.prepare('SELECT year, semester FROM student_exams WHERE student_id = ?');

          stmt.all(studentId, (error, rows) => {
            if (error) {
                console.error('Error while fetching student year and semester:', error);
                db.run('ROLLBACK'); 
                return reject(error);
            }

            if (rows.length === 0) {
                db.run('ROLLBACK');
                return reject(new Error('No records found for the given student ID.'));
            }
              stmt.finalize(err => {
                  if (err) {
                      console.error('Error finalizing statement:', err);
                      db.run('ROLLBACK');
                      return reject(err);
                  }

                  db.run('COMMIT', commitError => {
                      if (commitError) {
                          console.error('Error committing transaction:', commitError);
                          return reject(commitError);
                      }
                      console.log("Student Data : ",rows)
                      resolve(rows);
                  });
              });
          });
      });
  });
});
// Handle the image upload
ipcMain.handle('upload-image', async (event, { student_id, file }) => {
  const imagesFolder = path.join(__dirname, 'assets', 'images'); 
  const imagePath = path.join(imagesFolder, file.name); 

  if (!fs.existsSync(imagesFolder)) {
    fs.mkdirSync(imagesFolder, { recursive: true }); 
  }

  try {
    await fs.promises.copyFile(file.path, imagePath);

    const saveResponse = await saveImagePath(student_id, imagePath);

    return { success: true, message: 'Image uploaded successfully!', image_path: imagePath };
  } catch (error) {
    console.error('Error saving image:', error);
    return { success: false, message: 'Error saving image: ' + error.message };
  }
});

// Function to save image path in the database
async function saveImagePath(student_id, image_path) {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      db.run('BEGIN TRANSACTION', (beginError) => {
        if (beginError) {
          console.error('Error starting transaction:', beginError);
          return reject({ success: false, message: 'Error starting transaction' });
        }

        db.run('UPDATE student SET image = ? WHERE student_id = ?', [image_path, student_id], function (error) {
          if (error) {
            console.error('Error while saving image path:', error);
            db.run('ROLLBACK'); 
            return reject({ success: false, message: 'Error saving image path' });
          }

          if (this.changes === 0) {
            console.error('No rows updated for student_id:', student_id);
            db.run('ROLLBACK');
            return reject({ success: false, message: 'No student found with the provided ID.' });
          }

          db.run('COMMIT', (commitError) => {
            if (commitError) {
              console.error('Error committing transaction:', commitError);
              return reject({ success: false, message: 'Error committing transaction' });
            }

            resolve({ success: true, message: 'Image path saved successfully!' });
          });
        });
      });
    });
  });
}








ipcMain.handle('delete-student-exam-entry', (event, data) => {
  return new Promise((resolve, reject) => {
    const { student_id, year, semester } = data;

    db.serialize(() => {
      db.run('BEGIN TRANSACTION', (beginError) => {
        if (beginError) {
          console.error('Error starting transaction:', beginError);
          return reject(beginError);
        }

        const stmt = db.prepare('DELETE FROM student_exams WHERE student_id = ? AND year = ? AND semester = ?');
        stmt.run([student_id, year, semester], (error) => {
          if (error) {
            console.error('Error while deleting student data:', error);
            db.run('ROLLBACK', () => {
              console.log('Transaction rolled back.');
            });
            return reject({ success: false, message: 'Error deleting student data' });
          }

          db.run('COMMIT', (commitError) => {
            if (commitError) {
              console.error('Error committing transaction:', commitError);
              db.run('ROLLBACK', () => {
                console.log('Transaction rolled back.');
              });
              return reject({ success: false, message: 'Error committing transaction' });
            }

            resolve({ success: true, message: 'Student exam entry deleted successfully!' });
          });
        });

        stmt.finalize(); 
      });
    });
  });
});



// ipcMain.handle('save-student-data', async (event, data) => {
//   const { students, branch, year } = data;

//   return new Promise((resolve, reject) => {
//     const { exam_id, subject, students,semester,subject_marker } = data;

//     db.serialize(() => {
//       db.run('BEGIN TRANSACTION');

//           const stmt = db.prepare('INSERT INTO student (student_id, name, branch, category,year, gender, studentType) VALUES (?, ?, ?,?, ?, ?, ?)');

//           // Insert each student into the database
//           students.forEach(student => {
//               stmt.run(student.id, student.name, branch, student.category, year, student.gender, student.studentType, (error) => {
//                   if (error) {
//                       console.error('Error while inserting student data:', error);
//                       db.run('ROLLBACK'); // Rollback the transaction on error
//                       return reject(error);
//                   }
//               });
//           });

//           stmt.finalize(err => {
//               if (err) {
//                   console.error('Error finalizing statement:', err);
//                   db.run('ROLLBACK'); // Rollback the transaction on error
//                   return reject(err);
//               }

//               db.run('COMMIT', commitError => {
//                   if (commitError) {
//                       console.error('Error committing transaction:', commitError);
//                       return reject(commitError);
//                   }

//                   resolve({ success: true, message: 'Students saved successfully!' });
//               });
//           });
//       });
//   });
// });

ipcMain.handle("save-student-exams", async (event, data) => {
  return new Promise((resolve, reject) => {
    const { exam_id, subject, students, semester, subject_marker, pattern, branch, year } = data;

    db.serialize(() => {
      db.run("BEGIN TRANSACTION");

      const stmt = db.prepare(
        "INSERT INTO student_exams (exam_id, subject_name, semester, subject_marker, student_id, pattern, branch, year) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
      );

      let hasError = false; // Track if any error occurs

      students.forEach((student_id) => {
        stmt.run(
          exam_id,
          subject,
          semester,
          subject_marker,
          student_id,
          pattern,
          branch,
          year,
          function (error) {
            if (error) {
              console.error("Error while inserting student exam:", error);
              hasError = true;
              db.run("ROLLBACK", () => reject(error));
            }
          }
        );
      });

      stmt.finalize((err) => {
        if (err) {
          console.error("Error finalizing statement:", err);
          db.run("ROLLBACK", () => reject(err));
          return;
        }

        if (!hasError) {
          db.run("COMMIT", (commitError) => {
            if (commitError) {
              console.error("Error committing transaction:", commitError);
              return reject(commitError);
            }

           
          });
        }
      });
    });
  });
});


ipcMain.handle("check-existing-assignments", (event, data) => {
  return new Promise((resolve, reject) => {
    const { exam_type, subject_name } = data;

    console.log(
      "This is my ExamType:",
      exam_type,
      "Subject Name:",
      subject_name
    );

    const query = `
          SELECT COUNT(*) AS count 
          FROM student_exams 
          WHERE exam_id = ? AND 
                (${
                  subject_name === null
                    ? "subject_name IS NULL"
                    : "subject_name = ?"
                })
      `;

    const params = [exam_type];
    if (subject_name !== null) {
      params.push(subject_name); // Add subject_name only if it's not null
    }

    db.get(query, params, (error, row) => {
      if (error) {
        console.error("Error checking existing assignments:", error);
        return reject(error);
      }

      resolve({ exists: row.count > 0 });
    });
  });
});

ipcMain.handle("delete-student-exam", async (event, data) => {
  return new Promise((resolve, reject) => {
    const { student_id, exam_id, subject } = data;

    console.log("Received data for deletion:", {
      student_id,
      exam_id,
      subject,
    });

    db.serialize(() => {
      console.log("Starting transaction...");
      db.run("BEGIN TRANSACTION", (beginError) => {
        if (beginError) {
          console.error("Error starting transaction:", beginError);
          return reject(beginError);
        }

        const query = `
          DELETE FROM student_exams 
          WHERE exam_id = ? AND student_id = ? 
          AND (${
            subject === null ? "subject_name IS NULL" : "subject_name = ?"
          })
        `;

        const params = [exam_id, student_id];
        if (subject !== null) {
          params.push(subject); // Add subject parameter only if it's not null
        }

        console.log("Executing delete statement with params:", params);
        db.run(query, params, (error) => {
          if (error) {
            console.error("Error while deleting student exam:", error);
            db.run("ROLLBACK", (rollbackError) => {
              if (rollbackError) {
                console.error("Error rolling back transaction:", rollbackError);
              }
            });
            return reject(error);
          } else {
            console.log("Delete statement executed successfully.");
          }
        });

        db.run("COMMIT", (commitError) => {
          if (commitError) {
            console.error("Error committing transaction:", commitError);
            return reject(commitError);
          }

          console.log("Transaction committed successfully.");
          resolve({
            success: true,
            message: "Student exam deleted successfully!",
          });
        });
      });
    });
  });
});

// ipcMain.handle('save-student-attendance', (event, { exam_id, subject, students }) => {
//   return new Promise((resolve, reject) => {
//       const placeholders = students.map(() => '(?, ?, ?)').join(',');
//       const query = `INSERT INTO student_exams (student_id, exam_id, subject_name, assigned_date) VALUES ${placeholders}
//                      ON CONFLICT(student_id, exam_id, subject_name)
//                      DO UPDATE SET assigned_date = CURRENT_DATE`;

//       const values = students.flatMap(student_id => [student_id, exam_id, subject]);

//       db.run(query, values, function (err) {
//           if (err) {
//               reject(err);
//           } else {
//               resolve({ success: true });
//           }
//       });
//   });
// });

ipcMain.handle("login-user", async (event, { username, password }) => {
  return new Promise((resolve, reject) => {
    db.get("SELECT * FROM user WHERE username = ?", [username], (err, row) => {
      if (err) {
        console.log("Database error");
        reject("DE");
      } else if (!row) {
        console.log("User not found");
        resolve("UNF");
      } else {
        bcrypt.compare(password, row.password, (err, result) => {
          if (err) {
            console.log("Error comparing passwords");
            reject("DE");
          } else if (result) {
            console.log("Login successful");
            resolve(row);
          } else {
            console.log("Invalid password");
            resolve("IP");
          }
        });
      }
    });
  });
});

ipcMain.handle("get-exam-list", async (event) => {
  return new Promise((resolve, reject) => {
    console.log('Fetching exam list from exams table...'); // Debug log
    const query = `
      SELECT 
        exam_id,
        exam_type,
        CASE 
          WHEN branch LIKE 'Computer%' THEN 'Comp'
          WHEN branch LIKE 'Mechanical%' THEN 'Mech'
          WHEN branch LIKE 'Civil%' THEN 'Civil'
          WHEN branch LIKE 'Electronics%' THEN 'ENTC'
          ELSE substr(branch, 1, 4)
        END as branch,
        heldin_month,
        heldin_year,
        pattern,
        year || ' ' || semester as exam_code
      FROM exams
      ORDER BY exam_id DESC
    `;
    
    db.all(query, [], (err, rows) => {
      if (err) {
        console.error("Error fetching exam list:", err);
        reject(err);
      } else {
        console.log('Retrieved exam list:', rows); // Debug log
        resolve(rows);
      }
    });
  });
});

ipcMain.handle("get-subject-list", async (event, examId) => {
  return new Promise((resolve, reject) => {
    // First get the exam details to get branch, year, and semester
    const examQuery = `
      SELECT branch, year, semester
      FROM exams
      WHERE exam_id = ?
    `;

    db.get(examQuery, [examId], (err, examRow) => {
      if (err) {
        console.error("Error fetching exam details:", err);
        return reject(err);
      }

      if (!examRow) {
        console.log("No exam found with ID:", examId);
        return resolve([]);
      }

      // Then get the subjects for this branch, year and semester
      const subjectQuery = `
        SELECT DISTINCT 
          subject_name as id,
          subject_name as name
        FROM subject_master
        WHERE branch = ?
          AND year = ?
          AND semester = ?
        ORDER BY subject_name
      `;

      db.all(subjectQuery, [examRow.branch, examRow.year, examRow.semester], (err, rows) => {
        if (err) {
          console.error("Error fetching subject list:", err);
          reject(err);
        } else {
          console.log("Retrieved subjects:", rows);
          resolve(rows);
        }
      });
    });
  });
});

// Handler to fetch distinct subjects from marks table
ipcMain.handle("fetch-subjects-by-exam", async (event, examId) => {
  return new Promise((resolve, reject) => {
    console.log('Fetching distinct subjects for exam_id:', examId);
    
    const query = `
      SELECT DISTINCT subject
      FROM marks
      WHERE exam_id = ?
      ORDER BY subject ASC
    `;
    
    db.all(query, [examId], (err, rows) => {
      if (err) {
        console.error("Error fetching subjects from marks:", err);
        reject(err);
      } else {
        console.log('Retrieved subjects:', rows);
        
        if (rows && rows.length > 0) {
          // Transform the results into the expected format
          const subjects = rows.map(row => ({
            subject: row.subject
          }));
          resolve(subjects);
        } else {
          resolve([]);  // Return empty array if no subjects found
        }
      }
    });
  });
});

// Handler to generate subject-wise report
ipcMain.handle("generate-subject-report", async (event, { examId, subjectName }) => {
  return new Promise((resolve, reject) => {
    console.log('Generating subject-wise report...');
    console.log('Parameters:', { examId, subjectName });
    
    const query = `
      SELECT 
        s.name as student_name,
        m.student_id,
        m.subject,
        m.credit,
        m.ese_marks,
        m.ia_marks
      FROM marks m
      LEFT JOIN student s ON m.student_id = s.student_id
      WHERE m.exam_id = ? AND m.subject = ?
      ORDER BY s.name
    `;
    
    console.log('Executing query with params:', [examId, subjectName]);
    
    db.all(query, [examId, subjectName], (err, rows) => {
      if (err) {
        console.error("Error generating subject report:", err);
        reject(err);
      } else {
        console.log('Query results:', rows);
        console.log('Number of rows returned:', rows.length);
        resolve(rows);
      }
    });
  });
});

// Handler to generate complete report
ipcMain.handle("generate-complete-report", async (event, { examId }) => {
  return new Promise((resolve, reject) => {
    console.log('Generating complete report for exam:', examId);
    
    const query = `
      SELECT 
        s.name as student_name,
        m.student_id,
        m.subject,
        m.credit,
        m.ese_marks,
        m.ia_marks
      FROM marks m
      LEFT JOIN student s ON m.student_id = s.student_id
      WHERE m.exam_id = ?
      ORDER BY s.name, m.subject
    `;
    
    db.all(query, [examId], (err, rows) => {
      if (err) {
        console.error("Error generating complete report:", err);
        reject(err);
      } else {
        console.log('Generated report:', rows);
        resolve(rows);
      }
    });
  });
});

// Debug handler to check marks table data
ipcMain.handle("debug-check-marks", async (event, examId) => {
  return new Promise((resolve, reject) => {
    console.log('Debugging marks table for exam_id:', examId);
    
    // First check what data exists in marks table
    const debugQuery = `
      SELECT exam_id, subject, COUNT(*) as count
      FROM marks
      WHERE exam_id = ?
      GROUP BY exam_id, subject
    `;
    
    db.all(debugQuery, [examId], (err, rows) => {
      if (err) {
        console.error("Error checking marks table:", err);
        reject(err);
      } else {
        console.log('Available data in marks table:', rows);
        
        // If no data found, let's check what exam_ids exist
        if (rows.length === 0) {
          db.all('SELECT DISTINCT exam_id, subject FROM marks LIMIT 10', [], (err2, rows2) => {
            if (err2) {
              console.error("Error checking available exam_ids:", err2);
              reject(err2);
            } else {
              console.log('Sample of available exam_ids and subjects in marks table:', rows2);
              resolve({
                forExamId: rows,
                sampleData: rows2
              });
            }
          });
        } else {
          resolve({
            forExamId: rows,
            sampleData: []
          });
        }
      }
    });
  });
});

ipcMain.handle("export-report-pdf", async (event, { examId, subjectName, reportType, data }) => {
  return new Promise(async (resolve, reject) => {
    try {
      const examQuery = `
        SELECT 
          e.exam_type,
          e.branch,
          e.heldin_month,
          e.heldin_year,
          e.pattern,
          e.year,
          e.semester
        FROM exams e
        WHERE e.exam_id = ?
      `;

      db.get(examQuery, [examId], async (err, examDetails) => {
        if (err) {
          console.error("Error fetching exam details:", err);
          return reject(err);
        }

        // Generate filename based on the format
        let pdfFileName;
        if (reportType === 'subject') {
          pdfFileName = `${subjectName}-${examDetails.branch.slice(0, 4)}-${examDetails.pattern}-Sem${examDetails.semester.split(' ')[1]}-${examDetails.heldin_month}${examDetails.heldin_year}-(${examDetails.exam_type.split(' ')[0]}).pdf`;
        } else {
          pdfFileName = `Marks-Report-${examDetails.branch.slice(0, 4)}-${examDetails.pattern}-Sem${examDetails.semester.split(' ')[1]}-${examDetails.heldin_month}${examDetails.heldin_year}-(${examDetails.exam_type.split(' ')[0]}).pdf`;
        }

        // Create PDF document with larger page size
        const doc = new PDFDocument({
          size: 'A4',
          margin: 50,
          bufferPages: true
        });
        
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filePath = path.join(process.env.USERPROFILE || process.env.HOME, 'Downloads', pdfFileName);
        
        doc.pipe(fs.createWriteStream(filePath));

        // Add title with styling
        doc.font('Helvetica-Bold')
           .fontSize(20)
           .text(reportType === 'subject' ? `${subjectName} Marks Report` : 'Complete Marks Report', 
                 { align: 'center' });
        doc.moveDown();

        // Add exam details with better formatting
        if (examDetails) {
          // Draw a light gray background for the header section
          const headerStartY = doc.y;
          doc.fillColor('#f8f8f8')
             .rect(50, headerStartY, 500, 120)
             .fill();
          
          const detailsStartX = 70;
          let detailsY = headerStartY + 15;
          const columnWidth = 250;
          
          // First column - Exam Details
          doc.font('Helvetica-Bold').fontSize(12).fillColor('#000000');
          doc.text('Exam Details:', detailsStartX, detailsY);
          doc.font('Helvetica').fontSize(11).moveDown(0.5);
          doc.text(`Exam Type: ${examDetails.exam_type}`, detailsStartX, doc.y);
          doc.moveDown(0.3);
          doc.text(`Branch: ${examDetails.branch}`, detailsStartX, doc.y);
          doc.moveDown(0.3);
          doc.text(`Held In: ${examDetails.heldin_month} ${examDetails.heldin_year}`, detailsStartX, doc.y);
          
          // Second column - Academic Details
          doc.font('Helvetica-Bold').fontSize(12);
          doc.text('Academic Details:', detailsStartX + columnWidth, detailsY);
          doc.font('Helvetica').fontSize(11);
          doc.text(`Pattern: ${examDetails.pattern}`, detailsStartX + columnWidth, detailsY + 25);
          doc.text(`Year: ${examDetails.year}`, detailsStartX + columnWidth, detailsY + 45);
          doc.text(`Semester: ${examDetails.semester}`, detailsStartX + columnWidth, detailsY + 65);
        }
        
        doc.moveDown(2);

        // Helper function to draw table cell
        const drawTableCell = (text, x, y, width, align = 'left', isHeader = false) => {
          // Draw cell border
          doc.rect(x, y, width, rowHeight).stroke();
          
          // Draw cell background if header or alternate row
          if (isHeader) {
            doc.fillColor('#e8e8e8').rect(x, y, width, rowHeight).fill();
          }
          
          // Reset text color and draw text
          doc.fillColor('#000000')
             .text(text || '-',
                  x + 5,
                  y + (rowHeight - doc.currentLineHeight()) / 2,
                  {
                    width: width - 10,
                    align: align,
                    lineBreak: false
                  });
        };

        // Table configuration
        const tableTop = doc.y + 20;
        const tableLeft = 50;
        const columnWidths = {
          studentName: 180,
          subject: 140,
          credit: 70,
          eseMarks: 70,
          iaMarks: 70
        };
        const rowHeight = 30;
        let currentY = tableTop;

        // Function to draw table header
        const drawTableHeader = (y) => {
          let x = tableLeft;
          doc.font('Helvetica-Bold').fontSize(11);
          
          // Draw header cells
          drawTableCell('Student Name', x, y, columnWidths.studentName, 'left', true);
          x += columnWidths.studentName;
          drawTableCell('Subject', x, y, columnWidths.subject, 'left', true);
          x += columnWidths.subject;
          drawTableCell('Credit', x, y, columnWidths.credit, 'center', true);
          x += columnWidths.credit;
          drawTableCell('ESE Marks', x, y, columnWidths.eseMarks, 'center', true);
          x += columnWidths.eseMarks;
          drawTableCell('IA Marks', x, y, columnWidths.iaMarks, 'center', true);
          
          return y + rowHeight;
        };

        // Draw initial header
        currentY = drawTableHeader(currentY);

        // Draw table data
        doc.font('Helvetica').fontSize(10);
        data.forEach((row, index) => {
          // Check if we need a new page
          if (currentY > 750) {
            doc.addPage();
            currentY = 50;
            currentY = drawTableHeader(currentY);
          }

          let x = tableLeft;
          
          // Draw row cells
          drawTableCell(row.student_name || 'Unknown', x, currentY, columnWidths.studentName);
          x += columnWidths.studentName;
          drawTableCell(row.subject, x, currentY, columnWidths.subject);
          x += columnWidths.subject;
          drawTableCell(row.credit?.toString(), x, currentY, columnWidths.credit, 'center');
          x += columnWidths.credit;
          drawTableCell(row.ese_marks?.toString(), x, currentY, columnWidths.eseMarks, 'center');
          x += columnWidths.eseMarks;
          drawTableCell(row.ia_marks?.toString(), x, currentY, columnWidths.iaMarks, 'center');

          currentY += rowHeight;
        });

        // Add summary section at the bottom with a border
        doc.moveDown(2);
        const summaryStartY = doc.y;
        doc.fillColor('#f8f8f8')
           .rect(50, summaryStartY, 500, reportType === 'subject' ? 80 : 50)
           .fill();
        
        doc.fillColor('#000000')
           .font('Helvetica-Bold')
           .fontSize(11)
           .text('Report Summary:', 70, summaryStartY + 15);
        doc.font('Helvetica').fontSize(10);
        doc.text(`Total Students: ${data.length}`, 90, doc.y);
        
        if (reportType === 'subject') {
          doc.moveDown(0.5);
          doc.text(`Subject: ${subjectName}`, 90, doc.y);
          // Calculate and display averages
          const avgEse = data.reduce((sum, row) => sum + (Number(row.ese_marks) || 0), 0) / data.length;
          const avgIa = data.reduce((sum, row) => sum + (Number(row.ia_marks) || 0), 0) / data.length;
          doc.text(`Average ESE Marks: ${avgEse.toFixed(2)}`, 90, doc.y);
          doc.text(`Average IA Marks: ${avgIa.toFixed(2)}`, 90, doc.y);
        }

        // Add footer with page numbers and timestamp
        const pages = doc.bufferedPageRange();
        for (let i = 0; i < pages.count; i++) {
          doc.switchToPage(i);
          doc.fontSize(8)
             .text(
               `Page ${i + 1} of ${pages.count} | Generated on: ${new Date().toLocaleString()}`,
               50,
               800,
               { align: 'center' }
             );
        }

        // Finalize PDF
        doc.end();

        console.log('PDF file generated successfully:', filePath);
        resolve({ success: true, filePath });
      });
    } catch (error) {
      console.error('Error generating PDF file:', error);
      reject(error);
    }
  });
});

ipcMain.handle("export-report-excel", async (event, { examId, subjectName, reportType, data }) => {
  return new Promise(async (resolve, reject) => {
    try {
      const examQuery = `
        SELECT 
          e.exam_type,
          e.branch,
          e.heldin_month,
          e.heldin_year,
          e.pattern,
          e.year,
          e.semester
        FROM exams e
        WHERE e.exam_id = ?
      `;

      db.get(examQuery, [examId], async (err, examDetails) => {
        if (err) {
          console.error("Error fetching exam details:", err);
          return reject(err);
        }

        // Generate filename based on the format
        let excelFileName;
        if (reportType === 'subject') {
          excelFileName = `${subjectName}-${examDetails.branch.slice(0, 4)}-${examDetails.pattern}-Sem${examDetails.semester.split(' ')[1]}-${examDetails.heldin_month}${examDetails.heldin_year}-(${examDetails.exam_type.split(' ')[0]}).xlsx`;
        } else {
          excelFileName = `Marks-Report-${examDetails.branch.slice(0, 4)}-${examDetails.pattern}-Sem${examDetails.semester.split(' ')[1]}-${examDetails.heldin_month}${examDetails.heldin_year}-(${examDetails.exam_type.split(' ')[0]}).xlsx`;
        }

        // Create workbook
        const wb = XLSX.utils.book_new();
        
        // Create header rows with formatting
        const headerRows = [
          [{ v: 'Marks Report', t: 's' }],
          [''],
          [{ v: 'Exam Details:', t: 's' }, '', { v: 'Academic Details:', t: 's' }],
          [
            { v: `Exam Type: ${examDetails?.exam_type || ''}`, t: 's' }, 
            '', 
            { v: `Pattern: ${examDetails?.pattern || ''}`, t: 's' }
          ],
          [
            { v: `Branch: ${examDetails?.branch || ''}`, t: 's' }, 
            '', 
            { v: `Year: ${examDetails?.year || ''}`, t: 's' }
          ],
          [
            { v: `Held In: ${examDetails?.heldin_month || ''} ${examDetails?.heldin_year || ''}`, t: 's' }, 
            '', 
            { v: `Semester: ${examDetails?.semester || ''}`, t: 's' }
          ],
          ['']
        ];

        if (reportType === 'subject') {
          headerRows.push([{ v: `Subject: ${subjectName}`, t: 's' }], ['']);
        }

        // Add table headers
        headerRows.push([
          { v: 'Student Name', t: 's' },
          { v: 'Subject', t: 's' },
          { v: 'Credit', t: 's' },
          { v: 'ESE Marks', t: 's' },
          { v: 'IA Marks', t: 's' }
        ]);

        // Convert data to rows
        const dataRows = data.map(row => [
          { v: row.student_name || 'Unknown', t: 's' },
          { v: row.subject, t: 's' },
          { v: row.credit || '-', t: 's' },
          { v: row.ese_marks || '-', t: 'n' },
          { v: row.ia_marks || '-', t: 'n' }
        ]);

        // Calculate totals and averages for subject-wise report
        if (reportType === 'subject') {
          const totalEse = data.reduce((sum, row) => sum + (Number(row.ese_marks) || 0), 0);
          const totalIa = data.reduce((sum, row) => sum + (Number(row.ia_marks) || 0), 0);
          const avgEse = totalEse / data.length;
          const avgIa = totalIa / data.length;

          dataRows.push(
            [''], // Empty row for spacing
            [
              { v: 'Totals:', t: 's' },
              '',
              '',
              { v: totalEse, t: 'n' },
              { v: totalIa, t: 'n' }
            ],
            [
              { v: 'Averages:', t: 's' },
              '',
              '',
              { v: Number(avgEse.toFixed(2)), t: 'n' },
              { v: Number(avgIa.toFixed(2)), t: 'n' }
            ]
          );
        }

        // Add summary section
        dataRows.push(
          [''], // Empty row for spacing
          [{ v: 'Report Summary', t: 's' }],
          [{ v: `Total Students: ${data.length}`, t: 's' }],
          [{ v: `Generated on: ${new Date().toLocaleString()}`, t: 's' }]
        );

        // Combine all rows
        const allRows = [...headerRows, ...dataRows];

        // Create worksheet
        const ws = XLSX.utils.aoa_to_sheet(allRows);

        // Set column widths
        ws['!cols'] = [
          { wch: 30 }, // Student Name
          { wch: 25 }, // Subject
          { wch: 10 }, // Credit
          { wch: 12 }, // ESE Marks
          { wch: 12 }  // IA Marks
        ];

        // Define styles
        const styles = {
          title: {
            font: { bold: true, sz: 16, color: { rgb: "000000" } },
            fill: { fgColor: { rgb: "E0E0E0" } },
            alignment: { horizontal: "center" }
          },
          header: {
            font: { bold: true },
            fill: { fgColor: { rgb: "F2F2F2" } }
          },
          tableHeader: {
            font: { bold: true },
            fill: { fgColor: { rgb: "D9D9D9" } },
            alignment: { horizontal: "center" }
          }
        };

        // Merge cells for title
        ws['!merges'] = [
          { s: { r: 0, c: 0 }, e: { r: 0, c: 4 } }  // Merge first row across all columns
        ];

        // Apply styles
        const range = XLSX.utils.decode_range(ws['!ref']);
        for (let R = range.s.r; R <= range.e.r; R++) {
          for (let C = range.s.c; C <= range.e.c; C++) {
            const cell_address = { c: C, r: R };
            const cell_ref = XLSX.utils.encode_cell(cell_address);
            
            if (!ws[cell_ref]) continue;

            // Initialize style if not exists
            if (!ws[cell_ref].s) ws[cell_ref].s = {};

            // Apply styles based on row position
            if (R === 0) {
              ws[cell_ref].s = styles.title;
            } else if (R === 2 || R === headerRows.length - 1) {
              ws[cell_ref].s = styles.header;
            }
          }
        }

        // Add the worksheet to workbook
        XLSX.utils.book_append_sheet(wb, ws, "Marks Report");

        // Save the file
        const filePath = path.join(process.env.USERPROFILE || process.env.HOME, 'Downloads', excelFileName);
        XLSX.writeFile(wb, filePath, { bookType: 'xlsx', bookSST: false, type: 'binary' });

        console.log('Excel file generated successfully:', filePath);
        resolve({ success: true, filePath });
      });
    } catch (error) {
      console.error('Error generating Excel file:', error);
      reject(error);
    }
  });
});
