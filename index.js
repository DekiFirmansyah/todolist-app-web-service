const express = require('express')
const bodyParser = require('body-parser')
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

// get config vars
dotenv.config();

const userModel = require('./models').user
const todoModel = require('./models').todolist

const app = express()
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

const port = 3030

// Check Authorization
let checkUser = (req, res, next) => {
    let response = {}
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]

    if (token == null) {
        response = {
            status: "ERROR",
            message: "Authorization Failed"
        }
        res.status(401).json(response)
        return
    }

    jwt.verify(token, process.env.TOKEN_SECRET, (error, user) => {
        console.log(error)
        if (error) {
            response = {
                status: "ERROR",
                message: error
            }
            res.status(401).json(response)
            return
        }
        req.user = user
        next()
    })
}

// Membuat user baru / register
app.post("/register", async (req, res) => {
    let response = {}
    let code = 200
    if (req.body.email == "" || req.body.email == undefined) {
        code = 422
        response = {
            status: "SUCCESS",
            message: "email cannot be blank"
        }

    }
    if (req.body.password == "" || req.body.password == undefined) {
        code = 422
        response = {
            status: "SUCCESS",
            message: "password cannot be blank"
        }
    }
    if (req.body.role == "" || req.body.role == undefined) {
        code = 422
        response = {
            status: "SUCCESS",
            message: "role cannot be blank"
        }
    }
    try {
        const newUser = await userModel.create({
            email: req.body.email,
            password: req.body.password,
            role: req.body.role
        });

        response = {
            status: "SUCCESS",
            message: "Create User",
            data: newUser
        }
    } catch (error) {
        code = 422
        response = {
            status: "ERROR",
            message: error.parent.sqlMessage
        }
    }

    res.status(code).json(response)
    return
})

// Login dengan mendapatkan token
app.post("/login", async (req, res) => {
    let email = req.body.email;
    let password = req.body.password;

    let response = {};
    let code = 200;

    try {
        // Cari pengguna berdasarkan email
        const users = await userModel.findOne({
            where: {
                email: email
            },
        });

        if (!users) {
            code = 401;
            response = {
                status: "ERROR",
                message: "User not Found"
            };
            res.status(code).json(response);
            return;
        }

        // Membandingkan password
        if (users.password != password) {
            code = 401;
            response = {
                status: "ERROR",
                message: "ICombination Email and Password not Match"
            };
            res.status(code).json(response);
            return;
        }

        // Jika autentikasi berhasil, buat token JWT
        let jwt_payload = {
            id: users.id
        }

        let access_token = jwt.sign(jwt_payload, process.env.TOKEN_SECRET, { expiresIn: '1h' });
        response = {
            status: "SUCCESS",
            message: "Login successful",
            access_token: access_token
        }
        res.json(response)

    } catch (error) {
        code = 500;
        response = {
            status: "ERROR",
            message: "Internal Server Error"
        };
    }

    res.status(code).json(response);
});

app.use(checkUser)

// Menampilkan data seluruh user
app.get("/users", async (req, res) => {

    const users = await userModel.findAll();
    const response = {
        status: "SUCCESS",
        message: "Get All User",
        meta: {
            total: users.length
        },
        data: users
    }

    res.status(200).json(response)
    return
})

// Menampilkan data user sesuai ID
app.get("/users/:id", async (req, res) => {
    let response = {}
    const users = await userModel.findAll({
        where: {
            id: req.params.id
        }
    });

    if (users.length == 0) {
        response = {
            status: "SUCCESS",
            message: "Data not Found"
        }
    } else {
        response = {
            status: "SUCCESS",
            message: "Get Detail User",
            data: users
        }
    }

    res.status(200).json(response)
    return
})

// Menghapus data user sesuai ID
app.delete("/users/:id", async (req, res) => {
    let response = {}
    let code = 200
    try {
        const newUser = await userModel.destroy({
            where: {
                id: req.params.id
            }
        });

        response = {
            status: "SUCCESS",
            message: "Delete User",
            data: newUser
        }
    } catch (error) {
        code = 422
        response = {
            status: "ERROR",
            message: error.parent.sqlMessage
        }
    }

    res.status(code).json(response)
    return
})

