//client - a node pg client
const pg = require("pg");
const client = new pg.Client(
  process.env.DATABASE_URL || "postgres://localhost/the_acme_store_db"
);
const uuid = require("uuid");
const bcrypt = require("bcrypt");

//createTables method - drops and creates the tables for your application

const createTables = async () => {
  const SQL = /*SQL*/ `
    DROP TABLE IF EXISTS favorite;
    DROP TABLE IF EXISTS product;
    DROP TABLE IF EXISTS users;
    CREATE TABLE users(
        id UUID PRIMARY KEY,
        username VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(100)

    );
    CREATE TABLE product(
        id UUID PRIMARY KEY,
        name VARCHAR(100)
    );
    CREATE TABLE favorite(
        id UUID PRIMARY KEY,
        product_id UUID REFERENCES product(id) NOT NULL,
        user_id UUID REFERENCES users(id) NOT NULL,
        CONSTRAINT unique_user_id UNIQUE (user_id, product_id)
    );
    `;
  await client.query(SQL);
};

//createProduct - creates a product in the database and returns the created record

const createProduct = async ({ name }) => {
  const SQL = /*SQL*/ `
    INSERT INTO product(id, name) VALUES($1, $2) RETURNING *
    `;
  const response = await client.query(SQL, [uuid.v4(), name]);
  return response.rows[0];
};

//createUser - creates a user in the database and returns the created record. The password of the user should be hashed using bcrypt.

const createUser = async ({ username, password }) => {
  const SQL = /*SQL*/ `
    INSERT INTO users(id, username, password) VALUES($1, $2, $3) RETURNING *
    `;
  const response = await client.query(SQL, [
    uuid.v4(),
    username,
    await bcrypt.hash(password, 5),
  ]);
  return response.rows[0];
};

//fetchUsers - returns an array of users in the database

const fetchUsers = async () => {
  const SQL = /*SQL*/ `
    SELECT * FROM users;
    `;
  const response = await client.query(SQL);
  return response.rows;
};

//fetchProducts - returns an array of products in the database

const fetchProduct = async () => {
  const SQL = /*SQL*/ `
    SELECT * FROM product;
    `;
  const response = await client.query(SQL);
  return response.rows;
};

//createFavorite - creates a favorite in the database and returns the created record

const createFavorite = async ({ user_id, product_id }) => {
  const SQL = /*SQL*/ `
    INSERT INTO favorite(id, user_id, product_id) VALUES ($1, $2, $3) RETURNING *
    `;
  const response = await client.query(SQL, [uuid.v4(), user_id, product_id]);
  return response.rows[0];
};

//fetchFavorites - returns an array favorites for a user

const fetchFavorite = async (id) => {
  const SQL = /*SQL*/ `
    SELECT * FROM favorite
    WHERE user_id = $1
    `;
  const response = await client.query(SQL, [id]);
  return response.rows;
};

//destroyFavorite - deletes a favorite in the database

const deleteFavorite = async ({ id, user_id }) => {
  const SQL = /*SQL*/ `
    DELETE FROM favorite
    WHERE id = $1 AND user_id = $2
    `;
  await client.query(SQL, [id, user_id]);
};

module.exports = {
  client,
  createTables,
  createUser,
  createProduct,
  fetchUsers,
  fetchProduct,
  createFavorite,
  fetchFavorite,
  deleteFavorite,
};
