// IIFE allows data privacy by creating a new scope which is not visible from outside scope
var budgetController = ( function() {
        // Function Constructor
        var Expense = function(id, description, value) {
            this.id = id;
            this.description = description;
            this.value = value;
            this.percentage = -1;
        };

        Expense.prototype.calcPercentage = function(totalIncome) {
            if (totalIncome > 0) {
                this.percentage = Math.round((this.value / totalIncome ) * 100);
            }
        };

        Expense.prototype.getPercentage = function() {
            return this.percentage;
        }

        var Income = function(id, description, value) {
            this.id = id;
            this.description = description;
            this.value = value;
        };

        var calculateTotal = function(type) {
            var sum = 0;
            data.allItems[type].forEach(function(curr){
                sum += curr.value;
            });
            // Storing in our DS
            data.totals[type] = sum;
         }
        // Data Structure -> Object -> Array
        var data = {
            allItems: { 
                exp: [],    // allExpenses = []
                inc: []     // allIncome = []
            },
            totals: {       
                exp: 0,     // totalExpenses = 0
                inc: 0      // totalIncome = 0
            },
            budget: 0,
            percentage: -1  // -1 = Not existent at start
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

            // Type and ID to find what to delete
            deleteItem: function(type, id) {
                var ids, index;
                // id = 6 | [1 2 4 6 8] | index = 3
                // map receives a callback fun which has access to current, index and entire array
                // map vs forEach = map returns a brand new Array
                var ids = data.allItems[type].map(function(current) {
                    return current.id;
                    // ids = [1 2 4 6 8] | An array containing  all the IDS
                });

                index = ids.indexOf(id);

                // Now delete the index from array
                if (index !== -1) {
                    // splice -> array method to delete | input (index, noofElemets)
                    data.allItems[type].splice(index, 1);
                }
            },

            calculateBudget: function() {

                // Calculate total income and expense
                calculateTotal('inc');
                calculateTotal('exp');

                // Calculate the budget: income - expense
                data.budget = data.totals.inc - data.totals.exp;

                // Calculate the percentage of income we spent
                if (data.totals.inc > 0) {  // To escape infinity value
                    data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
                } else {
                    data.percentage = -1;
                }
                // Expense = 1== & Income = 200, spent = 50% = 100/200 = 0.5
            },

            calculatePercentages: function() {
                data.allItems.exp.forEach(function(current) {
                    current.calcPercentage(data.totals.inc);
                });
            },

            getPercentages: function() {
                var allPerc = data.allItems.exp.map(function(curr){
                    return curr.getPercentage();
                });
                return allPerc;
            },

             // To pass value to UI
            getBudget: function() {
                return {
                    budget: data.budget,
                    totalInc: data.totals.inc,
                    totalExp: data.totals.exp,
                    percentage: data.percentage
                }
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
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expenseLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expensePercLabel: '.item__percentage',
        dateLabel: '.budget__title--month'
    };

    var formatNumber = function(num, type) {
        var numSplit, int, dec;
        num = Math.abs(num); // Absolute: To remove + and - sign
        num = num.toFixed(2); // Two decimal places | a method of number prototype

        numSplit = num.split('.');
        int = numSplit[0];
        if (int.length > 3) {
            // substr() -> Returns part of string
            // Start at 0 | Read 1 element
            int = int.substr(0, int.length-3) + ',' + int.substr(int.length-3, int.length); 
            // input 23510 | output 23,510
        }

        dec = numSplit[1];

        // () will return + or -
        return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;
    };

    // To use forEach on a nodelist -> create our own forEach function for nodeList
    var nodeListForEach = function(list, callback) {
        for (var i = 0; i < list.length; i++) {
            // First class function | list[i] = current and i = index
            callback(list[i], i);
        }
    };

    return {
        // Public Method
        getInput: function() {
            return {
                // Properties
                type: document.querySelector(DOMstrings.inputType).value,
                description: document.querySelector(DOMstrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
            }
        }, 
        // obj - newItem obj from step 2
        addListItem: function(obj, type) {
            var html, newHtml, element;
            // Create HTML string with placeholder text
            if (type === 'inc') {
                element = DOMstrings.incomeContainer;
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
            } else if (type === 'exp') {
                element = DOMstrings.expenseContainer;
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
            }
            
            // Replace the placeholder text with some actual data
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));

            // Insert the HTML into the DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
        },

        deleteListItem : function(selectorID) {
            var el;
            // We cant delete and element directly | we need to select parent and remove Its child
            el = document.getElementById(selectorID);
            el.parentNode.removeChild(el);
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

        displayBudget: function(obj) {
            var type;
            obj.budget > 0 ? type = 'inc' : 'exp';

            document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget,type);
            document.querySelector(DOMstrings.incomeLabel).textContent =  formatNumber(obj.totalInc, 'inc');
            document.querySelector(DOMstrings.expenseLabel).textContent = formatNumber(obj.totalExp, 'exp');
            
            if (obj.percentage > 0) {
                document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';
            } else {
                document.querySelector(DOMstrings.percentageLabel).textContent = '---';
            }
        },

        displayPercentages: function(percentages) {
            
            // returns a list -> a nodeList (each element in domis called a Node)
            var fields = document.querySelectorAll(DOMstrings.expensePercLabel); 

            nodeListForEach(fields, function(current, index){
                if (percentages[index] > 0 ) {
                    current.textContent = percentages[index] + '%';
                } else {
                    current.textContent = '---';
                }
                
            });


        },

        displayMonth: function() {
            var now, month, months, year;
            
            now = new Date(); // current date

            months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            month = now.getMonth(); // current Month -> gives number

            year = now.getFullYear(); // current year
            document.querySelector(DOMstrings.dateLabel).textContent = months[month] + ' ' + year;
        },

        changedType: function() { 
            
            var fields = document.querySelectorAll(
                DOMstrings.inputType + ',' +
                DOMstrings.inputDescription + ',' +
                DOMstrings.inputValue);

            nodeListForEach(fields, function(cur){
              cur.classList.toggle('red-focus');
            });

            document.querySelector(DOMstrings.inputBtn).classList.toggle('red');
        },

        // Making DOM strings public for other modules
        getDOMstrings: function() {
            return DOMstrings;
        }
    }

} )();


