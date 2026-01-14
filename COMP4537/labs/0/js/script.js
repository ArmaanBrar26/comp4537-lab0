import { MESSAGES } from "../lang/messages/en/user.js";

/**
 * Represents a clickable button in the game.
 * Each button has an order number and random color.
 */
export class Button {

    //Creates button with specified order and colour
    constructor(order, colour) {
        this.order = order;
        this.colour = colour;

        //Create actual button
        this.element = document.createElement("button");

        //Initialize styling and label
        this.initStyling();
        this.setLabel(this.order + 1);

        //Append buttons to the game container
        document.getElementById("gameContainer").appendChild(this.element);
    }

    initStyling() {
        this.element.style.height = "5em";
        this.element.style.width = "10em";
        this.element.style.backgroundColor = this.colour;
        this.element.style.position = "absolute";
    }

    //Sets order label on button
    setLabel(text) {
        this.element.textContent = text;
    }

    //Sets button location 
    setLocation(top, left) {
        this.element.style.top = top + "px";
        this.element.style.left = left + "px";
    }

    //Moves button to a random location within the game container
    moveRandomly() {
        const container = document.getElementById("gameContainer");

        const maxWidth = container.clientWidth - this.element.offsetWidth;
        const maxHeight = container.clientHeight - this.element.offsetHeight;

        const randomTop = Math.floor(Math.random() * maxHeight);
        const randomLeft = Math.floor(Math.random() * maxWidth);

        this.setLocation(randomTop, randomLeft);
    }
}

/**
 * Manages the game logic: creating buttons, scrambling them, and checking player input.
 */
export class GameManager {
    constructor() {
        this.buttons = [];
        this.clickCount = 0;
        this.n = 0;

        this.pauseTimeout = null;
        this.scrambleInterval = null;

        this.input = document.getElementById("button-count");
        this.gameContainer = document.getElementById("gameContainer");
    }

    /**
     * Starts the game with user-specified number of buttons.
     */
    startGame() {
        const value = parseInt(this.input.value);

        //validate input
        if (isNaN(value) || value < 3 || value > 7) {
            alert(MESSAGES.invalidInput);
            return;
        }

        //initialize game state and removes any previous buttons
        this.n = value;
        this.resetGame();
        this.createButtons();

        this.pauseTimeout = setTimeout(() => {
            this.scrambleButtons();
            this.pauseTimeout = null;
    }, this.n * 1000);
}

    /**
     * Clears previous game state.
     */
    resetGame() {

        //Clear initial pause timeout if exists
        if (this.pauseTimeout) {
            clearTimeout(this.pauseTimeout);
            this.pauseTimeout = null;
        }

        //Clear scrambling interval if it is running
        if(this.scrambleInterval) {
            clearInterval(this.scrambleInterval);
            this.scrambleInterval = null;
        }

        this.buttons.forEach(button =>
            this.gameContainer.removeChild(button.element));
            this.buttons = [];
            this.clickCount = 0;
    } 
    
    createButtons() {
        for (let i = 0; i < this.n; i++) {
            //Generates any random colour
            const randomColour = `#${Math.floor(Math.random()*16777215).toString(16)}`;
            const button = new Button(i, randomColour);
            button.setLocation(10, i * 170);
            this.buttons.push(button);
        }
    }

    /**
     * Moves buttons every 2 seconds randomly for the number of buttons specified
     */
    scrambleButtons() {
        let count = 0;
        
        this.scrambleInterval = setInterval(() => { 
            this.buttons.forEach(button => button.moveRandomly());
            count++;

            if (count >= 3) {
                clearInterval(this.scrambleInterval);
                this.scrambleInterval = null;
                this.enableUserInteraction();
            }
        }, 2000);
    }

    /**
     * Allows players to click the buttons after scrambling.
     */
    enableUserInteraction() {
        this.buttons.forEach(button => {
        button.setLabel("");
        button.element.onclick = () => this.handleButtonClick(button);
    });
    }

    /**
     * Checks if clicked button is in correct sequence.
     */
    handleButtonClick(clickedButton) {
        if (clickedButton.order === this.clickCount) {
            clickedButton.setLabel(clickedButton.order + 1);
            this.clickCount++;

            if (this.clickCount === this.n) {
                alert(MESSAGES.correctAnswer);
                this.disableButtons();
            }
    } else {
        alert(MESSAGES.incorrectAnswer);
        this.revealAllButtons();
        this.disableButtons();
        }
    }

    /**
     * Shows all button numbers when game ends.
     */
    revealAllButtons() {
        this.buttons.forEach(button =>
            button.setLabel(button.order + 1));
    }

    /**
     * Removes click handlers from buttons.
     */
    disableButtons() {
        this.buttons.forEach(button =>
            button.element.onclick = null);
    }
}

/**
 * Controls the overall app: initializes UI and starts game manager.
 */
export class AppController {
    constructor() {
        this.gameManager = new GameManager();

        this.inputLabel = document.getElementById("input-label");
        this.goButton = document.getElementById("go-button");
        this.title = document.getElementById("game-title");
        this.header = document.getElementById("header-message");

        this.init();
    }

    /**
     * Sets up UI text and event handlers.
     */
    init() {
        this.inputLabel.textContent = MESSAGES.prompt;
        this.goButton.textContent = MESSAGES.goButton;
        this.title.textContent = MESSAGES.gameTitle;
        this.header.textContent = MESSAGES.welcomeMessage;

        this.goButton.onclick = () => this.gameManager.startGame();
    }
}

new AppController();