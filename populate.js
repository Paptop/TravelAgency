var model = require('./model')

model.db_insert(
    0,
    "French Vacation",
    "France, Paris",
    "Entertainment",
    10,
    "SightSeeing"
)

model.db_insert(
    0,
    "Charming Haarlem",
    "Amsterdam",
    "Education",
    30,
    "SightSeeing"
)

model.db_insert(
    1,
    "Royal Sea",
    "The Bahamas",
    "Vacation",
    300,
    "Shore"
)

model.db_insert(
    2,
    "Caribbean Pirates",
    "West Indies",
    "Adventure",
    200,
    "Shore"
)

model.db_insert(
    3,
    "Ancient Greece",
    "Athens",
    "Education",
    200,
    "SightSeeing"
)

model.db_insert_prices(
    "400$",
    "300$",
    "M223-02-001",
    1
)

model.db_insert_prices(
    "1000$",
    "850$",
    "W223-58-010",
    2
)

model.db_insert_prices(
    "700$",
    "600$",
    "C604-25-035",
    2
)
