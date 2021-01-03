const url = 'mongodb://localhost:27017/travel'
const mongoose = require('mongoose')
const assert = require('assert').strict

mongoose.connect(url, {useNewUrlParser: true, useUnifiedTopology: true})
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'))
db.once('open', function(){ console.log("Connected to mongodb")})

//Schemes
const PriceSchema = new mongoose.Schema({
    price:          String,
    salePrice:      String,
    sku:            String,
    quantity:       Number
})

const TourSchema = mongoose.Schema({
    id:               Number,
    name:             String,
    destination:      String,
    category:         String,
    maximum_tourists: Number,
    price: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Prices'
    }
}, {discriminatorKey: 'kind'});

const SightSeeingSchema = new mongoose.Schema({
    hotel:            String,
    places_to_see:   [String]
})
const ShoreSchema = new mongoose.Schema({
    cruise_name: String,
    cruise_type: String
})

TourSchema.methods.get_update_name = function(){
    return 'update_tour'
}

SightSeeingSchema.methods.get_update_name = function(){
    return 'update_sightseeing'
}

ShoreSchema.methods.get_update_name = function(){
    return 'update_shore'
}

function on_update(err, found_obj, errorCallback, successCallback)
{
    if(err)
    {
        errorCallback(err)
        return
    }

    successCallback(found_obj)
}

async function is_id_valid(unique_id)
{
    var do_exist = unique_id.match(/^[0-9a-fA-F]{24}$/) && await TourModel.exists({_id: unique_id})
    return do_exist
}

async function is_valid_price(unique_id)
{
    var do_exist = unique_id.match(/^[0-9a-fA-F]{24}$/) && await PricesModel.exists({_id: unique_id})
    return do_exist
}

TourSchema.methods.update_tour = function(update, errorCallback, successCallback){
    TourModel.findOneAndUpdate({_id: this._id},update,function(err,tour){
        on_update(err,tour, errorCallback, successCallback)
    })
}

SightSeeingSchema.methods.update_tour = function(update, errorCallback, successCallback){
    SightSeeingModel.findOneAndUpdate({_id: this._id},update,function(err,tour){
        on_update(err,tour, errorCallback, successCallback)
    })
}

ShoreSchema.methods.update_tour = function(update, errorCallback, successCallback){
    ShoreModel.findOneAndUpdate({_id: this._id},update,function(err,tour){
        on_update(err,tour, errorCallback, successCallback)
    })
}

//Models
const TourModel = db.model('Tour', TourSchema)
const SightSeeingModel = TourModel.discriminator('SightSeeing',  SightSeeingSchema)
const ShoreModel = TourModel.discriminator('Shore',  ShoreSchema)
const PricesModel = db.model('Prices', PriceSchema)


exports.db_insert = function(id_arg,name_arg,destination_arg,category_arg,maximum_tourists_arg,kind_arg)
{
    TourModel.create({
        id:   id_arg,
        name: name_arg,
        destination: destination_arg,
        category: category_arg,
        maximum_tourists: maximum_tourists_arg,
        kind: kind_arg
    })
}

exports.db_insert_prices = function(price_arg, sale_arg, sku_arg, quantity_arg)
{
    PricesModel.create({
        price: price_arg,
        salePrice:  sale_arg,
        sku:   sku_arg,
        quantity: quantity_arg
    })
}

exports.db_list_all = function(findCallback, errorCallback)
{
    TourModel.find({}, function(err, tours)
    {
        if(err)
        {
            console.log(err)
            errorCallback(err)
            return
        }
    
        var tourMap = {}
        tours.forEach(function(tour){
            tourMap[tour._id] = tour
        });
        findCallback(tourMap)
    });
}

exports.db_list_prices = function(findCallback, errorCallback)
{
    PricesModel.find({}, function(err, price)
    {
        if(err)
        {
            console.log(err)
            errorCallback(err)
            return
        }
    
        var priceMap = {}
        price.forEach(function(tour){
            priceMap[price._id] = price
        });
        findCallback(priceMap)
    });
}

exports.db_search = function(id_arg, name_arg, findCallback, errorCallback)
{
    TourModel.find({$or:[{id: id_arg},{name: name_arg}]}, function(err, tours)
    {
        if(err)
        {
            console.log(err)
            errorCallback(err)
            return
        }

        var tourMap = {}
        tours.forEach(function(tour){
            tourMap[tour.name] = tour
        });
        findCallback(tourMap)
    })
}

function find_obj(unique_id, findCallback, errorCallback)
{    
    TourModel.findOne({_id: unique_id}, function(err, tour)
    {
        if(err)
        {
            console.log(err)
            errorCallback(err)
            return
        }

        findCallback(tour)
    })
}

function find_price(unique_id, findCallback, errorCallback)
{    
    PricesModel.findOne({_id: unique_id}, function(err, tour)
    {
        if(err)
        {
            console.log(err)
            errorCallback(err)
            return
        }

        findCallback(tour)
    })
}

function delete_obj(unique_id, delCallback, errorCallback)
{
    TourModel.deleteOne({_id: unique_id}, function(err,obj)
    {
        if(err)
        {
            console.log(err)
            errorCallback(err)
            return
        }

        delCallback(obj)
    })
}

exports.db_find_obj = function(unique_id, findCallback, errorCallback)
{
    is_id_valid(unique_id).then( result => {
        if(result)
        {
            find_obj(unique_id,findCallback,errorCallback)
        }
        else
        {
            errorCallback("Not valid tour id")
        }
    })
}

exports.db_find_price = function(unique_id, findCallback, errorCallback)
{
    is_valid_price(unique_id).then( result => {
        if(result)
        {
            find_price(unique_id,findCallback,errorCallback)
        }
        else
        {
            errorCallback("Not valid price id")
        }
    })
}

exports.db_delete_obj = function(unique_id, delCallback, errorCallback)
{
    is_id_valid(unique_id).then( result => {
        if(result)
        {
            delete_obj(unique_id,delCallback,errorCallback)
        }
        else
        {
            errorCallback("Not valid tour id")
        }
    })
}

exports.db_find_tours_by_sku = function(sku_arg, findCallback, errorCallback)
{
    TourModel.find({price: {$exists: true, $ne: null}}).populate({
        path: 'price',
        match: {sku: sku_arg}
    }).exec(function(err,tours){
        if(err)
        {
            console.log(err)
            errorCallback(err)
            return
        }

        var tourMap = {}
        tours.forEach(function(tour){
            if(tour.price)
            {
                tourMap[tour._id] = tour
            }
        });
        findCallback(tourMap)
    })
}