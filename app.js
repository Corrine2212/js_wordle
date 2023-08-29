// handle a keystroke with a letter
// handle a wrong keystroke e.g. number or spacebar. ignore it
// handle enter when the word is complete (go to next line)
// handle enter when the word is incomplete (ignore it)
// handle backspace when there's a letter to delete
// handle backspace when there's no letter to delete

// handle the api request to get the word of the day
// handle checking if the word submitted after user hits enter is the word of the day.

// handle the win condition alert(you win!)
// handle the lose condition alert(you lose, the word was ...)
// handle the guesses correct letter in the correct space (green squares)
// handle the guesses wrong letter outright (gray squares)
// handle the yellow squares
// correct letters, wrong space (yellow squares)
// Handle the yellow squares correctly. For example, if the player guesses "SPOOL" and the word is "OVERT", one "O" is shown as yellow and the second one is not. Green squares count too.

// loading spinner which indicates user is waiting for api
// add second api call to make sure user is requesting a real word
// row of boxes highlight red when the guess isnt a real word
// fun animation for when the user wins e.g. title flashes rainbow colors

const answerLength = 5;
const rounds = 6;
const letters = document.querySelectorAll('.scoreboard-letter');
const loadingDiv = document.querySelector('.info-bar')

async function init() {
    let currentGuess = "";
    let currentRow = 0;
    let isLoading = true;

    const res = await fetch('https://words.dev-apis.com/word-of-the-day')
    const resObj = await res.json();
    // const { word } = await res.json();
    const word = resObj.word.toUpperCase();
    const wordParts = word.split('');
    console.log("the word of the day is: " + word);
    isLoading = false;
    let done = false;
    setLoading(isLoading);

    function addLetter(letter) {
        if (currentGuess.length < answerLength) {
            currentGuess += letter;
        } else {
            // replaces the last letter
            currentGuess = currentGuess.substring(0, currentGuess.length - 1) + letter;
        }
        letters[answerLength * currentRow + currentGuess.length - 1].innerText = letter;
    }

    async function commit() {
        if (currentGuess.length !== answerLength) {
            // do nothing
            return;
        }

        // validate the word
        isLoading = true;
        setLoading(isLoading);
        const res = await fetch('https://words.dev-apis.com/validate-word', {
            method: 'POST',
            body: JSON.stringify({ word: currentGuess })
        });

        const resObj = await res.json();
        const validWord = resObj.validWord;
        // const { validWord } = resObj; <- this is destructuring

        isLoading = false;
        setLoading(false);

        if (!validWord) {
            markInvalidWord();
            return;
        }

        // do all the marking as 'correct' 'close' or 'wrong'
        const guessParts = currentGuess.split('');
        const map = makeMap(wordParts);
        console.log(map);

        for (let i = 0; i < answerLength; i++) {
            // mark as correct
            if (guessParts[i] === wordParts[i]) {
                letters[currentRow * answerLength + i].classList.add("correct");
                map[guessParts[i]]--;
            }
        }

        for (let i = 0; i < answerLength; i++) {
            if (guessParts[i] === wordParts[i]) {
                // do nothing, we already did it
            } else if (wordParts.includes(guessParts[i]) && map[guessParts[i] > 0]) {
                // mark as close
                letters[currentRow * answerLength + i].classList.add("close");
                map[guessParts[i]]--;
            } else {
                // wrong
                letters[currentRow * answerLength + i].classList.add("wrong");
            }
        }
        currentRow++;

        // did user win or lose?
        if (currentGuess === word) {
            // win
            alert("you win!!")
            document.querySelector('.brand').classList.add("winner");
            done = true;
        } else if (currentRow === rounds) {
            alert(`you lose! the word was ${word}`)
            done = true;
        }
        currentGuess = '';
    }

    function backspace() {
        currentGuess = currentGuess.substring(0, currentGuess.length - 1);
        letters[answerLength * currentRow + currentGuess.length].innerText = "";
    }

    function markInvalidWord() {
        // alert("Not a valid word");

        for (let i = 0; i < answerLength; i++) {
            letters[currentRow * answerLength + i].classList.remove('invalid');

            setTimeout(function () {
                letters[currentRow * answerLength + i].classList.add('invalid');
            }, 10);
        }
    }

    document.addEventListener('keydown', function handleKeyPress(event) {
        if (done || isLoading) {
            // do nothing;
            return;
        }
        const action = event.key;
        console.log(action);

        if (action === 'Enter') {
            commit(); //user trying to commit a guess
        } else if (action === 'Backspace') {
            backspace();
        } else if (isLetter(action)) {
            addLetter(action.toUpperCase());
        } else {
            // do nothing
        }
    });

    function isLetter(letter) {
        return /^[a-zA-Z]$/.test(letter);
    }

    function setLoading(isLoading) {
        loadingDiv.classList.toggle('show', isLoading);
    }

    function makeMap(array) {
        const obj = {};
        for (let i = 0; i < array.length; i++) {
            const letter = array[i];
            if (obj[letter]) {
                obj[letter]++;
            } else {
                obj[letter] = 1;
            }
        }
        return obj;
    }
}

init();



// process / approach
// target all the elements that are going to change
// break everything down into smaller problems
