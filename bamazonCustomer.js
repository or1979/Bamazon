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
    
    makePurchase();
  });

}

function makePurchase() {

  inquirer
    .prompt([{
      name: "customerProductChoice",
      type: "input",
      message: "What is the item ID of the product you would like to buy?",
    },

    {
      name: "customerUnits",
      type: "input",
      message: "How many units of the product would you like to purchase?",
    }
    ])

    .then(function (answer) {
      connection.query("SELECT * FROM products WHERE item_id = ?",

        [answer.customerProductChoice],

        function (err, product) {
          if (err) throw err;
          if (product[0].stock_quantity < answer.customerUnits) {
            console.log("Oh No! We're sold out right now!");
            anotherPurchase();


          } else {
            updateDB(answer.customerProductChoice, product[0].stock_quantity - answer.customerUnits);
            var totalAmount = parseInt(answer.customerUnits) * product[0].price;

            console.log("Thank You.  Your total is: $ " + totalAmount.toFixed(2));
            anotherPurchase();
          }
        });

    })

}

function updateDB(newQuantity, buy) {
  connection.query("UPDATE products SET stock_quantity =  ? WHERE item_id = ?",
    [{
      stock_quantity: newQuantity
    },
    {
      item_id: buy
    }
    ],
    function (err) {
      if (err) throw err;
      console.log("Purchase placed successfully!");
    }
  );
}
function anotherPurchase() {
  inquirer
  .prompt({
    type: "input",
    name: "response",
    message: "Would you like to begin again? (y/n)",
    validate: ans => ans === 'y' || ans === 'n'
  }).then(function(answer) {
    answer.response == 'y' ? displayAll() : db.end();
  })
}

allProductResults();
