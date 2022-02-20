const inquirer = require('inquirer');
const db = require('./db/conection.js')
const consoleTable = require("console.table");

function start() {
    inquirer
        .prompt([{
            type: "list",
            name: "todo",
            message: "What would you like to do?",
            choices: [
                "View all departments",
                "View all roles",
                "View all employees",
                "Add a department",
                "Add a role",
                "Add an employee",
                "Update an employee role",
            ],
        }, ])
        .then((choice) => {
            switch (choice.todo) {
                case "View all departments":
                    viewAllDepartments();
                    break;

                case "View all roles":
                    viewAllRoles();
                    break;

                case "View all employees":
                    viewAllEmployees();
                    break;

                case "Add a department":
                    addDepartment();
                    break;

                case "Add a role":
                    addRole();
                    break;

                case "Add an employee":
                    addEmployee();
                    break;

                case "Update an employee role":
                    updateRole();
                    break;
            }
        });
}

// view all departments
function viewAllDepartments() {
    db.query('SELECT * FROM department', (err, data) => {
        console.log('\n')
        console.table(data)
    })
    start();
}
// view all roles
function viewAllRoles() {
    db.query(`SELECT role.id, role.title, role.salary, department.name AS department FROM role
        LEFT JOIN department ON (department.id = role.department_id)
        ORDER BY role.id;`, (err, data) => {
        console.log('\n')
        console.table(data)
    })

    start();
}

// view all employees
function viewAllEmployees() {
    db.query(`SELECT employee.id, employee.first_name, employee.last_name, role.title, department.name AS department, role.salary, CONCAT(manager.first_name, ' ', manager.last_name) AS manager
    FROM employee
    LEFT JOIN employee manager on manager.id = employee.manager_id
    INNER JOIN role ON (role.id = employee.role_id)
    INNER JOIN department ON (department.id = role.department_id)
    ORDER BY employee.id;`, (err, data) => {
        console.log('\n')
        console.table(data)
    })
    start();
}

// add a department
function addDepartment() {
    inquirer
        .prompt({
            type: "input",
            message: "New department name:",
            name: "new_department",
        })
        .then(function(answer) {
            db.query(
                    `INSERT INTO department SET ?`, {
                        name: answer.new_department,
                    },
                    function(err, answer) {
                        if (err) {
                            throw err;
                        }
                    }
                ),
                console.log("New department added to database.");
            console.log("\n");
            console.table('New department', answer);
            start();
        });
}
// add a role
addRole = () => {
    inquirer
        .prompt([{
                type: "input",
                message: "New role name:",
                name: "new_role"
            },
            {
                type: "number",
                message: "New role salary:",
                name: "new_salary"
            }
        ])
        .then(answer => {
            const params = [answer.new_role, answer.new_salary];
            const roleQuery = `SELECT name, id FROM department`;
            db.query(roleQuery, (err, data) => {
                if (err) throw err;
                const depts = data.map(({ name, id }) => ({ name: name, value: id }));
                inquirer.prompt([{
                        type: 'list',
                        name: 'new_dept',
                        message: "New role department:",
                        choices: depts
                    }])
                    .then(deptChoice => {
                        const department = deptChoice.new_dept;
                        params.push(department);
                        console.log(params);
                        const sql = `INSERT INTO role (title, salary, department_id) VALUES (?, ?, ?)`;
                        db.query(sql, params, (err, result) => {
                            if (err) throw err;
                            console.log("\nNew role " + answer.new_role + "added to database.\n");
                            start();
                        })
                    })
            })
        })
};

start();