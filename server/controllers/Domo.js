const models = require('../models');

const Domo = models.Domo;

const makerPage = (req, res) => {
  Domo.DomoModel.findByOwner(req.session.account._id, (err, docs) => {
    if (err) {
      console.log(err);
      return res.status(400).json({ error: 'An error occured' });
    }
    return res.render('app', { csrfToken: req.csrfToken(), domos: docs });
  });
};

const makeDomo = (req, res) => {
  if (!req.body.name || !req.body.age) {
    return res.status(400).json({ error: 'RAWR! Both name and age are required' });
  }

  const domoData = {
    name: req.body.name,
    age: req.body.age,
    level: req.body.level,
    owner: req.session.account._id,
  };

  const newDomo = new Domo.DomoModel(domoData);

  const domoPromise = newDomo.save();

  domoPromise.then(() => res.json({ redirect: '/maker' }));

  domoPromise.catch((err) => {
    console.log(err);
    if (err.code === 11000) {
      return res.status(400).json({ error: 'Domo already exists.' });
    }

    return res.status(400).json({ error: 'An error occured' });
  });

  return domoPromise;
};

const getDomos = (request, response) => {
  const req = request;
  const res = response;

  return Domo.DomoModel.findByOwner(req.session.account._id, (err, docs) => {
    if (err) {
      console.log(err);
      return res.status(400).json({ error: 'An error occured' });
    }

    return res.json({ domos: docs });
  });
};

// I had to rewrite this function. The version that was here had a lot wrong with it
const deleteDomo = (req, res) => {
    // If they dont have the proper elements in their request, send back a 400
  if (!req.body._id) {
    return res.status(400).json({ error: 'An error occured' });
  }

    // Otherwise delete the domo and send back a 200 when complete
  Domo.DomoModel.deleteOne({ _id: req.body._id }, () => res.status(200));
	// sending a 200 to avoid lint error
  return res.status(200);
};

const doFight = (req, res) => {
  // make sure both names are there
  if (!req.body.name1 || !req.body.name2) {
    return res.status(400).json({ error: 'An error occured' });
  }

  // find the actual domo with all their data
  //const fighter1 = Domo.DomoModel.findByName(req.body.name1);
  //const fighter2 = Domo.DomoModel.findByName(req.body.name2);
  console.log("Fight Started");
  return Domo.DomoModel.findByName(req.body.name1, (err, docs) => {
		//docs is an array within which is an index _doc with what I want
    const fighter1 = docs[0]._doc;
    Domo.DomoModel.findByName(req.body.name2, (_err, _docs) => {
      const fighter2 = _docs[0]._doc;
      // Determine fight scores
      // Math.floor(Math.random()*7) returns a random integer from 0 to 6
      const fighter1Score = (fighter1.level + fighter1.age) * Math.floor(Math.random() * 7);
      const fighter2Score = (fighter2.level + fighter2.age) * Math.floor(Math.random() * 7);
      console.log("Fighter 1 level: "+ fighter1.level);
      console.log("Fighter 1 Score: "+ fighter1Score);
      console.log("Fighter 2 Score: "+ fighter2Score);
      if (fighter1Score > fighter2Score) {
        // delete fighter 2
        Domo.DomoModel.deleteOne({ _id: fighter1._id }, () => res.status(200));
      } else if (fighter2Score > fighter1Score) {
        // delte fighter 1
        Domo.DomoModel.deleteOne({ _id: fighter2._id }, () => res.status(200));
      } else if (fighter1Score === fighter2Score) {
        // delte them both
        Domo.DomoModel.deleteOne({ _id: fighter1._id }, () => res.status(200));
        Domo.DomoModel.deleteOne({ _id: fighter2._id }, () => res.status(200));
      }
    });
  });
};

module.exports.makerPage = makerPage;
module.exports.getDomos = getDomos;
module.exports.make = makeDomo;
module.exports.deleteDomo = deleteDomo;
module.exports.doFight = doFight;