// Update data user sesuai ID
app.put("/users/:id", async (req, res) => {
    let response = {}
    let code = 200
    if (req.body.email == "" || req.body.email == undefined) {
        code = 422
        response = {
            status: "SUCCESS",
            message: "email cannot be blank"
        }

    }
    if (req.body.password == "" || req.body.password == undefined) {
        code = 422
        response = {
            status: "SUCCESS",
            message: "password cannot be blank"
        }
    }
    if (req.body.role == "" || req.body.role == undefined) {
        code = 422
        response = {
            status: "SUCCESS",
            message: "role cannot be blank"
        }
    }
    const users = await userModel.findOne({
        where: {
            id: req.params.id
        }
    });

    if (!users) {
        response = {
            status: "SUCCESS",
            message: "Data not Found"
        }
    } else {
        users.email = req.body.email
        users.password = req.body.password
        users.role = req.body.role
        users.save()
        response = {
            status: "SUCCESS",
            message: "Update User",
            data: users
        }
    }

    res.status(code).json(response)
    return
})

// Menampilkan seluruh data todolist
app.get("/todolists", async (req, res) => {

    const todos = await todoModel.findAll();
    const response = {
        status: "SUCCESS",
        message: "Get All Todolist",
        meta: {
            total: todos.length
        },
        data: todos
    }

    res.status(200).json(response)
    return
})

// Menampilkan data todolist sesuai ID
app.get("/todolists/:id", async (req, res) => {
    let response = {}
    const todos = await todoModel.findAll({
        where: {
            id: req.params.id
        }
    });

    if (todos.length == 0) {
        response = {
            status: "SUCCESS",
            message: "Data not Found"
        }
    } else {
        response = {
            status: "SUCCESS",
            message: "Get Detail Todolist",
            data: todos
        }
    }

    res.status(200).json(response)
    return
})

// Membuat / menambahkan data baru pada todolist
app.post("/todolists", async (req, res) => {
    let response = {}
    let code = 200
    if (req.body.task == "" || req.body.task == undefined) {
        code = 422
        response = {
            status: "SUCCESS",
            message: "task cannot be blank"
        }

    }
    if (req.body.task_description == "" || req.body.task_description == undefined) {
        code = 422
        response = {
            status: "SUCCESS",
            message: "task description cannot be blank"
        }
    }
    try {
        const newTodo = await todoModel.create({
            task: req.body.task,
            task_description: req.body.task_description
        });

        response = {
            status: "SUCCESS",
            message: "Create Todolist",
            data: newTodo
        }
    } catch (error) {
        code = 422
        response = {
            status: "ERROR",
            message: error.parent.sqlMessage
        }
    }

    res.status(code).json(response)
    return
})

// Menghapus seluruh data todolist
app.delete("/todolists", async (req, res) => {
    let response = {}
    let code = 200
    try {
        const newTodo = await todoModel.destroy({
            where: {},
            truncate: true
        });

        response = {
            status: "SUCCESS",
            message: "Delete Todolist All",
            data: newTodo
        }
    } catch (error) {
        code = 422
        response = {
            status: "ERROR",
            message: error.parent.sqlMessage
        }
    }

    res.status(code).json(response)
    return
})

// Menghapus data todolist sesuai ID
app.delete("/todolists/:id", async (req, res) => {
    let response = {}
    let code = 200
    try {
        const newTodo = await todoModel.destroy({
            where: {
                id: req.params.id
            }
        });

        response = {
            status: "SUCCESS",
            message: "Delete Todolist",
            data: newTodo
        }
    } catch (error) {
        code = 422
        response = {
            status: "ERROR",
            message: error.parent.sqlMessage
        }
    }


    res.status(code).json(response)
    return
})

// update data todolist sesuai ID
app.put("/todolists/:id", async (req, res) => {
    let response = {}
    let code = 200
    if (req.body.task == "" || req.body.task == undefined) {
        code = 422
        response = {
            status: "SUCCESS",
            message: "task cannot be blank"
        }

    }
    if (req.body.task_description == "" || req.body.task_description == undefined) {
        code = 422
        response = {
            status: "SUCCESS",
            message: "task description cannot be blank"
        }
    }

    const todos = await todoModel.findOne({
        where: {
            id: req.params.id
        }
    });

    if (!todos) {
        response = {
            status: "SUCCESS",
            message: "Data not Found"
        }
    } else {
        todos.task = req.body.task
        todos.task_description = req.body.task_description
        users.save()
        response = {
            status: "SUCCESS",
            message: "Update Todolist",
            data: todos
        }
    }

    res.status(code).json(response)
    return
})

app.listen(port, () => {
    console.log(`This Application Run on Port : ${port}`)
})