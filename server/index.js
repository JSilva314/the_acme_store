const {
  client,
  createTables,
  createUser,
  createProduct,
  fetchUsers,
  fetchProduct,
  createFavorite,
  fetchFavorite,
  deleteFavorite,
} = require("./db");

const express = require("express");
const app = express();
app.use(express.json());

//GET /api/users - returns array of users

app.get("/api/user", async (req, res, next) => {
  try {
    res.send(await fetchUsers());
  } catch (ex) {
    next(ex);
  }
});

//GET /api/products - returns an array of products

app.get("/api/product", async (req, res, next) => {
  try {
    res.send(await fetchProduct());
  } catch (ex) {
    next(ex);
  }
});

//GET /api/users/:id/favorite - returns an array of favorites for a user

app.get("/api/user/:id/favorite", async (req, res, next) => {
  try {
    res.send(await fetchFavorite(req.params.id));
  } catch (ex) {
    next(ex);
  }
});

//POST /api/users/:id/favorite - payload: a product_id returns the created favorite with a status code of 201

app.post("/api/user/:id/favorite", async (req, res, next) => {
  try {
    res.status(201).send(
      await createFavorite({
        user_id: req.params.id,
        product_id: req.body.product_id,
      })
    );
  } catch (ex) {
    next(ex);
  }
});

//DELETE /api/users/:userId/favorite/:id - deletes a favorite for a user, returns nothing with a status code of 204

app.delete("/api/user/:userId/favorite/:id", async (req, res, next) => {
  try {
    await deleteFavorite({ id: req.params.id, user_id: req.params.userId });
    res.sendStatus(204);
  } catch (ex) {
    next(ex);
  }
});

const init = async () => {
  await client.connect();
  console.log("connected to database");
  await createTables();
  console.log("tables created");
  const [
    michelangelo,
    donatello,
    raphael,
    leonardo,
    nunchaku,
    katana,
    staff,
    sai,
  ] = await Promise.all([
    createUser({ username: "michelangelo", password: "pizza" }),
    createUser({ username: "donatello", password: "pasta" }),
    createUser({ username: "raphael", password: "spaghetti" }),
    createUser({ username: "leonardo", password: "alfredo" }),
    createProduct({ name: "nunchaku" }),
    createProduct({ name: "staff" }),
    createProduct({ name: "sai" }),
    createProduct({ name: "katana" }),
  ]);

  const user = await fetchUsers();
  console.log(user);

  const product = await fetchProduct();
  console.log(product);

  const favorites = await Promise.all([
    createProduct({ user_id: michelangelo.id, product_id: nunchaku.id }),
    createProduct({ user_id: donatello.id, product_id: staff.id }),
    createProduct({ user_id: raphael.id, product_id: sai.id }),
    createProduct({ user_id: leonardo.id, product_id: katana.id }),
  ]);
  console.log(await fetchProduct(donatello.id));
  await deleteFavorite(product[0].id);
  console.log(await fetchProduct(donatello.id));

  console.log(`curl localhost:3000/api/user/${donatello.id}/product`);

  console.log(`curl -X POST localhost:3000/api/user/${donatello.id}/product -d '{"skill_id": "${staff.id}"}' -H 'Content-Type:application/json'`);
  console.log(`curl -X DELETE localhost:3000/api/user/${donatello.id}/product/${product[3].id}`);
  
  console.log('data seeded');

  const port = process.env.PORT || 3000;
  app.listen(port, () => console.log(`listening on port ${port}`));

  console.log(donatello.id);
  console.log(katana.id);
};

init();
