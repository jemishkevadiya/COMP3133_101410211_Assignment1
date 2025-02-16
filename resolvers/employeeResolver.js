const Employee = require("../models/Employee");
const fs = require("fs");
const path = require("path");

const employeeResolver = {
    Query: {
        // Retrive all employee 
        getAllEmployees: async (_, __, context) => {
            if (!context.user) throw new Error("Unauthorized! Please log in.");

            return await Employee.find();
        },

        // Find an employee by thier ID
        searchEmployeeById: async (_, { id }, context) => {
            if (!context.user) throw new Error("Authentication required!");

            const employee = await Employee.findById(id);
            if (!employee) throw new Error("No employee found with id: ${id}");
            return employee;
        },

        // Find employes based on designation or department
        searchEmployeeByDesignationOrDepartment: async (_, { designation, department }, context) => {
            if (!context.user) throw new Error("Unauthorized");

            const query = {};
            if (designation) query.designation = designation;
            if (department) query.department = department;

            return await Employee.find(query);
        }
    },
    Mutation: {

        // Add a new employee using employee objectID
        addEmployee: async (_, { first_name, last_name, email, gender, designation, salary, date_of_joining, department, employee_photo }, context) => {
            if (!context.user) throw new Error("Unauthorized");

            let photoPath = null;
    
            if (employee_photo) {
                const { filename, createReadStream } = await employee_photo.promise;
                
                if (!filename) throw new Error("Invalid file upload");

                const uploadDir = path.join(__dirname, "../uploads");

                // Ensure the uploads directory exists
                if (!fs.existsSync(uploadDir)) {
                    fs.mkdirSync(uploadDir, { recursive: true });
                }

                // Ensure file path is correct
                const filePath = path.join(uploadDir, filename);
                const stream = createReadStream();

                await new Promise((resolve, reject) => {
                    const writeStream = fs.createWriteStream(filePath);
                    stream.pipe(writeStream);
                    writeStream.on("finish", resolve);
                    writeStream.on("error", reject);
                });

                photoPath = `/uploads/${filename}`; 
            } 

            // Create the new employee document in MongoDB
            const newEmployee = new Employee({
                first_name,
                last_name,
                email,
                gender,
                designation,
                salary,
                date_of_joining,
                department,
                employee_photo: photoPath
            });

            return await newEmployee.save();
        },

        // Update Employee by ID
        updateEmployee: async (_, { id, first_name, last_name, email, gender, designation, salary, date_of_joining, department, employee_photo }, context) => {
            if (!context.user) throw new Error("Unauthorized");

            const updatedFields = {};
            if (first_name) updatedFields.first_name = first_name;
            if (last_name) updatedFields.last_name = last_name;
            if (email) updatedFields.email = email;
            if (gender) updatedFields.gender = gender;
            if (designation) updatedFields.designation = designation;
            if (salary) updatedFields.salary = salary;
            if (date_of_joining) updatedFields.date_of_joining = date_of_joining;
            if (department) updatedFields.department = department;

            if (employee_photo) {
                const { filename, createReadStream } = await employee_photo.promise;
                const uploadDir = path.join(__dirname, "../uploads");

                if (!fs.existsSync(uploadDir)) {
                    fs.mkdirSync(uploadDir, { recursive: true });
                }

                const filePath = path.join(uploadDir, filename);
                const stream = createReadStream();

                await new Promise((resolve, reject) => {
                    const writeStream = fs.createWriteStream(filePath);
                    stream.pipe(writeStream);
                    writeStream.on("finish", resolve);
                    writeStream.on("error", reject);
                });

                updatedFields.employee_photo = `/uploads/${filename}`; 
            }

            const updatedEmployee = await Employee.findByIdAndUpdate(id, updatedFields, { new: true });

            if (!updatedEmployee) throw new Error("Employee not found");

            return updatedEmployee;
        },

        // delete employee using employee objectID
        deleteEmployee: async (_, { id }, context) => {
            if (!context.user) throw new Error("Unauthorized");

            const deletedEmployee = await Employee.findByIdAndDelete(id);
            if (!deletedEmployee) throw new Error("Employee not found");

            return "Employee deleted successfully";
        }
    }
};

module.exports = employeeResolver;
