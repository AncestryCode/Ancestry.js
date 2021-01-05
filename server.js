const express = require('express'); 
const app = express();
const opn = require('opn');
const api = "http://localhost:5000";
const specialsRegex = /[ `!#$%^&()+\-=\[\]{};':"\\|,.<>\/?~]/;
const emailRegex = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
const path = require('path');
const axios = require('axios').default;
const autils = require('autils.js');
const fs = require('fs');
const rateLimit = require("express-rate-limit");
const bodyParser = require("body-parser");
const methodOverride = require("method-override");
const cookies = require('cookies');
const cookieParser = require('cookie-parser');
const checkInternet = require('check-internet-connected');
const RPC = require('./modules/DiscordRPC.js');
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100
});
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));
app.set('views', path.join(__dirname, '/views'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookies.express(["normies big gay"]));
app.use(express.static("public"));
app.use(cookieParser());
app.use(methodOverride("_method"));
app.set('trust proxy', true);

app.set("view engine", "ejs");
app.use('/public', express.static(__dirname + '/assets'));
//app.use(limiter);

function port() {
    let ports = [29483,62514,10492,42424,12431,51841,29672,29194,4927,60386,16022,29852,49203,20039,48524,10101,48673];
    return ports[Math.floor(Math.random()*ports.length)];
}
let actual = port();
let token;
let user;

/*app.use(async(req,res,next)=>{
    try {
        await checkInternet({
            timeout: 2000,
            tries: 5,
            url: "https://www.google.com"
        });
        next();
    }catch(e) {
        res.render('offline');
    }
});

app.use(async(req,res,next)=>{
    try {
        await checkInternet({
            timeout: 2000,
            tries: 3,
            url: api
        });
        next();
    }catch(e) {
        res.render('apioffline');
    }
});*/
let presence = new RPC('790596787303219230');
app.use(async(req,res,next)=>{
    token = getToken();
    user = await getUser(token);
    next();
    presence.start(await getUser(token));
});


app.get('/', async(req,res) => {
	res.render('index', {
        title: "Home",
        user
    });
});

app.get('/discord',(req,res)=>{
    opn('https://discord.gg/BX42pq29C5');
	res.render('index', {
        title: "Home",
        message: "Abierto en el navegador!",
        user
    });
});

app.get('/twitter', (req,res)=>{
    opn('https://twitter.com/AtogMC');
	res.render('index', {
        title: "Home",
        message: "Abierto en el navegador!",
        user
    });
});

app.get('/checker', (req,res)=>{
    res.render('index', {
        title: "Home",
        message: "Próximamente",
        user
    });
});

app.get('/premium',(req,res)=>{
    res.render('index', {
        title: "Home",
        message: "Próximamente",
        user
    });
});

app.get('/user-interface',isLogged,async(req,res)=>{
    //presence.changeState("Viewing the user interface");
    res.render('ui', {
        title: "User interface",
        user: /*{
            username: "iAtog",
            email: "atogmc58vani@gmail.com",

        }*/ await getUser(token) 
    });
});

app.get('/login',async(req,res)=>{
    if(user!=null)return res.redirect('/');
    presence.changeState("Login page");
    res.render('login', {
        title: "Login",
        email: "",
        user
    });
});

app.post('/login',(req,res)=>{
    let {email, password} = req.body;
    if(!emailRegex.test(email))res.render('login', {
        title: "Login",
        alert: "El correo electronico no es válido.",
        email: "",
        user
    });
    if(!password.replace(/\s/g, '').length)res.render('login', {
        title: "Login",
        alert: "La contraseña no puede estar vacía.",
        email,
        user
    });
    axios({
        method: "post",
        url: api+"/auth/login",
        data: {email,password}
    }).then(async (respuesta) => {
        console.log(respuesta.data);
        if(respuesta.data.error) {
            if(respuesta.data.error === "invalid")res.render('login', {
                title: "Login",
                alert: "Uno de tus datos es inválido, revísalos y vuelve a intentar.",
                email,
                user
            });
            if(respuesta.data.error === 'invalid password')res.render('login', {
                title: "Login",
                alert: "Contraseña incorrecta.",
                email,
                user
            });
            return;
        }
        saveToken(respuesta.data.token).then(async() => {
            let u = await getUser(respuesta.data.token)
            res.render('index', {
                title: "Home",
                message: "Sesión iniciada correctamente!",
                user: u
            });
        });
    }).catch(err=>{console.log(err);res.render('login', {
        title: "Login",
        alert: "La api puede estar caída, intentelo más tarde.",
        email,
        user
    });});
});






app.get('/register', async(req,res) => {
    if(user!=null)return res.redirect('/');
    presence.changeState("Creating a account");
    res.render('register', {
        title: "Register",
        email: "",
        password: "",
        username: "",
        user
    });
});

app.post('/register', async(req,res) => {
    let {username,email,password,password_repeat} = req.body;
    if(!username.replace(/\s/g, '').length)return res.render('register', {
        title: "Register",
        email: "",
        password: "",
        username: "",
        alert: "Debes poner un nombre de usuario válido.",
        user
    });
    if(specialsRegex.test(username))return res.render('register', {
        title: "Register",
        email: "",
        password: "",
        username: "",
        alert: "El nombre de usuario no puede contener espacios y símbolos raros.",
        user
    });
    if(!emailRegex.test(email) || !email.replace(/\s/g, '').length)return res.render('register', {
        title: "Register",
        alert: "El correo no es válido.",
        email: "",
        username,
        password: "",
        user
    });
    if(password !== password_repeat)return res.render('register', {
        title: "Register",
        alert: "Las contraseñas no son iguales.",
        email,
        password: "",
        username,
        user
    });
    if(!password.replace(/\s/g, '').length||!password_repeat.replace(/\s/g, '').length)return res.render('register', {
        title: "Register",
        alert: "La contraseña es inválida",
        email,
        username,
        user
    });
    if(password.length < 8 || password.length > 18)return res.render('register', {
        title: "Register",
        alert: "La contraseña no puede ser menor a 8 carácteres y mayor a 18.",
        email,
        password: "",
        username,
        user
    });
    if(specialsRegex.test(password)||specialsRegex.test(password_repeat))return res.render('register', {
        title: "Register",
        email,
        password: "",
        username,
        alert: "La contraseña no puede contener espacios y símbolos raros, [Se admiten: @, * y _].",
        user
    });
    let hwid = await autils.HWID();
    axios({
        method: "POST",
        url: api+"/auth/create",
        data: {
            username,
            email,
            password,
            hwid
        }
    }).then(async(respuesta) => {
        if(respuesta.data.error) {
            if(respuesta.data.error === "invalid")res.render('register', {
                title: "Register",
                alert: "Ha ocurrido un error..",
                email,
                password,
                username,
                user
            });
            else if(respuesta.data.error === 'email already in use')res.render('register', {
                title: "Register",
                alert: "El correo que has ingresado ya está en uso.",
                email,
                password,
                username,
                user
            });
            else if(respuesta.data.error === 'username already in use')res.render('register', {
                title: "Register",
                alert: "El nombre de usuario ya está en uso.",
                email,
                password,
                username,
                user
            });
            return;
        }
        saveToken(respuesta.data.token).then(async() => {
            let u = await getUser(respuesta.data.token)
            res.render('index', {
                title: "Home",
                message: "Tu cuenta se ha creado correctamente",
                user: u
            });
        });
    }).catch(x => {
        console.log(x);
        res.render('register', {
            title: "Register",
            alert: "Algo ha fallado... intentelo más tarde.",
            email: "",
            user
        });
    });

    
});

app.get('/logout', async(req,res) => {
    if(!token||token==="")return res.redirect('/');
    saveToken("").then(async() => {
        let u = await getUser("");
        res.render('index', {
            title: "Home",
            message: "Su sesión se ha cerrado correctamente.",
            user: u
        });
    });
});

app.use((req, res, next) => {
    res.status(404).render('index', {
        title: 'Home',
        nfe: true,
        user
    });
});

app.listen(actual, function(){
    console.log("Server started");
});

async function getUser(token) {
    return new Promise(async(s,r)=>{
        if(!token||token===""||token==null)return s(null);
        axios({
            method: "POST",
            url: api+'/user/get',
            data: {token}
        }).then(x=>{s(x.data);}).catch(e=>{console.log(e);s(null);});
    });
}

app.port = actual;

async function isLogged(req,res,next) {
    if((await getUser(token))==null)res.redirect('/login');
    else next();
}

function saveToken(token) {
    let newOb = {
        "token": token
    };
    return new Promise(async(s,r)=>{
        fs.writeFileSync(path.join(__dirname, "/json/authsave.json"), JSON.stringify(newOb), 'utf8');
        s();
    });
}

async function updateUser() {
    user = await getUser(token);
}

function getToken() {
    return require('./json/authsave.json').token;
}

module.exports=app;

module.exports.port = actual;