const app = require('express')();
const { v4 } = require('uuid');
// app.use(app.static('public'))
app.get('/api', (req, res) => {
  const path = `/api/item/${v4()}`;
  res.setHeader('Content-Type', 'text/html');
  res.setHeader('Cache-Control', 's-max-age=1, stale-while-revalidate');
  res.end(`Hello! Go to item: <a href="${path}">${path}</a>`);
});

app.get('/api/item/:slug', (req, res) => {
  const { slug } = req.params;
  res.end(`Item: ${slug}`);
});
app.get("/test", (req, res) => {
    res.send({status: 'success'});
})
app.listen(4000, () => {
    console.log('running on port 4000');
    // start();
})
module.exports = app;