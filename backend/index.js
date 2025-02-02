const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const fileUpload = require('express-fileupload');
const XLSX = require('xlsx');

const app = express();
const port = process.env.PORT || 5000;

app.set('view engine', 'ejs');

// Middlewares
const corsOptions = {
  origin: 'https://fyp-ashen-chi.vercel.app', // ✅ Must be explicit, no '*'
  methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'], // ✅ Array format
  credentials: true, // ✅ If using cookies or authentication
  allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization'], // ✅ Array format
  exposedHeaders: ['Authorization'], // ✅ Array format
  maxAge: 3600,
  preflightContinue: false,
};

app.use(cors(corsOptions));

// ✅ Allow preflight requests
app.options('*', cors(corsOptions));

app.use(bodyParser.json());
app.use(fileUpload({
  useTempFiles: true,
}));
app.use(bodyParser.urlencoded({ extended: true }));

// MongoDB connection
// const mongoURI = 'mongodb+srv://hamza:hamza1234@lms.3qvhk.mongodb.net/lms?retryWrites=true&w=majority&appName=lms';
// const mongoURI = 'mongodb+srv://hamza:hamza1234@lms.3qvhk.mongodb.net/';
// const mongoURI = 'mongodb://127.0.0.1:27017/lms';
// mongoose.connect("mongodb+srv://hamza:hamza1234@lms.3qvhk.mongodb.net/lms?retryWrites=true&w=majority&appName=lms");

mongoose
  .connect(
    // "mongodb+srv://hamza:hamza1234@lms.3qvhk.mongodb.net/lms?retryWrites=true&w=majority&appName=lms"
    "mongodb+srv://hamza:hamza1234@lms.3qvhk.mongodb.net/lms?retryWrites=true&w=majority&appName=lms"
    // 'mongodb://127.0.0.1:27017/lms'
  )
  .then((data) => {
    console.log("MongoDB Connected");
  });

// const connection = mongoose.connection;
// connection.once('open', () => {
//   console.log('MongoDB database connection established successfully');
// });

// Routes
const loginRoute = require('./routes/Login');
const superRoute = require('./routes/Supervisor');
const committeeRoute = require('./routes/Committe/Committee');
const vivaRoute = require('./routes/Committe/Viva');
const meetingRoute = require('./routes/Meeting');
const projectRoute = require('./routes/ProjectRequest');
const adminRoute = require('./routes/Admin');
const externalRoute = require('./routes/External');
const allocateRoute = require('./routes/Allocation');
const rules = require('./routes/Rules');

app.use('/student', loginRoute);
app.use('/supervisor', superRoute);
app.use('/committee', committeeRoute);
app.use('/viva', vivaRoute);
app.use('/meeting', meetingRoute);
app.use('/projects', projectRoute);
app.use('/admin', adminRoute);
app.use('/external', externalRoute);
app.use('/allocation', allocateRoute);
app.use('/rules', rules);

const User = require('./models/User')
const Supervisor = require('./models/Supervisor')
const Committee = require('./models/Committee')
const Admin = require('./models/Admin')
const External = require('./models/External')

const bcrypt = require('bcrypt');

const userExist = async (user, userType) => {

  if (userType === 'External') {
    if (user && (user.username || user.email)) {
      const external = await External.findOne({
        $or: [
          { username: { $regex: new RegExp("^" + user.username.toLowerCase(), "i") } },
          { email: user.email }
        ]
      });
      return external ? true : false;
    }
  }
  if (userType === 'Supervisor') {
    if (user && (user.username || user.email)) {
      const external = await Supervisor.findOne({
        $or: [
          { username: { $regex: new RegExp("^" + user.username.toLowerCase(), "i") } },
          { email: user.email }
        ]
      });
      return external ? true : false;
    }
  }
  if (userType === 'Admin') {
    if (user && (user.username || user.email)) {
      const admin = await Admin.findOne({
        $or: [
          { username: { $regex: new RegExp("^" + user.username.toLowerCase(), "i") } },
          { email: user.email }
        ]
      });
      return admin ? true : false;
    }
  }
  if (userType === 'Committee') {
    if (user && (user.username || user.email)) {
      const committee = await Committee.findOne({
        $or: [
          { username: { $regex: new RegExp("^" + user.username.toLowerCase(), "i") } },
          { email: user.email }
        ]
      });
      return committee ? true : false;
    }
  }
  if (userType === 'User') {
    if (user && (user.cnic || user.rollNo || user.email)) {
      const committee = await User.findOne({
        $or: [
          { rollNo: user.rollNo },
          { email: user.email },
          { cnic: user.cnic }
        ]
      });
      return committee ? true : false;
    }
  }

}

