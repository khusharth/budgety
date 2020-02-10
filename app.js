// IIFE allows data privacy by creating a new scope which is not visible from outside scope
var budgetController = ( function() {




} )(); 

var UIController = ( function() {

    var DOMstrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
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

    // 1. Get the field input data
    var input = UICtrl.getInput();
    console.log(input);

    // 2. Add the item to the budget controller

    // 3. Add the item to the UI

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