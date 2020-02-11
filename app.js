// IIFE allows data privacy by creating a new scope which is not visible from outside scope
var budgetController = ( function() {
        // Function Constructor
        var Expense = function(id, description, value) {
            this.id = id;
            this.description = description;
            this.value = value;
        };

        var Income = function(id, description, value) {
            this.id = id;
            this.description = description;
            this.value = value;
        };

        // Data Structure -> Object -> Array
        var data = {
            allItems: { 
                exp: [],    // allExpenses = []
                inc: []     // allIncome = []
            },
            totals: {       
                exp: 0,     // totalExpenses = 0
                inc: 0      // totalIncome = 0
            }
        }

        return {
            addItem: function(type, des, val) {
                var newItem, ID;

                // [1 2 3 4 5], next ID = 6
                // [1 2 4 6 8], next ID = 9
                // ID = last ID + 1

                // Create ID
                if (data.allItems[type].length > 0) {
                    ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
                } else {
                    ID = 0;
                }
                

                // Create new item based on 'inc' or 'exp' type
                if (type === 'exp') {
                    newItem = new Expense(ID, des, val);
                } else if (type === 'inc') {
                    newItem = new Income(ID, des, val);
                }

                // Push it into our data structure
                data.allItems[type].push(newItem);

                // Return the newItem
                return newItem;
            },

            testing: function() {
                console.log(data);
            }
        }

} )(); 

var UIController = ( function() {

    var DOMstrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expenseContainer: '.expenses__list',
    };

    return {
        // Public Method
        getInput: function() {
            return {
                // Properties
                type: document.querySelector(DOMstrings.inputType).value,
                description: document.querySelector(DOMstrings.inputDescription).value,
                value: document.querySelector(DOMstrings.inputValue).value
            }
        }, 
        // obj - newItem obj from step 2
        addListItem: function(obj, type) {
            var html, newHtml, element;
            // Create HTML string with placeholder text
            if (type === 'inc') {
                element = DOMstrings.incomeContainer;
                html = '<div class="item clearfix" id="income-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">+ %value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
            } else if (type === 'exp') {
                element = DOMstrings.expenseContainer;
                html = '<div class="item clearfix" id="expense-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">- %value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
            }
            
            // Replace the placeholder text with some actual data
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', obj.value);

            // Insert the HTML into the DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
        },
        // To clear input field after entering a value
        clearFields: function() {
            var fields, fieldsArr;
            // querySelector outputs a list not an array | List dont have methods like array
            fields = document.querySelectorAll(DOMstrings.inputDescription + ', ' + DOMstrings.inputValue);
            // Tricking slice toconvert list to array
            fieldsArr = Array.prototype.slice.call(fields);

            fieldsArr.forEach(function(current, index, array){
                current.value = "";
            });

            // Set focus on first element of array | [0] is Add description
            fieldsArr[0].focus();
        },

        // Making DOM strings public for other modules
        getDOMstrings: function() {
            return DOMstrings;
        }
    }

} )();


// Connects UI and budget
// Use different name so that in fucture if any change made it could be easy to change
var controller = (function(budgetCtrl, UICtrl) {

    // Private Methods
    var setupEventListeners = function() {
        var DOM = UIController.getDOMstrings();

        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);

        document.addEventListener('keypress', function(event) {

            // which is for older browser support
            if (event.keyCode === 13 || event.which === 13) {
                ctrlAddItem();
            }
        });
   };

   var ctrlAddItem = function() {
    var input, newItem;
    // 1. Get the field input data
    input = UICtrl.getInput();

    // 2. Add the item to the budget controller
    newItem = budgetCtrl.addItem(input.type, input.description, input.value);

    // 3. Add the item to the UI
    UIController.addListItem(newItem, input.type);

    // 4. Clear the fields
    UIController.clearFields();
    
    // 4. Calculate the budget

    // 5. Display the budget on the UI

   }

// To make a public function return it
   return {
        init: function() {
            console.log('Application is started...');
            setupEventListeners();
        }
   }

})(budgetController, UIController);

// Code to start our application
controller.init();