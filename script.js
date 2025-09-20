// Variables d'état de la calculatrice
let firstOperand = null;
let secondOperand = null;
let currentOperation = null;
let shouldResetDisplay = false;
let lastButtonWasOperator = false;
let operationString = ''; // Nouvelle variable pour stocker l'opération en cours

// Éléments DOM
const display = document.getElementById('display-value');
const numberButtons = document.querySelectorAll('[data-number]');
const operatorButtons = document.querySelectorAll('[data-operator]');
const clearButton = document.querySelector('[data-action="clear"]');
const decimalButton = document.querySelector('[data-action="decimal"]');
const equalsButton = document.querySelector('[data-action="calculate"]');

// Fonctions mathématiques de base
function add(a, b) {
    return a + b;
}

function subtract(a, b) {
    return a - b;
}

function multiply(a, b) {
    return a * b;
}

function divide(a, b) {
    if (b === 0) {
        throw new Error("Division par zéro !");
    }
    return a / b;
}

// Fonction operate qui choisit l'opération appropriée
function operate(operator, a, b) {
    a = Number(a);
    b = Number(b);
    
    switch (operator) {
        case '+':
            return add(a, b);
        case '-':
            return subtract(a, b);
        case '*':
            return multiply(a, b);
        case '/':
            return divide(a, b);
        case '%':
            return a % b;
        default:
            return null;
    }
}

// Mise à jour de l'affichage
function updateDisplay(value) {
    // Arrondir les nombres avec de longues décimales
    if (typeof value === 'number') {
        // Limiter à 10 décimales maximum
        value = Math.round(value * 10000000000) / 10000000000;
    }
    
    // Convertir en chaîne et limiter la longueur
    let valueStr = String(value);
    if (valueStr.length > 10) {
        valueStr = parseFloat(valueStr).toExponential(5);
    }
    
    display.textContent = valueStr;
}

// Afficher l'opération en cours
function updateOperationDisplay() {
    if (operationString) {
        // Créer un élément séparé pour afficher l'opération en cours
        let operationDisplay = document.querySelector('.operation-display');
        if (!operationDisplay) {
            operationDisplay = document.createElement('div');
            operationDisplay.className = 'operation-display';
            display.parentNode.insertBefore(operationDisplay, display);
        }
        operationDisplay.textContent = operationString;
    }
}

// Réinitialiser l'affichage
function resetDisplay() {
    display.textContent = '0';
    shouldResetDisplay = false;
}

// Réinitialiser complètement la calculatrice
function clearCalculator() {
    firstOperand = null;
    secondOperand = null;
    currentOperation = null;
    shouldResetDisplay = false;
    lastButtonWasOperator = false;
    operationString = '';
    
    // Supprimer l'affichage de l'opération
    const operationDisplay = document.querySelector('.operation-display');
    if (operationDisplay) {
        operationDisplay.remove();
    }
    
    resetDisplay();
}

// Gestion de l'appui sur un bouton numérique
function handleNumber(number) {
    if (shouldResetDisplay || display.textContent === '0') {
        resetDisplay();
    }
    
    // Si le dernier bouton était un opérateur, on réinitialise l'affichage
    if (lastButtonWasOperator) {
        resetDisplay();
        lastButtonWasOperator = false;
    }
    
    // Ajouter le chiffre à l'affichage
    if (display.textContent === '0' && number !== '.') {
        display.textContent = number;
    } else {
        display.textContent += number;
    }
}

// Gestion de l'appui sur un opérateur
function handleOperator(operator) {
    const currentValue = display.textContent;
    
    // Si on a déjà une opération en cours, on calcule d'abord le résultat
    if (currentOperation !== null && !lastButtonWasOperator) {
        const result = operate(currentOperation, firstOperand, currentValue);
        updateDisplay(result);
        firstOperand = result;
        
        // Mettre à jour la chaîne d'opération
        operationString = `${firstOperand} ${getOperatorSymbol(operator)}`;
        updateOperationDisplay();
    } else if (firstOperand === null) {
        firstOperand = currentValue;
        
        // Créer la chaîne d'opération
        operationString = `${firstOperand} ${getOperatorSymbol(operator)}`;
        updateOperationDisplay();
    } else {
        // Mettre à jour seulement l'opérateur dans la chaîne d'opération
        operationString = `${firstOperand} ${getOperatorSymbol(operator)}`;
        updateOperationDisplay();
    }
    
    currentOperation = operator;
    shouldResetDisplay = true;
    lastButtonWasOperator = true;
}

