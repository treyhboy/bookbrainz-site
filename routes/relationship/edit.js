var express = require('express');
var router = express.Router();
var request = require('superagent');
var Promise = require('bluebird');
require('superagent-bluebird-promise');

function relationshipEditor(req, res) {
  res.render('relationship/edit', {
    session: req.session,
    entityGid: req.params.id
  });
}

router.post('/relationship/create/handler', function(req, res) {
  var ws = req.app.get('webservice');

  req.body.forEach(function(relationship) {
    // Send a relationship revision for each of the relationships, in a single
    // edit - however, WS doesn't support multi-revision edits yet, so use many
    var editPromise = request.post(ws + '/edits')
    .send({})
    .set('Authorization', 'Bearer ' + req.session.oauth.access_token).promise()
    .then(function(editResponse) {
      return editResponse.body;
    });

    var changes = relationship;

    editPromise.then(function(edit) {
      changes.edit_id = edit.id;

      request.post(ws + '/revisions')
      .set('Authorization', 'Bearer ' + req.session.oauth.access_token)
      .send(changes).promise()
      .then(function(revision) {
        res.send(revision.body);
      });
    });
  });
});

router.get('/publication/:id/relationships', relationshipEditor);
router.get('/creator/:id/relationships', relationshipEditor);

module.exports = router;
