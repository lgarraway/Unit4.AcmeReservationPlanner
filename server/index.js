const { client,
        createTables,
        createCustomer, 
        createRestaurant,
        fetchCustomers,
        fetchRestaurants,
        createReservations,
        fetchReservations,
        destroyReservation
     } = require('./db');

const express = require('express');
const app = express();
app.use(express.json());

app.get('/api/customers', async(req, res, next)=> {
    try {
        res.send(await fetchCustomers());
    } catch(error) {
        next(ex);
    }
});

app.get('/api/restaurants', async(req, res, next)=> {
    try {
        res.send(await fetchRestaurants());
    } catch(error) {
        next(ex);
    }
});

app.get('/api/reservations', async(req, res, next)=> {
    try {
        res.send(await fetchReservations());
    } catch(error) {
        next(ex);
    }
});

app.delete('/api/customers/:customer_id/reservations/:id', async(req, res, next)=> {
    try {
      await destroyReservation(req.params.id, req.params.customer_id);
      res.sendStatus(204);
    }
    catch(ex){
      next(ex);
    }
});


app.post('/api/customers/:id/reservations', async(req, res, next)=> {
    try {
      res.status(201).send(await createReservations([req.body.date, req.body.party_count, req.body.restaurant_id, req.params.id]));
    }
    catch(ex){
      next(ex);
    }
});

const init = async () => {
    await client.connect();
    console.log('connected to database');
    await createTables();
    console.log('tables created');
    const [jim, bill, jill, fridays, chilis, wendys] = await Promise.all([
        createCustomer('jim'),
        createCustomer('bill'),
        createCustomer('jill'),
        createRestaurant('fridays'),
        createRestaurant('chilis'),
        createRestaurant('wendys')
    ]);
    console.log(`jim has as id of ${jim.id}`);
    console.log(`bill has as id of ${bill.id}`);
    console.log(`jill has as id of ${jill.id}`);
    console.log(`fridays has as id of ${fridays.id}`);
    console.log(`chilis has as id of ${chilis.id}`);
    console.log(`wendys has as id of ${wendys.id}`);
    console.log(await fetchCustomers());
    console.log(await fetchRestaurants());
    await Promise.all([
        createReservations({ date: '05/01/2024', party_count: 5, restaurant_id: fridays.id, customer_id: jim.id }),
        createReservations({ date: '05/15/2024', party_count: 7, restaurant_id: chilis.id, customer_id: bill.id }),
        createReservations({ date: '08/04/2024', party_count: 3, restaurant_id: wendys.id, customer_id: jill.id }),
        createReservations({ date: '11/30/2024', party_count: 9, restaurant_id: chilis.id, customer_id: jill.id }),
    ]);
    const reservations = await fetchReservations();
    console.log(reservations);
    await destroyReservation(reservations[0].id);
    console.log(await fetchReservations());
    const port = process.env.PORT || 3000;
    app.listen(port, ()=> console.log(`listening on port ${port}`));
}

init()