app.post('/upload/:userType', async (req, res) => {
  const { userType } = req.params;
  if (!req.files || !req.files.excelFile) {
    return res.status(400).json({ success: false, message: 'No files were uploaded.' });
  }

  console.log('file is ', req.files.excelFile)
  const excelFile = req.files.excelFile;
  const workbook = XLSX.readFile(excelFile.tempFilePath, { cellDates: true });
  const sheetName = workbook.SheetNames[0];
  let excelData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
  console.log('data is ', excelData)

  try {
    // to chcek for unique email and password
    const uniqueEmails = new Set();
    const uniqueUsernames = new Set();
    const uniqueRollNos = new Set();
    const uniqueCnics = new Set();


    // Validate all entries against the schema
    for (let i = 0; i < excelData.length; i++) {
      const user = excelData[i];

      // Check for duplicate email and username for Admin, Committee, External, and Supervisor
      if (userType === 'Admin' || userType === 'Committee' || userType === 'External' || userType === 'Supervisor') {
        if (uniqueEmails.has(user.email)) {
          return res.status(400).json({ success: false, message: 'Duplicate email found.' });
        }
        uniqueEmails.add(user.email);
        
        if (user.username &&!/^[a-zA-Z0-9]+$/.test(user.username)) {
          return res.status(400).json({ success: false, message: 'Username should be alphanumeric.' });
        }
        if (user.username && uniqueUsernames.has(user.username.toLowerCase().replace(/\s+/g, ''))) {
          return res.status(400).json({ success: false, message: 'Duplicate username found.' });
        }
        uniqueUsernames.add(user.username);
      }

      if (userType === 'User') {
        if (user.rollNo) {
          if (uniqueRollNos.has(user.rollNo)) {
            return res.status(400).json({ success: false, message: 'Duplicate roll number found.' });
          }
          uniqueRollNos.add(user.rollNo);
        }
        if (user.email) {
          if (uniqueEmails.has(user.email)) {
            return res.status(400).json({ success: false, message: 'Duplicate email found.' });
          }
          uniqueEmails.add(user.email);
        }

        if (user.cnic) {
          if (uniqueCnics.has(user.cnic)) {
            return res.status(400).json({ success: false, message: 'Duplicate CNIC found.' });
          }
          uniqueCnics.add(user.cnic);
        }

      }

      const isValid = await userExist(user, userType);
      if (isValid) {
        return res.status(400).json({ success: false, message: 'Duplicate User in the excel sheet.' });
      }
    }

    // Hash passwords before storing
    if (userType === 'Committee' || userType === 'Supervisor' || userType === 'Admin' || userType === 'External') {
      excelData = excelData.map((user) => {

        if (userType === 'External' || userType === 'Supervisor') {
          if (user.fname || user.lname) {
            throw new Error('First and last names are not attributes of supervisor')
          }
          if (!user.name) {
            throw new Error("Name can not be empty");
          }

          if ((user.name && user.name.toString().length < 3)) {
            throw new Error('Name be at least 3 characters');
          }
          if (!/^[a-zA-Z]+$/.test(user.name.trim())) {
            throw new Error('First name should contain only alphabetic characters');
          }
        }

        if (userType === 'Committee' || userType === 'Admin') {
          if (!user.fname || !user.lname) {
            throw new Error("First name and Last Name can not be empty")
          }
          if ((user.fname && user.fname.toString().length < 3) || (user.lname && user.lname.toString().length < 3)) {
            throw new Error('Name be at least 3 characters');
          }
          if (user.fname.trim().toLowerCase() === user.lname.trim().toLowerCase()) {
            throw new Error('First name and last name should be different')
          }
          if (!/^[a-zA-Z]+$/.test(user.fname.trim())) {
            throw new Error('First name should contain only alphabetic characters');
          }

          if (!/^[a-zA-Z]+$/.test(user.lname.trim())) {
            throw new Error('Last name should contain only alphabetic characters');
          }
        }
        if (userType === 'Admin') {
          if (user.department || user.designation) {
            throw new Error('Department or Designation are not attributes of admin')
          }
        } else if (userType === 'Committee' || userType === 'Supervisor' || userType === 'External') {
          const validDesignations = ['Professor', 'Assistant Professor', 'Lecturer'];
          const validDepartments = ['Computer Science', 'Other'];

        if (user.department) {
          const formattedDepartment = user.department
            .toLowerCase()
            .trim()
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
        
          if (!validDepartments.includes(formattedDepartment)) {
            throw new Error('Invalid department. Valid departments are Computer Science, Other.');
          }
        }
        if (user.designation) {
          const formatedDesignation = user.designation
            .toLowerCase()
            .trim()
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
        
          if (!validDesignations.includes(formatedDesignation)) {
            throw new Error(`Invalid deisgntaion. Valid departments are 'Professor', 'Assistant Professor', 'Lecturer'`);
          }
        } 
        }
        if (userType === 'Supervisor') {
          if (!user.slots) {
            throw new Error('Department field cannot be empty')
          }
          if (user.slots && user.slots < 0) {
            throw new Error('Slot number must be greater than or equal to zero')
          }
        }
        if (userType !== 'External') {
          if (!user.password) {
            throw new Error('Check out every field no entry should be null in other');
          }
        }
        if (!user.email) {
          throw new Error('Please provide a valid Email address for all users');
        }

        if (userType === 'External') {
          if (user.password) {
            throw new Error('Password is not an attribute of External.');
          }
          if (user.slots) {
            throw new Error('Slots is not an attribute of external');
          }
        }

        if (user.password) {
          let password = user.password.toString();
          // Validate password length
          if (password.length < 6) {
            throw new Error('Password must be at least 6 characters.');
          }

          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(user.email)) {
            throw new Error('Invalid email address format.');
          }

          // Hash the password using bcrypt
          const saltRounds = 10;
          const hashedPassword = bcrypt.hashSync(password, saltRounds);
          return {
            ...user,
            password: hashedPassword,
          };
        }

        // Return the user object unchanged if no conditions are met
        return user;
      });

    } else if (userType === 'User') {
      // For users, hash 'cnic' and add it to 'password'
      excelData = excelData.map((user) => {
        if (!user.name || !user.email || !user.cnic || !user.rollNo || !user.father || !user.semester || !user.department) {
          throw new Error('Check every field no entry should be null');
        }
        const validDepartments = ['Computer Science', 'Other'];

        if (!/^[a-zA-Z]+$/.test(user.name.trim())) {
          throw new Error('First name should contain only alphabetic characters');
        }
        if (user.department) {
          const formattedDepartment = user.department
            .toLowerCase()
            .trim()
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
        
          if (!validDepartments.includes(formattedDepartment)) {
            throw new Error('Invalid department. Valid departments are Computer Science, Other.');
          }
        }    

        const rollNoPattern = /^[0-9]{4}-BSCS-[0-9]{2}$/;
        if (!rollNoPattern.test(user.rollNo)) {
          throw new Error('Roll Number should be in the format XXXX-BSCS-XX');
        }
        const batchPattern = /^[0-9]{4}-[0-9]{4}$/;

        if (user.batch && !batchPattern.test(user.batch)) {
          throw new Error('Invalid batch format. Valid format is XXXX-XXXX.');
        }

        if ((user.name && user.name.toString().length < 3) || (user.father && user.father.toString().length < 3)) {
          throw new Error('Name/Father Name should be atleast 3 characters');
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(user.email)) {
          throw new Error('Invalid email address format.');
        }
        if (isNaN(user.semester)) {
          throw new Error('Semester should be a number');
        }
        if (!(user.semester >= 1 && user.semester <= 8)) {
          throw new Error('Semester should be between 1 and 8.');
        }

        console.log("cnic is ", user.cnic)
        console.log("cnic is ", user.cnic.toString().length)
        if (user.cnic && user.cnic.toString().length===13) {
          // Hash the 'cnic' using bcrypt and add it to 'password'
          const saltRounds = 10;
          const cnic = user.cnic.toString();
          const hashedCnic = bcrypt.hashSync(cnic, saltRounds);
          return {
            ...user,
            password: hashedCnic,
          };
        }else{
          throw new Error('CNIC can not be empty or less/greater than 13 digits');
        }

      });
    } else {
      return res.status(400).json({ success: false, message: 'Invalid schema type.' });
    }

    switch (userType) {
      case 'User':
        await User.insertMany(excelData);
        break;
      case 'Supervisor':
        await Supervisor.insertMany(excelData);
        break;
      case 'Committee':
        await Committee.insertMany(excelData);
        break;
      case 'Admin':
        await Admin.insertMany(excelData);
        break;
      case 'External':
        await External.insertMany(excelData);
        break;
      default:
        return res.status(400).json({ success: false, message: 'Invalid schema type.' });
    }

    return res.json({ success: true, message: 'File uploaded and data imported to MongoDB.' });
  } catch (error) {
    console.error('Error occurred while processing data:', error);
    return res.status(400).json({ success: false, message: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});
