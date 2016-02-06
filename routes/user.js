/* GET users listing. */
exports.list = function(req, res){
  res.render('about', { title: 'Express' });
};

exports.requireTest = function(req, res) {
  res.render('test', { title : 'RequireJs'});
};

exports.test = function(req, res) {
  console.log(req.body);
  res.send({state : 'success', code : 2000});
}