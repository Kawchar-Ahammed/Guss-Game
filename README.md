# Guess Number Game

## Overview
The **Guess Number** game is a fun and interactive game where the player has to guess a randomly generated number within a specified range. As the player progresses, the difficulty increases, and they move up levels by correctly guessing the number. Players lose a heart (life) for each incorrect guess, and if they run out of hearts, the game restarts.

## Game Flow

### 1. Start Game
- **Goal:** Begin a new game session.
- **When:** The game starts when the user clicks the "Start Game" button on the `index.html` page, which redirects them to the `2nd_page.html` page.
- **How:**
  - The `2nd_page.html` page loads, and the game initializes with the following settings:
    - **Hearts (lives):** 10
    - **Points:** 0
    - **Level:** 1
    - **Random Number:** A random number between 0 and 10 (can increase based on the level).
- **Interaction:** The player is asked to guess a number within the specified range. They will enter their guess in an input box, and upon clicking "Check", the game checks if the guess is correct.

### 2. Game Operation
#### Guessing Logic:
- **When the user enters a number and clicks "Check":**
  - The entered guess is compared to a randomly generated number.
  - **Correct Guess:**
    - If the guess is correct:
      - The level increases by 1.
      - The maximum number range for guessing also increases by a factor of 10.
      - The points increase by 100 for each correct guess.
      - The heart count resets to 10.
      - The chosen numbers are cleared.
      - A new random number is generated within the updated range.
  - **Incorrect Guess:**
    - If the guess is incorrect:
      - The heart count decreases by 1.
      - If the guess is too high, the system instructs the user to guess a lower number.
      - If the guess is too low, the system instructs the user to guess a higher number.
      - If the heart count reaches 0, the game restarts (game over).
  
#### Updating Chosen Numbers:
- After each guess, the system stores the guessed number in the `chosenNumbers` array and displays it on the screen, helping the player keep track of their previous guesses.

### 3. Game Over:
- **When:** The game resets if the player runs out of hearts (i.e., makes too many incorrect guesses).
- **How:**
  - The heart count, points, level, and other settings are reset to their initial values.
  - The user is informed that the game has restarted after a short delay.
  - The user can either start a new game or quit by clicking the "Quit Game" button, which navigates back to the `index.html` page.

### 4. Quit Game
- **Goal:** Allow the user to quit the game and return to the home page (`index.html`).
- **When:** The user clicks the "Quit Game" button, which has a link that redirects them back to the `index.html` page.
- **How:** This navigation to the home page does not affect the game state on the `2nd_page.html`, effectively ending the current session. The user can start a new game from the home page.

## Files
- **index.html**: The home page where the user starts the game.
- **2nd_page.html**: The game page where the main game logic occurs.
- **random_number.js**: Contains the JavaScript logic for generating random numbers, checking guesses, and handling the game flow.
- **style.css**: Styles for the home page (`index.html`).
- **2nd_page.css**: Styles for the game page (`2nd_page.html`).

## How to Play
1. Start the game by clicking the "Start Game" button on the home page (`index.html`).
2. On the game page, guess the number within the current range.
3. If your guess is correct, level up and try again with a larger number range.
4. If your guess is incorrect, your hearts decrease. You will be instructed whether your guess was too high or too low.
5. If you run out of hearts, the game restarts.
6. You can quit the game anytime by clicking the "Quit Game" button.

## Technologies Used
- HTML5
- CSS3
- JavaScript

## Credits
Developed by Kawchar Ahammed
