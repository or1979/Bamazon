const mysql = require("mysql");
const inquirer = require("inquirer");
const table = require("table");


var connection = mysql.createConnection({
  host: "localhost",


  port: 3306,

  user: "root",

  password: "",
  database: "bamazon_DB"
});


connection.connect(function (err) {
  if (err) throw err;


  allProductResults();
});

function allProductResults() {
    connection.query("SELECT * FROM products", function (err, product) {
      const data = [
        ["Item ID", "Product Name", "Department", "Price", "Quantity"]
      ];
  
      for (var i = 0; i < product.length; i++) {
        data.push(
          [product[i].item_id, product[i].product_name, product[i].department_name, product[i].price, product[i].stock_quantity]
        );
      }
      const out = table.table(data);
      console.log(out);
      
      managerOptions();
    });
  
  }



function managerOptions () {
    inquirer
    .prompt([
        {
            type: "list",
            name: "options",
            message: "What would you like to do?",
            choices: [
                {
                    name:'View Products for Sale',
                    value: 'view_products'
                },
                {
                    name:'View Low Inventory', 
                    value: 'view_inventory'
                },
                {
                    name:'Add to Inventory', 
                    value: 'add_inventory'
                },
                {
                    name: 'Add New Product',
                    value: 'add_product'
                }
            ]
        }
    ])
    .then(function (userResponse) {
       if (userResponse.options === 'view_products') {
           displayProducts(); 
       }
       else if (userResponse.options === 'view_inventory') {
           displayLowInventory();
       }
       else if (userResponse.options === 'add_inventory') {
           addInventory();
       }
       else if (userResponse.options === 'add_product') {
           addProduct(); 
       }
    });
}

function displayProducts() {
    connection.query("SELECT * FROM products", function (err, product) {
        if (err) throw err;
        const data = [
            ["Item ID", "Product Name", "Department", "Price", "Quantity"]
          ];
      
          for (var i = 0; i < product.length; i++) {
            data.push(
              [product[i].item_id, product[i].product_name, product[i].department_name, product[i].price, product[i].stock_quantity]
            );
          }
          const out = table.table(data);
          console.log("Products Available for Sale");
          console.log(out);
            connection.end();
        });
   }
   
   function displayLowInventory() {
    connection.query("SELECT * FROM products WHERE  stock_quantity < 5", function (err, product) {
      if (err) throw err; 
      const data = [
        ["Item ID", "Product Name", "Department", "Price", "Quantity"]
      ];
  
      for (var i = 0; i < product.length; i++) {
        data.push(
          [product[i].item_id, product[i].product_name, product[i].department_name, product[i].price, product[i].stock_quantity]
        );
      }
      const out = table.table(data);
      console.log("Low Inventory Products")
      console.log(out);
      connection.end();
    });
} 

function addInventory() {
    inquirer
    .prompt ([ 
        {
            type: "input",
            name: "addInventory",
            message: "Which product would you like to update the quantity of?"
        },
        {
            type: "input", 
            name: "howMuch",
            message: "How many units would you like to add?",
        }
    ]).then(function(userResponse) {
        connection.query("SELECT * FROM products WHERE ?",
     {item_id: userResponse.addInventory
     }, function(err, products) {
         if (err) throw err; 
         
         if (typeof products != "undefined" && products != null && products.length > 0) {
             var newQuantity = products[0].stock_quantity + parseInt(userResponse.howMuch);
             connection.query("UPDATE products SET ? WHERE ?",
                 [
                     {
                         stock_quantity: newQuantity
                     },
                     {
                         item_id: userResponse.addInventory
                     }
                 ], function (err, products) {
                     console.log("Added " + userResponse.howMuch);
                 });
             } else {
                 console.log("Sorry" + " " + userResponse.addInventory + " is not a valid ID.");
             }
             connection.end(); 
         });
     });
 }
 
 function addProduct() {
     inquirer
     .prompt ([
        {
            type: "input",
            name: "productName",
            message: "What is the name of the product you would like to add?"
        },
        {
            type: "input",
            name: "department", 
            message: "Which department will this product be added to?"   
        },
        {
           type: "input",
           name: "price",
           message: "What is the price of the product?"
        },
        {
           type: "input", 
           name: "quantity", 
           message: "How many units would you like to add?"
        }
     ])
     .then(function(userResponse) {
         connection.query("INSERT INTO products SET ?",
         {
             product_name: userResponse.productName, 
             department_name: userResponse.department, 
             price: userResponse.price, 
             stock_quantity: userResponse.quantity
         },
             function(err, results) {
                 console.log("The product has been updated!");
                 connection.end(); 
             });
       
     });
 }
