const express = require('express');
const app = express();
// const cors = require('cors');

// // cross origin allow.
// // ที่มา : https://medium.com/neverrest/cors-รวมวิธีการแก้ไขปัญหา-cors-ที่-web-developer-ต้องเจอ-5afb6a9e742f
// // ที่มา 2 : https://www.youtube.com/watch?v=bEMbt01w48Y
app.use(function(req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*'); //หรือใส่แค่เฉพาะ domain ที่ต้องการได้
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, HEAD, PATCH');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With,  Content-Type, Accept');
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
});

// const port = 3009;
const port = process.env.SERVER_PORT || 3009;

// app.use(cors({
//     origin: "https://wongwaimammoth.serv00.net:3009",
//     methods: "GET"
// }));

// const corsOptions = {
//   origin: 'wongwaimammoth.serv00.net',   //(https://your-client-app.com)
//  optionsSuccessStatus: 200,
// };
// app.use(cors(corsOptions));


// Log file.
var fs = require('fs');

const mysql = require('mysql2');

// start connect express to mysql. -------------------------------------------------------------------------------------------------------------
const connection = mysql.createConnection({
    host: 'mysql0.serv00.com',  // wongwaimammoth.serv00.net
    user: 'm10776',
    password: 'Mozza7998',
    database: 'm10776_room'
});

// เชื่อมต่อ mysql
connection.connect((err) => {
    if (err) {
        console.error("Error to Connect Database !", err);
        throw err;
    }

    // เชือมต่อสำเร็จ
    console.log("Connect MySQL Database Successfully.", err);
});
// end connect express to mysql. ----------------------------------------------------------------------------------------------------------------

// alt+9+6 สร้าง text + var ==> `text`

// // บันทึกประวัติการเรียกใช้งาน server จากฝั่ง client. ----------------------------------------------------------------------------------------------------
var myTime = new Date();
var log_str = `SWICEC Use Date :: ${myTime.toLocaleDateString()}`
fs.writeFile('server_log.txt', log_str, function(err) {
    if (err) throw err;
    console.log('Write log file Success.');
});
// สิ้นสุด บันทึกประวัติการเรียกใช้งาน server จากฝั่ง client. -----------------------------------------------------------------------------------------------

// Start API Home.--------------------------------------------------------------------------------------------------------------------------------
app.get('/', (req, res) => {
    res.send('BCTC API Home.');
});
// End API Home.----------------------------------------------------------------------------------------------------------------------------------

// Start APIs ------------------------------------------------------------------------------------------------------------------------------------
// API :: GET Rooms.
app.get('/api/rooms', (req, res) => {
    // sql cmd.
    const sql = `SELECT room_id, namemeeting  FROM room where room_id <> ''`;

    // เริ่มเชื่อมต่อ database.
    connection.query(sql,(err, rows) => {
        if (err) {
            // ติดต่อ mysql ไม่ได้
            console.log("Error : Can not query room data ", err);
            res.status(500).send("Error to get room data from database !");
        } else {
            // มีข้อมูล
            res.json(rows);
        }
    })
});

// API :: GET All Reserve Data.
app.get('/api/reserve', (req, res) => {
    // sql cmd.
    const sql = `SELECT  reserve.reserve_id as reserve_id, 
                room.room_id as room_id, 
                reserve.reserve_date as reserve_date, 
                reserve.use_date as use_date, 
                reserve.use_time as use_time, 
                reserve.topic as topic, 
                room.image_url as image_url, 
                room.namemeeting as namemeeting, 
                reserve.reserve_status as reserve_status, 
                reserve.username as username, 
                room.location as location, 
                users.emp_id as emp_id, 
                employee.name as name, 
                employee.department as department, 
                employee.position as position 
        FROM reserve 
        LEFT JOIN room ON room.room_id = reserve.room_id
        LEFT JOIN users ON reserve.username = users.username
        LEFT JOIN employee ON users.emp_id = employee.emp_id 
        ORDER By reserve.reserve_id Asc `;

    // เริ่มเชื่อมต่อ database.
    connection.query(sql, (err, rows) => {
        if (err) {
            // ติดต่อ mysql ไม่ได้
            console.log("Error : Can not query reserve data ", err);
            res.status(500).send("Error to get reserve data from database !");
        } else {
            // มีข้อมูล
            res.json(rows);
        }
    })
});

// API :: GET Reserve Data by Keyword.
app.get('/api/reserve/:keyword_type/:keyword', (req, res) => {
    // param.
    let keywords = req.params.keyword;
    let keyword_types = req.params.keyword_type;
    let kw = '';

    switch (keyword_types) {
        case 'room_id':
            kw = 'reserve.room_id';
            break;
        case 'namemeeting':
            kw = 'room.namemeeting';
            break;
        case 'topic':
            kw = 'reserve.topic';
            break;
        case 'reserve_status':
            kw = 'reserve.reserve_status';
            break;
        default:
            break;
    }

    // sql cmd.
    const sql = `SELECT  reserve.reserve_id as reserve_id, 
                room.room_id as room_id, 
                reserve.reserve_date as reserve_date, 
                reserve.use_date as use_date, 
                reserve.use_time as use_time, 
                reserve.topic as topic, 
                room.image_url as image_url, 
                room.namemeeting as namemeeting, 
                reserve.reserve_status as reserve_status, 
                reserve.username as username, 
                room.location as location, 
                users.emp_id as emp_id, 
                employee.name as name, 
                employee.department as department, 
                employee.position as position 
        FROM reserve 
        LEFT JOIN room ON room.room_id = reserve.room_id
        LEFT JOIN users ON reserve.username = users.username
        LEFT JOIN employee ON users.emp_id = employee.emp_id 
        Where ${kw} like ? 
        ORDER By reserve.reserve_id Asc `;

    // เริ่มเชื่อมต่อ database.
    connection.query(sql, ['%'+keywords+'%'], (err, rows) => {
        if (err) {
            // ติดต่อ mysql ไม่ได้
            console.log("Error : Can not query reserve data ", err);
            res.status(500).send("Error to get reserve data from database !");
        } else {
            // มีข้อมูล
            res.json(rows);
        }
    })
});


// End APIs -------------------------------------------------------------------------------------------------------------------------------------

// Start Listen Port ----------------------------------------------------------------------------------------------------------------------------
// Listen Port.
app.listen(port, () =>{
    console.log(`BCTC Server Start at Port ${port}`);
});
// End Listen Port ------------------------------------------------------------------------------------------------------------------------------