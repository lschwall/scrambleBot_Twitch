// query selectors
const randomWordElement = document.querySelector('#word');
const definitionElement = document.querySelector('#definition');
const guesserElement = document.querySelector('#guesser');

let currentWord = '';
let currentDefinition = '';
let currentWinner = '';
let voteCount = 1;

let channelList = [
          'double0dad',
          'jenocide28',
          'Shievo',
          'saxxthehost',
          'Sarah_Nicolez',
          'Scoopie5',
          'test_account_bot123'
]


const scrambleWord = (word) => {
          const inputWord = [...word];
          let scrambledWord = '';
          while (inputWord.length) {
                    const randomIndex = Math.floor(Math.random() * inputWord.length)
                    const randomLetter = inputWord[randomIndex];
                    scrambledWord += randomLetter;
                    inputWord.splice(randomIndex, 1);
          }
          return scrambledWord.toLowerCase();
};

const getRandomWord = async () => {
          const response = await fetch(`https://random-words-api.vercel.app/word`)
          const json = await response.json();
          const [{ word, definition }] = json;
          return { word, definition };
}

const resetGame = ({ word, definition }) => {
          console.log(word.toLowerCase())
          currentWord = word.toLowerCase();
          currentDefinition = definition;
          currentWinner = '';
          randomWordElement.textContent = scrambleWord(word);
          definitionElement.textContent = currentDefinition;
}

const client = new tmi.Client({
          identity: {
                    username: 'ChatBot',
                    password: 'wxdl8v8owkp9y8rsoeo6aij2xrgps5'
          },
          connection: { reconnect: true, },
          channels: channelList
});

client.connect();

client.on('message', (channel, tags, message, self) => {
          //if it isnt the current word do nothing
          if (!currentWord) return;
          const [command, ...args] = message.split(' '); // command = !guess // ...args = anything else
          //!vote skip to vote to re-scramble/skip the current word 
          if (command === '!skip') {
                    if (voteCount != 3) {
                              client.say(channel, `Vote (${voteCount}/3). ${3 - voteCount} left to skip!`)
                              voteCount += 1;
                    } else {
                              client.say(channel, `Vote (${voteCount}/3). Re-scrambling!`)
                              getRandomWord()
                                        .then(resetGame)
                                        .then(voteCount = 1)
                    }
          }
          //!color <#hexcode> <colorChoice> to change color of shadow
          if (command === '!color') {
                    const colorChoice = args.join(' '); // gets <#hexcode> or <colorChoice>
                    if (colorChoice === 'reset') {
                              $('#word').css('text-shadow', `0px 0px 10px #C09AFF`);
                              $('#definition').css('color', `#5353f1`);
                              $('#definition').css('text-shadow', `0px 0px 1px #C09AFF`);
                              $('#guesser').css('color', `#5353f1`);
                              $('#guesser').css('text-shadow', `0px 0px 1px #C09AFF}`);
                    } else {
                              $('#word').css('text-shadow', `0px 0px 10px ${colorChoice}`);
                              $('#definition').css('color', `white`);
                              $('#definition').css('text-shadow', `0px 0px 1px ${colorChoice}`);
                              $('#guesser').css('color', `white`);
                              $('#guesser').css('text-shadow', `0px 0px 1px ${colorChoice}`);
                    }
          }
          //!guess <word> to solve
          if (command === '!guess') {
                    if (currentWinner) return;
                    const guess = args.join(' ');
                    if (guess === currentWord) {
                              randomWordElement.textContent = currentWord;
                              definitionElement.textContent = currentDefinition;
                              currentWinner = tags['user-id'];
                              client.say(channel, `Winner, @${tags['display-name']}, that is Correct!`)
                              guesserElement.textContent = `${tags['display-name']} has guessed the correct word!`
                    } else {
                              client.say(channel, `Sorry, @${tags['display-name']}, that is wrong!`)
                    }
          }

          if (tags['user-id'] === currentWinner) {
                    getRandomWord()
                              .then(resetGame)
          }
});

getRandomWord()
          .then(resetGame);