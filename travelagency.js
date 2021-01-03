var express = require('express')
var model = require('./model')

var app = express(); 
var handlebars = require('express-handlebars').create({
    defaultlayout:'main',
    helpers: {
        section: function(name, options){
            if(!this._sections) this._sections = {};
            this._sections[name] = options.fn(this);
            return null;
        }
    }
});
var bodyParser = require('body-parser')
//app.use( bodyParser.json() );
app.use(bodyParser.urlencoded({ 
    extended: true
}));

app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');
//set content folder for handlebars

app.use(express.static(__dirname + '/public'));

app.set('port', process.env.PORT || 3000); 

var fortunes = [
    "Look deep into yourself",
    "Present is called present for a reason",
    "Strength is the source of intelligence"
];

app.use(function(req, res, next){
    res.locals.showTests = app.get('env') !== 'production' && req.query.test === '1';
    next();
});

app.get('/', function(req,res){
    res.render('home');
});

app.get('/about', function(req,res){
    var random_for = fortunes[Math.floor(Math.random() * fortunes.length)];
    res.render('about', { fortune: random_for, pageTestScript: '/qa/tests-about.js'});
});

app.get('/tours/insert', function(req,res){
    res.render('tours/insert_tour');
});

app.get('/prices/insert', function(req,res){
    res.render('prices/insert_price')
});

app.get('/prices/set_tour', function(req,res){
    res.render('prices/set_price')
})

app.get('/prices/find_tour', function(req,res){
    res.render('prices/find_tour')
})

//search by name or custom id
app.get('/tours/search', function(req,res){
    res.render('tours/search_tour');
});

//update by unique id
app.get('/tours/update', function(req,res){
    res.render('tours/find_tour', {action: "Update tour by id"})
});
app.get('/tours/delete', function(req,res){
    res.render('tours/find_tour', {action: "Delete tour by id"})
});
app.get('/tours/update_shore', function(req,res){
    res.render('tours/update_shore', {default_unique_id: req.query.id});
});
app.get('/tours/update_sightseeing', function(req,res){
    res.render('tours/update_sightseeing', {default_unique_id: req.query.id});
});

app.get('/tours/list', function(req,res){
    findCallback = function(data)
    {
        res.status('200')
        res.json(data)
    }

    tours = model.db_list_all(findCallback, function(err){
        res.send(err)
    })
})

app.get('/prices/list', function(req,res){
    findCallback = function(data)
    {
        res.status('200')
        res.json(data)
    }

    prices = model.db_list_prices(findCallback, function(err){
        res.send(err)
    })
})

app.post('/tours/insert', function(req,res){
    try
    {
        model.db_insert(
            req.body.id,
            req.body.name,
            req.body.destination,
            req.body.category,
            req.body.maximum_tourists,
            req.body.kind)
        res.redirect('/tours/list')
    }
    catch(ex)
    {
        console.log(ex)
        res.status('500')
        res.render('500', {error: ex})
    }
})

app.post('/prices/insert', function(req,res){
    try
    {
        model.db_insert_prices(
            req.body.price,
            req.body.sale,
            req.body.sku,
            req.body.quantity)
        res.redirect('/prices/list')
    }
    catch(ex)
    {
        console.log(ex)
        res.status('500')
        res.render('500', {error: ex})
    }
})

app.post('/prices/set_tour', function(req,res){
    try
    {
        find_price_cb = function(price_obj)
        {
            find_tour_cb = function(tour_obj)
            {
                res.status('200')
                tour_obj.price = price_obj.id
                tour_obj.save()
                res.redirect('/tours/list')
            }

            model.db_find_obj(req.body.tour_id,find_tour_cb,function(err){
                res.send(err)
            })
        }

        model.db_find_price(req.body.price_id,find_price_cb,function(err){
            res.send(err)
        })
    }
    catch(ex)
    {
        console.log(ex)
        res.status('500')
        res.render('500', {error: ex})
    }
})

app.post('/prices/find_tour', function(req,res){
    try
    {
        find_cb = function(tours)
        {
            res.status('200')
            res.json(tours)
        }

        model.db_find_tours_by_sku(req.body.sku, find_cb,function(err){
            res.send(err)
        })
    }
    catch(ex)
    {
        console.log(ex)
        res.status('500')
        res.render('500', {error: ex})
    }
})

app.post('/tours/search', function(req,res){
    try
    {
        findCallback = function(data)
        {
            res.status('200')
            res.json(data)
        }

        model.db_search(req.body.id,req.body.name, findCallback,function(err){
            res.send(err)
        })
    }
    catch(ex)
    {
        console.log(ex)
        res.status('500')
        res.render('500', {error: ex})
    }
})

app.post('/tours/update', function(req,res){
    try
    {
        findCallback = function(obj)
        {
            res.status('200')
            var unique_id = encodeURIComponent(obj._id);
            res.redirect('/tours/' + obj.get_update_name() + "/?id=" + unique_id)

        }

        model.db_find_obj(req.body.id,findCallback,function(err){
            res.send(err)
        })
    }
    catch(ex)
    {
        console.log(ex)
        res.status('500')
        res.render('500', {error: ex})
    }
})

function update_tours(upd,req,res)
{
    try
    {
        findCallback = function(obj)
        {
            res.status('200')
            obj.update_tour(upd,function(err){
                res.send(err)
            }, function(updated_obj) {
                console.log(updated_obj)
                res.redirect('/tours/list')
            })

        }

        model.db_find_obj(req.body.unique_id,findCallback,function(err){
            res.send(err)
        })

    }
    catch(ex)
    {
        console.log(ex)
        res.status('500')
        res.render('500', {error: ex})
    }
}

app.post('/tours/update_shore', function(req,res){
    const upd = {$set:{
        cruise_name: req.body.cruise_name,
        cruise_type: req.body.cruise_type
    }}
    update_tours(upd,req,res)
})

app.post('/tours/update_sightseeing', function(req,res){
    const upd = {$set:{
        hotel: req.body.hotel,
        places_to_see: [req.body.place_1,
                        req.body.place_2,
                        req.body.place_3],
    }}
    update_tours(upd,req,res)
})

app.post('/tours/delete', function(req,res){
    try
    {
        delCallback = function(obj){
            res.status('200')
            res.redirect('/tours/list')
        }

        model.db_delete_obj(req.body.id, delCallback,function(err){
            res.send(err)
        })
    }
    catch(ex)
    {
        console.log(ex)
        res.status('500')
        res.render('500', {error: ex})
    }
})


app.use(function(req, res){
    res.status('404');
    res.render('404');
});

app.listen(app.get('port'), function(){
    console.log('Express running on http://localhost:' + app.get('port') + ': press Ctrl+C to quit');
});
