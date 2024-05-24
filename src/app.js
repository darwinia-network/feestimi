import express from "express";
import httpContext from 'express-http-context';
import ruid from 'express-ruid';
import routes from "./routes/routes.js";

console.log = (function () {
  var console_log = console.log;

  return function () {
    const logSubTitle = httpContext.get('logTitle');
    const rid = httpContext.get('rid');
    if (logSubTitle && rid) {
      var title = "[" + new Date().toUTCString() + "] [" + logSubTitle + "] [" + rid + "]";
    } else {
      var title = "[" + new Date().toUTCString() + "]";
    }
    var args = [];
    args.push(title + ':');
    for (var i = 0; i < arguments.length; i++) {
      args.push(arguments[i]);
    }
    console_log.apply(console, args);
  };
})();

const app = express();
const host = "0.0.0.0";
const port = parseInt(process.env.PORT ?? '3378');

// enable CORS for all routes and for our specific API-Key header
app.use((_req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, API-Key')
  next()
})

app.use(httpContext.middleware);
app.use(ruid({ setInContext: true }));

app.use(express.json());
app.use('/', routes);

app.use((_req, res) => {
  res.status(404).send({
    code: 1,
    error: "Not found"
  });
});

app.listen(port, host, () => {
  console.log(`Server: I am running at https://${host}:${port}`);
});