// Obtenir le symbole de l'opérateur pour l'affichage
function getOperatorSymbol(operator) {
    switch (operator) {
        case '+': return '+';
        case '-': return '−';
        case '*': return '×';
        case '/': return '÷';
        case '%': return '%';
        default: return operator;
    }
}

// Gestion du calcul final
function handleEquals() {
    if (currentOperation === null || firstOperand === null) {
        return;
    }
    
    const currentValue = display.textContent;
    
    // Mettre à jour la chaîne d'opération complète
    operationString = `${firstOperand} ${getOperatorSymbol(currentOperation)} ${currentValue} =`;
    updateOperationDisplay();
    
    try {
        const result = operate(currentOperation, firstOperand, currentValue);
        updateDisplay(result);
        firstOperand = result;
        currentOperation = null;
        shouldResetDisplay = true;
        lastButtonWasOperator = false;
        
        // Réinitialiser la chaîne d'opération après un court délai
        setTimeout(() => {
            operationString = '';
            const operationDisplay = document.querySelector('.operation-display');
            if (operationDisplay) {
                operationDisplay.textContent = '';
            }
        }, 2000);
    } catch (error) {
        // Gestion de l'erreur de division par zéro
        updateDisplay("Erreur: " + error.message);
        clearCalculator();
    }
}

// Gestion de la virgule décimale
function handleDecimal() {
    if (shouldResetDisplay) {
        resetDisplay();
    }
    
    if (!display.textContent.includes('.')) {
        display.textContent += '.';
    }
    
    lastButtonWasOperator = false;
}

// Gestion du pourcentage
function handlePercentage() {
    const currentValue = parseFloat(display.textContent);
    updateDisplay(currentValue / 100);
}

// Gestion du retour arrière
function handleBackspace() {
    if (display.textContent.length === 1) {
        display.textContent = '0';
    } else {
        display.textContent = display.textContent.slice(0, -1);
    }
}

// Ajout des écouteurs d'événements

// Boutons numériques
numberButtons.forEach(button => {
    button.addEventListener('click', () => {
        handleNumber(button.getAttribute('data-number'));
    });
});

// Boutons d'opérateurs
operatorButtons.forEach(button => {
    button.addEventListener('click', () => {
        const operator = button.getAttribute('data-operator');
        
        if (operator === '%') {
            handlePercentage();
        } else if (operator === 'backspace') {
            handleBackspace();
        } else {
            handleOperator(operator);
        }
    });
});

// Bouton de réinitialisation
clearButton.addEventListener('click', () => {
    clearCalculator();
});

// Bouton décimal
decimalButton.addEventListener('click', () => {
    handleDecimal();
});

// Bouton égal
equalsButton.addEventListener('click', () => {
    handleEquals();
});

// Gestion du clavier
document.addEventListener('keydown', (event) => {
    if (/[0-9]/.test(event.key)) {
        handleNumber(event.key);
    } else if (event.key === '.') {
        handleDecimal();
    } else if (event.key === '+' || event.key === '-' || event.key === '*' || event.key === '/') {
        handleOperator(event.key);
    } else if (event.key === 'Enter' || event.key === '=') {
        handleEquals();
    } else if (event.key === 'Escape' || event.key === 'Delete') {
        clearCalculator();
    } else if (event.key === 'Backspace') {
        handleBackspace();
    } else if (event.key === '%') {
        handlePercentage();
    }
});

// Initialisation de la calculatrice
clearCalculator();