const path = require('path');
const Koa = require('koa');
const app = new Koa();

app.use(require('koa-static')(path.join(__dirname, 'public')));
app.use(require('koa-bodyparser')());

const Router = require('koa-router');
const router = new Router();

let msgForSubscribers = null;
let subscribeResolvers = [];

router.get('/subscribe', async (ctx, next) => {
  ctx.status = 200;
  if (msgForSubscribers) {
    ctx.body = msgForSubscribers;
    msgForSubscribers = null;
  } else {
    const promise = new Promise((resolve, reject) => {
      subscribeResolvers.push(resolve);
    });
    ctx.body = await promise;
  }
});

router.post('/publish', async (ctx, next) => {
  if (ctx.request.body.message) {
    ctx.status = 200;
    if (subscribeResolvers.length > 0) {
      subscribeResolvers.forEach((resolve) => {
        resolve(ctx.request.body.message);
      });
      subscribeResolvers = [];
    } else {
      msgForSubscribers = ctx.request.body.message;
    }
  }
});

app.use(router.routes());

module.exports = app;