// GLOBAL APP CONTROLLER: Connects UI and budget
// Use different name so that in fucture if any change made it could be easy to change
var controller = (function(budgetCtrl, UICtrl) {

    // Private Methods
    var setupEventListeners = function() {
        var DOM = UICtrl.getDOMstrings();

        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);

        document.addEventListener('keypress', function(event) {

            // which is for older browser support
            if (event.keyCode === 13 || event.which === 13) {
                ctrlAddItem();
            }
        });
        // Event Delegation -> setting event listner on parent
        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);

        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType);
   };

    var updateBudget = function() {

        // 1. Calculate the budget
        budgetCtrl.calculateBudget();

        // Return the budget
        var budget = budgetCtrl.getBudget();

        // 3. Display the budget on the UI
        UICtrl.displayBudget(budget);
    }

    var updatePercentages = function() {

        // 1. Calculate the percentages
        budgetCtrl.calculatePercentages();

        // 2. Read from budget Controller
        var percentages = budgetCtrl.getPercentages();

        // 3. Update the UI with new percentage
        UICtrl.displayPercentages(percentages);

    }

    var ctrlAddItem = function() {
        var input, newItem;
        // 1. Get the field input data
        input = UICtrl.getInput();

        if (input.description !== "" && !isNaN(input.value) && input.value > 0) {
            // 2. Add the item to the budget controller
            newItem = budgetCtrl.addItem(input.type, input.description, input.value);

            // 3. Add the item to the UI
            UIController.addListItem(newItem, input.type);

            // 4. Clear the fields
            UIController.clearFields();

            // 5. Calculate the budget and update budget
            updateBudget();

            // 6. Calculate and update percentages
            updatePercentages();
        }
   }

   var ctrlDeleteItem = function(event) {
        // By looking at the target propert of event we can find where the event was fired
        var itemID, splitID, type, ID;
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
        // only work if ID is present
        if (itemID) {
            //inc-1
            splitID = itemID.split('-');
            type = splitID[0];
            console.log(type);
            ID = parseInt(splitID[1]);

            // 1. Delete item from our Data structure
            budgetCtrl.deleteItem(type, ID);

            // 2. Delete item from UI
            UICtrl.deleteListItem(itemID);

            // 3. Update and show the new budget
            updateBudget();

            // 4. Calculate and update percentages
            updatePercentages();

        
        }

   };

// To make a public function return it
   return {
        init: function() {
            console.log('Application is started...');
            UICtrl.displayMonth();

            UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1
            })

            setupEventListeners();
        }
   }

})(budgetController, UIController);

// Code to start our application
controller.init();